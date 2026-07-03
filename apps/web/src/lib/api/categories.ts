import { apiFetch } from './client';
import type { Category, CreateCategoryInput, UpdateCategoryInput } from '@nama/shared';

export const categoriesApi = {
  async getAll() {
    return apiFetch<{ categories: Category[] }>('/categories', {
      method: 'GET',
    });
  },

  async getById(id: string) {
    return apiFetch<{ category: Category }>(`/categories/${id}`, {
      method: 'GET',
    });
  },

  async create(data: CreateCategoryInput) {
    return apiFetch<{ category: Category }>('/categories', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async update(id: string, data: UpdateCategoryInput) {
    return apiFetch<{ category: Category }>(`/categories/${id}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  async delete(id: string) {
    return apiFetch<void>(`/categories/${id}`, {
      method: 'DELETE',
    });
  },

  async getUploadUrl(mimeType: string, fileSizeBytes: number) {
    return apiFetch<{ uploadUrl: string; fileUrl: string }>('/categories/upload-url', {
      method: 'POST',
      body: JSON.stringify({ mimeType, fileSizeBytes }),
    });
  },
};
