import { analyticsRepository } from './analytics.repository.js';
import type { AdminTransaction } from '@nama/shared';

export const analyticsService = {
  async getFullAnalytics(days: number = 30) {
    const endDate = new Date();
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - days);

    const [stats, revenue, userGrowth, topCourses] = await Promise.all([
      analyticsRepository.getPlatformStats(),
      analyticsRepository.getRevenueByDay(startDate, endDate),
      analyticsRepository.getUserGrowthByDay(startDate, endDate),
      analyticsRepository.getTopCoursesByEnrollment(5),
    ]);

    return { stats, revenue, userGrowth, topCourses };
  },

  async getAllTransactions(page: number = 1, limit: number = 20, status?: string) {
    const { transactions, total } = await analyticsRepository.getAllTransactions(page, limit, status);

    const mappedTransactions: AdminTransaction[] = transactions.map(tx => {
      let type: 'COURSE' | 'BOOKING' | 'B2B' = 'COURSE';
      if (tx.bookingId) type = 'BOOKING';
      else if (!tx.enrollmentId && !tx.bookingId) type = 'B2B'; // Fallback logic

      const userName = tx.user.profile ? `${tx.user.profile.firstName} ${tx.user.profile.lastName}` : undefined;

      return {
        id: tx.id,
        userId: tx.userId,
        userEmail: tx.user.email,
        userName,
        courseTitle: tx.course?.title,
        amount: Number(tx.amount),
        currency: tx.currency,
        status: tx.status,
        type,
        razorpayOrderId: tx.razorpayOrderId || undefined,
        razorpayPaymentId: tx.razorpayPaymentId || undefined,
        createdAt: tx.createdAt.toISOString(),
      };
    });

    return { transactions: mappedTransactions, total };
  },
};
