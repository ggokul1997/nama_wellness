import { apiFetch } from './client';

export const usersApi = {
  getProfile: () => apiFetch('/users/profile'),
  updateProfile: (data: any) => apiFetch('/users/profile', {
    method: 'PATCH',
    body: JSON.stringify(data),
  }),
  getTeacherProfile: () => apiFetch<any>('/users/teacher-profile'),
};
