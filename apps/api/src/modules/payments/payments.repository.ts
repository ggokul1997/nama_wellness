import { prisma } from '../../infrastructure/database/prisma.client.js';
import { Prisma, TransactionStatus, EnrollmentStatus } from '@prisma/client';

export class PaymentsRepository {
  async createTransaction(data: Prisma.TransactionUncheckedCreateInput) {
    return prisma.transaction.create({ data });
  }

  async getTransactionByOrderId(orderId: string) {
    return prisma.transaction.findUnique({
      where: { razorpayOrderId: orderId },
    });
  }

  async updateTransactionStatus(id: string, status: TransactionStatus, paymentId?: string) {
    return prisma.transaction.update({
      where: { id },
      data: { 
        status,
        ...(paymentId ? { razorpayPaymentId: paymentId } : {})
      },
    });
  }

  async createEnrollment(userId: string, courseId: string, transactionId: string) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      // 1. Create or update enrollment
      const enrollment = await tx.enrollment.upsert({
        where: {
          userId_courseId: {
            userId,
            courseId,
          }
        },
        update: {
          status: EnrollmentStatus.ACTIVE,
        },
        create: {
          userId,
          courseId,
          status: EnrollmentStatus.ACTIVE,
        }
      });

      // 2. Link transaction to this enrollment
      await tx.transaction.update({
        where: { id: transactionId },
        data: { enrollmentId: enrollment.id }
      });

      return enrollment;
    });
  }

  async getTransactionsByUser(userId: string) {
    return prisma.transaction.findMany({
      where: { userId },
      include: {
        course: {
          select: {
            id: true,
            title: true,
            coverImageUrl: true,
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export const paymentsRepository = new PaymentsRepository();
