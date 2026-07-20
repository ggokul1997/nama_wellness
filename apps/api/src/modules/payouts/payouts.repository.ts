import { prisma } from '../../infrastructure/database/prisma.client.js';
import type { PayoutStatus } from '@prisma/client';

export const payoutsRepository = {
  async getTeachersWithEarnings(startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startDate, lte: endDate },
        OR: [
          { course: { teacherId: { not: null } } },
          { bookingId: { not: null } },
        ],
      },
      select: {
        course: { select: { teacherId: true } },
        booking: { select: { teacherId: true } },
      },
    });

    const teacherIds = new Set<string>();
    for (const tx of transactions) {
      if (tx.course?.teacherId) teacherIds.add(tx.course.teacherId);
      if (tx.booking?.teacherId) teacherIds.add(tx.booking.teacherId);
    }
    return Array.from(teacherIds);
  },

  async calculateTeacherEarnings(teacherId: string, startDate: Date, endDate: Date) {
    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startDate, lte: endDate },
        OR: [
          { course: { teacherId } },
          { booking: { teacherId } },
        ],
      },
      select: { amount: true },
    });

    const grossRevenue = transactions.reduce((sum, tx) => sum + Number(tx.amount), 0);
    return { grossRevenue, txCount: transactions.length };
  },

  async getTeacherTransactions(teacherId: string, startDate: Date, endDate: Date) {
    return prisma.transaction.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startDate, lte: endDate },
        OR: [
          { course: { teacherId } },
          { booking: { teacherId } },
        ],
      },
      orderBy: { createdAt: 'desc' },
      include: {
        user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
        course: { select: { title: true } },
        booking: { select: { pricing: { select: { durationMinutes: true } } } },
      },
    });
  },

  async createPayout(data: {
    teacherId: string;
    amount: number;
    grossRevenue: number;
    txCount: number;
    periodStart: Date;
    periodEnd: Date;
    currency: string;
  }) {
    return prisma.payout.create({
      data: {
        teacherId: data.teacherId,
        amount: data.amount,
        grossRevenue: data.grossRevenue,
        txCount: data.txCount,
        periodStart: data.periodStart,
        periodEnd: data.periodEnd,
        currency: data.currency,
        status: 'PENDING',
      },
      include: {
        teacher: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });
  },

  async listPayouts(page: number, limit: number, status?: PayoutStatus, teacherId?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    if (status) whereClause.status = status;
    if (teacherId) whereClause.teacherId = teacherId;

    const [payouts, total] = await Promise.all([
      prisma.payout.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          teacher: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
        },
      }),
      prisma.payout.count({ where: whereClause }),
    ]);

    return { payouts, total };
  },

  async getPayoutById(id: string) {
    return prisma.payout.findUnique({ 
      where: { id },
      include: {
        teacher: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      }
    });
  },

  async updatePayoutStatus(id: string, status: PayoutStatus, notes?: string, processedAt?: Date) {
    return prisma.payout.update({
      where: { id },
      data: { status, notes, processedAt },
      include: {
        teacher: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
      },
    });
  },
};
