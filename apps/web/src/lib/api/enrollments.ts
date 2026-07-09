import { apiFetch } from './client';
import type { Enrollment, MyCourseResponse, LessonProgress, UpdateLessonProgressInput, AdminAssignInput } from '@nama/shared';

export const enrollmentsApi = {
  // Admin Routes
  async adminAssign(data: AdminAssignInput) {
    return apiFetch<{ enrollment: Enrollment }>('/enrollments/admin/assign', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Student Routes
  async getMyCourses() {
    return apiFetch<{ enrollments: MyCourseResponse[] }>('/enrollments/my-courses');
  },

  async getCompanyAvailableCourses() {
    return apiFetch<{ licenses: any[] }>('/enrollments/company-available');
  },

  async enrollViaCompany(courseId: string) {
    return apiFetch<{ enrollment: Enrollment }>(`/enrollments/company-enroll/${courseId}`, {
      method: 'POST'
    });
  },

  async getCourseProgress(courseId: string) {
    return apiFetch<{ enrollment: Enrollment }>(`/enrollments/${courseId}/progress`);
  },

  async updateLessonProgress(courseId: string, lessonId: string, data: UpdateLessonProgressInput) {
    return apiFetch<{ progress: LessonProgress }>(`/enrollments/${courseId}/lessons/${lessonId}/progress`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  }
};
