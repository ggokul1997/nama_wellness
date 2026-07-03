import type { CreateCategoryInput, UpdateCategoryInput } from '@nama/shared';
import type { Category } from '@prisma/client';
import { categoriesRepository } from './categories.repository.js';
import { Errors } from '../../utils/errors.js';
import { slugify } from '../../utils/slugify.js';
import { s3Utils } from '../../utils/s3.js';
import { v4 as uuidv4 } from 'uuid';

export const categoriesService = {
  async getAllCategories(includeInactive: boolean = false): Promise<Category[]> {
    if (includeInactive) {
      return categoriesRepository.findAll();
    }
    return categoriesRepository.findActive();
  },

  async getCategoryById(id: string): Promise<Category> {
    const category = await categoriesRepository.findById(id);
    if (!category) {
      throw Errors.notFound('Category');
    }
    return category;
  },

  async createCategory(input: CreateCategoryInput): Promise<Category> {
    const slug = slugify(input.name);
    
    const existing = await categoriesRepository.findBySlug(slug);
    if (existing) {
      throw Errors.conflict('A category with this name already exists');
    }

    return categoriesRepository.create({
      name: input.name,
      slug,
      description: input.description,
      iconUrl: input.iconUrl,
      isActive: input.isActive ?? true,
      sortOrder: input.sortOrder ?? 0,
    });
  },

  async updateCategory(id: string, input: UpdateCategoryInput): Promise<Category> {
    const category = await categoriesRepository.findById(id);
    if (!category) {
      throw Errors.notFound('Category');
    }

    let slug = category.slug;
    if (input.name && input.name !== category.name) {
      slug = slugify(input.name);
      const existing = await categoriesRepository.findBySlug(slug);
      if (existing && existing.id !== id) {
        throw Errors.conflict('A category with this name already exists');
      }
    }

    return categoriesRepository.update(id, {
      name: input.name,
      slug,
      description: input.description,
      iconUrl: input.iconUrl,
      isActive: input.isActive,
      sortOrder: input.sortOrder,
    });
  },

  async deleteCategory(id: string): Promise<void> {
    const category = await categoriesRepository.findById(id);
    if (!category) {
      throw Errors.notFound('Category');
    }

    // In a real application, you might want to check if the category is used by courses before deleting.
    // For now, Prisma's foreign key constraints (or lack thereof if action isn't restrict) handles this.
    // Assuming we want to hard delete:
    await categoriesRepository.delete(id);
  },

  async getPresignedUploadUrl(mimeType: string, fileSizeBytes: number) {
    if (fileSizeBytes > 1024 * 1024) {
      throw Errors.badRequest('File size must be under 1MB');
    }

    const ext = mimeType.split('/')[1] || 'bin';
    const key = `categories/icons/${uuidv4()}.${ext}`;
    
    const { uploadUrl, fileUrl } = await s3Utils.generatePresignedUploadUrl(key, mimeType);

    return { uploadUrl, fileUrl };
  }
};
