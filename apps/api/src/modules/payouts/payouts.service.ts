import { payoutsRepository } from './payouts.repository.js';
import { Errors } from '../../utils/errors.js';
import type { PayoutStatus } from '@prisma/client';

export const payoutsService = {
  async generatePayouts(periodStart: string, periodEnd: string) {
    const start = new Date(periodStart);
    const end = new Date(periodEnd);

    if (isNaN(start.getTime()) || isNaN(end.getTime())) {
      throw Errors.badRequest('Invalid date range');
    }

    const teachers = await payoutsRepository.getTeachersWithEarnings(start, end);
    const payouts = [];

    for (const teacherId of teachers) {
      const { grossRevenue, txCount } = await payoutsRepository.calculateTeacherEarnings(teacherId, start, end);
      
      if (txCount > 0) {
        const teacherCut = grossRevenue * 0.70; // 70% teacher share

        const payout = await payoutsRepository.createPayout({
          teacherId,
          amount: teacherCut,
          grossRevenue,
          txCount,
          periodStart: start,
          periodEnd: end,
          currency: 'INR',
        });
        
        // Transform decimals to numbers for response
        payouts.push({
          ...payout,
          amount: Number(payout.amount),
          grossRevenue: Number(payout.grossRevenue),
        });
      }
    }

    return payouts;
  },

  async listPayouts(page: number = 1, limit: number = 20, status?: string, teacherId?: string) {
    let validStatus: PayoutStatus | undefined;
    if (status && ['PENDING', 'PROCESSING', 'PAID', 'FAILED'].includes(status.toUpperCase())) {
      validStatus = status.toUpperCase() as PayoutStatus;
    }

    const { payouts, total } = await payoutsRepository.listPayouts(page, limit, validStatus, teacherId);

    const formattedPayouts = payouts.map(p => ({
      ...p,
      amount: Number(p.amount),
      grossRevenue: Number(p.grossRevenue),
    }));

    return { payouts: formattedPayouts, total };
  },

  async updatePayout(id: string, status: string, notes?: string) {
    if (!['PENDING', 'PROCESSING', 'PAID', 'FAILED'].includes(status.toUpperCase())) {
      throw Errors.badRequest('Invalid payout status');
    }

    const validStatus = status.toUpperCase() as PayoutStatus;
    const existing = await payoutsRepository.getPayoutById(id);
    if (!existing) {
      throw Errors.notFound('Payout not found');
    }

    const processedAt = validStatus === 'PAID' && !existing.processedAt ? new Date() : undefined;
    const updated = await payoutsRepository.updatePayoutStatus(id, validStatus, notes, processedAt);

    return {
      ...updated,
      amount: Number(updated.amount),
      grossRevenue: Number(updated.grossRevenue),
    };
  },

  async getPayoutTransactions(id: string) {
    const payout = await payoutsRepository.getPayoutById(id);
    if (!payout) {
      throw Errors.notFound('Payout not found');
    }

    const transactions = await payoutsRepository.getTeacherTransactions(
      payout.teacherId,
      payout.periodStart,
      payout.periodEnd
    );

    return transactions.map(tx => ({
      ...tx,
      amount: Number(tx.amount)
    }));
  },

  async getPayout(id: string) {
    const payout = await payoutsRepository.getPayoutById(id);
    if (!payout) {
      throw Errors.notFound('Payout not found');
    }
    
    return {
      ...payout,
      amount: Number(payout.amount),
      grossRevenue: Number(payout.grossRevenue),
    };
  },
};
