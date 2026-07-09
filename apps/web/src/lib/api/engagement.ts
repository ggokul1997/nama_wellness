import { apiFetch } from './client';
import type { Review, LiveSession, Certificate, Notification, CreateReviewInput, ScheduleLiveSessionInput } from '@nama/shared';

export const engagementApi = {
  // Reviews
  createReview: (data: CreateReviewInput) => {
    return apiFetch<Review>('/reviews', {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true
    });
  },
  getCourseReviews: (courseId: string) => {
    return apiFetch<Review[]>(`/reviews/${courseId}`);
  },

  // Live Sessions
  scheduleSession: (courseId: string, data: ScheduleLiveSessionInput) => {
    return apiFetch<LiveSession>(`/live-sessions/course/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true
    });
  },
  getCourseSessions: (courseId: string) => {
    return apiFetch<LiveSession[]>(`/live-sessions/course/${courseId}`);
  },
  getStudentBookings: () => {
    return apiFetch<LiveSession[]>('/live-sessions/student/bookings', { auth: true });
  },
  getTeacherBookings: () => {
    return apiFetch<LiveSession[]>('/live-sessions/teacher/bookings', { auth: true });
  },
  deleteSession: (sessionId: string) => {
    return apiFetch<{ success: boolean }>(`/live-sessions/${sessionId}`, {
      method: 'DELETE',
      auth: true
    });
  },

  // Certificates
  issueCertificate: (courseId: string) => {
    return apiFetch<Certificate>('/certificates/issue', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
      auth: true
    });
  },
  getMyCertificates: () => {
    return apiFetch<Certificate[]>('/certificates/me', { auth: true });
  },

  // Notifications
  getMyNotifications: () => {
    return apiFetch<Notification[]>('/notifications', { auth: true });
  },
  markAsRead: (notificationId: string) => {
    return apiFetch<{ success: boolean }>(`/notifications/${notificationId}/read`, {
      method: 'PUT',
      auth: true
    });
  },
  markAllAsRead: () => {
    return apiFetch<{ success: boolean }>('/notifications/mark-all-read', {
      method: 'PUT',
      auth: true
    });
  },
};
