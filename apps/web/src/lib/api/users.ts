import { apiFetch } from './client';
import type { AdminUser, AdminUsersSummary, UserStatus } from '@nama/shared';

export const usersApi = {
  getProfile: () => apiFetch('/users/profile'),
  updateProfile: (data: any) => apiFetch('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  getTeacherProfile: () => apiFetch<any>('/users/teacher-profile'),
  
  // Admin-only endpoints
  adminList: (params?: { search?: string; role?: string; status?: string }) => {
    const searchParams = new URLSearchParams();
    if (params?.search) searchParams.append('search', params.search);
    if (params?.role && params.role !== 'ALL') searchParams.append('role', params.role);
    if (params?.status && params.status !== 'ALL') searchParams.append('status', params.status);
    
    const queryString = searchParams.toString();
    const endpoint = `/users/admin${queryString ? `?${queryString}` : ''}`;
    
    return apiFetch<{ users: AdminUser[], summary: AdminUsersSummary }>(endpoint);
  },
  
  adminUpdateStatus: (id: string, status: UserStatus) => 
    apiFetch<{ message: string }>(`/users/admin/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),
};
