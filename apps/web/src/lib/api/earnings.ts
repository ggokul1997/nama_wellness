import { apiFetch } from './client';
import type { TeacherEarningsSummary } from '@nama/shared';

export const earningsApi = {
  getTeacherEarnings: () => {
    return apiFetch<TeacherEarningsSummary>('/payments/earnings/teacher', {
      auth: true
    });
  }
};
