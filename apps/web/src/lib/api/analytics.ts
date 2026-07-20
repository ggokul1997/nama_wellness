import { apiFetch } from './client';
import type { AdminAnalyticsResponse, AdminTransaction } from '@nama/shared';

export const analyticsApi = {
  getAnalytics: (days: number = 30) =>
    apiFetch<AdminAnalyticsResponse>(`/analytics?days=${days}`),

  getTransactions: (page: number = 1, status?: string) =>
    apiFetch<{ transactions: AdminTransaction[], total: number }>(
      `/analytics/transactions?page=${page}${status && status !== 'ALL' ? `&status=${status}` : ''}`
    ),
};
