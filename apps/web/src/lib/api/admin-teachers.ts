import { apiFetch } from './client';
import type { 
  AdminTeacherSummary, 
  AdminTeacher, 
  AdminTeacherDetails,
  AdminTeacherCourse,
  AdminTeacherStudent,
  AdminTeacherReview,
  AdminTeacherPayout,
  UserStatus,
  PerformanceStatus
} from '@nama/shared';

export const adminTeachersApi = {
  getSummary: () => 
    apiFetch<AdminTeacherSummary>('/admin/teachers/summary'),

  getTeachers: (params?: { search?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.status && params.status !== 'ALL') searchParams.append('status', params.status);
    
    const queryString = searchParams.toString();
    const endpoint = `/admin/teachers${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<AdminTeacher[]>(endpoint);
  },

  getDetails: (id: string) => 
    apiFetch<AdminTeacherDetails>(`/admin/teachers/${id}`),

  updateStatus: (id: string, data: { status: UserStatus, performanceStatus?: PerformanceStatus }) => 
    apiFetch<{ message: string }>(`/admin/teachers/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    }),

  getCourses: (id: string) => 
    apiFetch<AdminTeacherCourse[]>(`/admin/teachers/${id}/courses`),
    
  getStudents: (id: string) => 
    apiFetch<AdminTeacherStudent[]>(`/admin/teachers/${id}/students`),
    
  getReviews: (id: string) => 
    apiFetch<AdminTeacherReview[]>(`/admin/teachers/${id}/reviews`),
    
  getPayouts: (id: string) => 
    apiFetch<AdminTeacherPayout[]>(`/admin/teachers/${id}/payouts`),
};
