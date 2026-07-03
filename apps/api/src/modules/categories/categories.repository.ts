import type { Category, Prisma } from '@prisma/client';
import { prisma } from '../../infrastructure/database/prisma.client.js';

export const categoriesRepository = {
  async findAll(): Promise<Category[]> {
    return prisma.category.findMany({
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findActive(): Promise<Category[]> {
    return prisma.category.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: 'asc' },
    });
  },

  async findById(id: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { id },
    });
  },

  async findBySlug(slug: string): Promise<Category | null> {
    return prisma.category.findUnique({
      where: { slug },
    });
  },

  async create(data: Prisma.CategoryCreateInput): Promise<Category> {
    return prisma.category.create({
      data,
    });
  },

  async update(id: string, data: Prisma.CategoryUpdateInput): Promise<Category> {
    return prisma.category.update({
      where: { id },
      data,
    });
  },

  async delete(id: string): Promise<void> {
    await prisma.category.delete({
      where: { id },
    });
  },
};
