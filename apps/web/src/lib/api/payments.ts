import { apiFetch } from './client';


// Extend Transaction with populated course
export type PopulatedTransaction = {
  id: string;
  userId: string;
  courseId: string;
  amount: string;
  currency: string;
  status: 'PENDING' | 'SUCCESS' | 'FAILED' | 'REFUNDED';
  createdAt: string;
  course: {
    id: string;
    title: string;
    coverImageUrl: string | null;
  };
};

export const paymentsApi = {
  createOrder: (courseId: string) => {
    return apiFetch<{ orderId: string, amount: number, currency: string }>('/payments/orders', {
      method: 'POST',
      body: JSON.stringify({ courseId }),
    });
  },

  getMyTransactions: () => {
    return apiFetch<{ transactions: PopulatedTransaction[] }>('/payments/transactions/me', {
      method: 'GET',
    });
  },
};
