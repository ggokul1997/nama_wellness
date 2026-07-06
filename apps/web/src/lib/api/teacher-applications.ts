import { apiFetch } from './client';
import type { TeacherApplication, DocumentType } from '@nama/shared';

export const teacherApplicationsApi = {
  async getMyApplication() {
    return apiFetch<{ application: TeacherApplication | null }>('/teacher-applications/my-application', {
      method: 'GET',
      cache: 'no-store',
    });
  },

  async startApplication() {
    return apiFetch<{ application: TeacherApplication }>('/teacher-applications/start', {
      method: 'POST',
    });
  },

  async getPresignedUrl(data: {
    applicationId: string;
    documentType: DocumentType;
    mimeType: string;
    fileSizeBytes: number;
  }) {
    return apiFetch<{ uploadUrl: string; fileUrl: string; documentId: string }>('/teacher-applications/presigned-url', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  async submitApplication(id: string, data: { firstName: string, lastName: string, teachingSubject: string }) {
    return apiFetch<{ application: TeacherApplication }>(`/teacher-applications/${id}/submit`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Admin methods
  async getPending() {
    return apiFetch<{ applications: TeacherApplication[] }>('/teacher-applications/pending', {
      method: 'GET',
    });
  },

  async reviewApplication(id: string, data: { approve: boolean; rejectionReason?: string }) {
    return apiFetch<{ application: TeacherApplication }>(`/teacher-applications/${id}/review`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },
};
