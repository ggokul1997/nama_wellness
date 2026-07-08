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

  verifyPayment: (data: { razorpay_order_id: string, razorpay_payment_id: string, razorpay_signature: string }) => {
    return apiFetch<{ verified: boolean }>('/payments/verify', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getMyTransactions: () => {
    return apiFetch<{ transactions: PopulatedTransaction[] }>('/payments/transactions/me', {
      method: 'GET',
    });
  },

  cancelOrder: (orderId: string) => {
    return apiFetch<{ cancelled: boolean }>(`/payments/orders/${orderId}/cancel`, {
      method: 'PUT',
    });
  },
};
