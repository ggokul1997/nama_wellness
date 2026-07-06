import { apiFetch } from './client';
import type { StudyMaterial, CreateStudyMaterialInput, ReviewStudyMaterialInput } from '@nama/shared';

export const studyMaterialsApi = {
  // Teacher API
  async getUploadUrl(courseId: string, mimeType: string, fileSizeBytes: number) {
    return apiFetch<{ url: string; fileUrl: string; key: string }>(`/study-materials/course/${courseId}/upload-url`, {
      method: 'POST',
      body: JSON.stringify({ mimeType, fileSizeBytes }),
    });
  },

  async create(courseId: string, data: CreateStudyMaterialInput) {
    return apiFetch<{ material: StudyMaterial }>(`/study-materials/course/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async getCourseMaterials(courseId: string) {
    return apiFetch<{ materials: StudyMaterial[] }>(`/study-materials/course/${courseId}`, {
      method: 'GET',
    });
  },

  // Admin API
  async getPending() {
    return apiFetch<{ materials: StudyMaterial[] }>('/study-materials/admin/pending', {
      method: 'GET',
    });
  },

  async review(id: string, data: ReviewStudyMaterialInput) {
    return apiFetch<{ material: StudyMaterial }>(`/study-materials/admin/${id}/review`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Student/General API
  async getDownloadUrl(id: string) {
    return apiFetch<{ url: string }>(`/study-materials/${id}/download`, {
      method: 'GET',
    });
  }
};
