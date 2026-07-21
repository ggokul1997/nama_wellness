import { apiFetch } from './client';
import type { Payout, GeneratePayoutsInput, UpdatePayoutInput } from '@nama/shared';

export const payoutsApi = {
  list: (page: number = 1, status?: string) =>
    apiFetch<{ payouts: Payout[], total: number }>(
      `/payouts?page=${page}${status && status !== 'ALL' ? `&status=${status}` : ''}`
    ),

  myPayouts: (page: number = 1, status?: string) =>
    apiFetch<{ payouts: Payout[], total: number }>(
      `/payouts/my-payouts?page=${page}${status && status !== 'ALL' ? `&status=${status}` : ''}`
    ),

  generate: (data: GeneratePayoutsInput) =>
    apiFetch<Payout[]>('/payouts/generate', { method: 'POST', body: JSON.stringify(data) }),

  update: (id: string, data: UpdatePayoutInput) =>
    apiFetch<Payout>(`/payouts/${id}`, { method: 'PATCH', body: JSON.stringify(data) }),

  get: (id: string) =>
    apiFetch<Payout>(`/payouts/${id}`),

  getTransactions: (id: string) =>
    apiFetch<any[]>(`/payouts/${id}/transactions`),
};
