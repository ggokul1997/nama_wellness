import { apiFetch } from './client';
import type { CreateCourseInput, UpdateCourseInput, Course, CourseModule, CreateModuleInput, UpdateModuleInput, Lesson, CreateLessonInput, UpdateLessonInput, ProposePricingInput, CoursePricing, ReviewCourseInput, UpdateCorporateSettingsInput } from '@nama/shared';

export const coursesApi = {
  getMyCourses: () => 
    apiFetch<{ courses: Course[] }>('/courses/my-courses'),
    
  getPublicCourses: () =>
    apiFetch<{ courses: Course[] }>('/courses/public'),

  getCorporateCourses: () =>
    apiFetch<{ courses: Course[] }>('/courses/corporate'),

  getPublicCourseBySlug: (slug: string) =>
    apiFetch<{ course: Course }>(`/courses/public/${slug}`),

  getPublicCourseById: (id: string) => 
    apiFetch<{ course: Course }>(`/courses/public/id/${id}`),

  getCourse: (id: string) => 
    apiFetch<{ course: Course }>(`/courses/${id}`),

  createCourse: (data: CreateCourseInput) =>
    apiFetch<{ course: Course }>('/courses', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateCourse: (id: string, data: UpdateCourseInput) =>
    apiFetch<{ course: Course }>(`/courses/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),
    
  updateCorporateSettings: (id: string, data: UpdateCorporateSettingsInput) =>
    apiFetch<{ course: Course }>(`/courses/admin/${id}/corporate`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getPresignedCoverUrl: (id: string, mimeType: string, fileSizeBytes: number) =>
    apiFetch<{ uploadUrl: string; fileUrl: string }>(`/courses/${id}/cover/presign`, {
      method: 'POST',
      body: JSON.stringify({ mimeType, fileSizeBytes }),
    }),

  deleteCourse: (id: string) =>
    apiFetch<{ message: string }>(`/courses/${id}`, {
      method: 'DELETE',
    }),

  // Modules
  getModules: (courseId: string) =>
    apiFetch<{ modules: CourseModule[] }>(`/courses/${courseId}/modules`),

  createModule: (courseId: string, data: CreateModuleInput) =>
    apiFetch<{ module: CourseModule }>(`/courses/${courseId}/modules`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateModule: (courseId: string, moduleId: string, data: UpdateModuleInput) =>
    apiFetch<{ module: CourseModule }>(`/courses/${courseId}/modules/${moduleId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteModule: (courseId: string, moduleId: string) =>
    apiFetch<{ message: string }>(`/courses/${courseId}/modules/${moduleId}`, {
      method: 'DELETE',
    }),

  // Lessons
  createLesson: (courseId: string, moduleId: string, data: CreateLessonInput) =>
    apiFetch<{ lesson: Lesson }>(`/courses/${courseId}/modules/${moduleId}/lessons`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  updateLesson: (courseId: string, moduleId: string, lessonId: string, data: UpdateLessonInput) =>
    apiFetch<{ lesson: Lesson }>(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  deleteLesson: (courseId: string, moduleId: string, lessonId: string) =>
    apiFetch<{ message: string }>(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}`, {
      method: 'DELETE',
    }),

  getPresignedLessonUrl: (courseId: string, moduleId: string, lessonId: string, mimeType: string, fileSizeBytes: number) =>
    apiFetch<{ uploadUrl: string; fileUrl: string }>(`/courses/${courseId}/modules/${moduleId}/lessons/${lessonId}/upload/presign`, {
      method: 'POST',
      body: JSON.stringify({ mimeType, fileSizeBytes }),
    }),

  // Publishing Workflow
  proposePricing: (courseId: string, data: ProposePricingInput) =>
    apiFetch<{ pricing: CoursePricing }>(`/courses/${courseId}/pricing`, {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  deletePricing: (courseId: string) =>
    apiFetch<{ message: string }>(`/courses/${courseId}/pricing`, {
      method: 'DELETE',
    }),

  submitForReview: (courseId: string) =>
    apiFetch<{ course: Course }>(`/courses/${courseId}/submit`, {
      method: 'POST',
    }),

  clearCourseFeedback: (courseId: string) =>
    apiFetch<{ course: Course }>(`/courses/${courseId}/clear-feedback`, {
      method: 'PATCH',
    }),

  // Admin Methods
  adminGetPendingCourses: () =>
    apiFetch<{ courses: Course[] }>('/courses/admin/pending'),

  adminGetCourse: (courseId: string) =>
    apiFetch<{ course: Course }>(`/courses/admin/${courseId}`),

  adminReviewCourse: (courseId: string, data: ReviewCourseInput) =>
    apiFetch<{ course: Course }>(`/courses/admin/${courseId}/review`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  adminPublishCourse: (courseId: string) =>
    apiFetch<{ course: Course }>(`/courses/admin/${courseId}/publish`, {
      method: 'POST',
    }),
};
