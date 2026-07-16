import { prisma } from '../../infrastructure/database/prisma.client.js';
import { Prisma, BookingStatus } from '@prisma/client';
import { UpdateAvailabilityInput, IndividualPricingInput } from '@nama/shared';

export class BookingsRepository {
  // --- Availability ---
  async getTeacherAvailability(teacherId: string) {
    return prisma.teacherAvailability.findMany({
      where: { teacherId },
      orderBy: [{ dayOfWeek: 'asc' }, { startTime: 'asc' }],
    });
  }

  async setTeacherAvailability(teacherId: string, data: UpdateAvailabilityInput) {
    return prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.teacherAvailability.deleteMany({
        where: { teacherId }
      });
      if (data.slots.length > 0) {
        await tx.teacherAvailability.createMany({
          data: data.slots.map(s => ({
            teacherId,
            dayOfWeek: s.dayOfWeek,
            startTime: s.startTime,
            endTime: s.endTime,
            isAvailable: s.isAvailable
          }))
        });
      }
      return this.getTeacherAvailability(teacherId);
    });
  }

  // --- Pricing ---
  async getTeacherPricing(teacherId: string) {
    return prisma.individualSessionPricing.findMany({
      where: { teacherId },
      orderBy: { durationMinutes: 'asc' }
    });
  }

  async getPricingById(pricingId: string) {
    return prisma.individualSessionPricing.findUnique({
      where: { id: pricingId }
    });
  }

  async createPricing(teacherId: string, data: IndividualPricingInput) {
    return prisma.individualSessionPricing.create({
      data: {
        teacherId,
        durationMinutes: data.durationMinutes,
        amount: data.amount,
        currency: data.currency,
        isActive: data.isActive
      }
    });
  }

  async updatePricing(pricingId: string, data: Partial<IndividualPricingInput>) {
    return prisma.individualSessionPricing.update({
      where: { id: pricingId },
      data
    });
  }

  // --- Bookings ---
  async getStudentBookings(studentId: string) {
    return prisma.individualSessionBooking.findMany({
      where: { studentId },
      include: {
        teacher: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        pricing: true,
      },
      orderBy: { scheduledAt: 'desc' }
    });
  }

  async getTeacherBookings(teacherId: string) {
    return prisma.individualSessionBooking.findMany({
      where: { teacherId },
      include: {
        student: { select: { id: true, email: true, profile: { select: { firstName: true, lastName: true, avatarUrl: true } } } },
        pricing: true,
      },
      orderBy: { scheduledAt: 'desc' }
    });
  }

  async getBookingById(bookingId: string) {
    return prisma.individualSessionBooking.findUnique({
      where: { id: bookingId },
      include: { pricing: true, student: true, teacher: true }
    });
  }

  async getConfirmedBookingsForTeacher(teacherId: string, date: Date) {
    const startOfDay = new Date(date);
    startOfDay.setUTCHours(0,0,0,0);
    const endOfDay = new Date(date);
    endOfDay.setUTCHours(23,59,59,999);

    return prisma.individualSessionBooking.findMany({
      where: {
        teacherId,
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        scheduledAt: {
          gte: startOfDay,
          lte: endOfDay
        }
      }
    });
  }

  async checkOverlap(teacherId: string, startTime: Date, durationMinutes: number): Promise<boolean> {
    const endTime = new Date(startTime.getTime() + durationMinutes * 60000);

    // However, Prisma doesn't directly let us compute end time in SQL easily without raw. 
    // We can do it by checking if existing bookings overlap.
    // existingBooking.start < newBooking.end AND (existingBooking.start + duration) > newBooking.start
    // Let's use raw query for this because we need to calculate `scheduledAt + durationMinutes * 1 minute`
    const overlaps = await prisma.$queryRaw`
      SELECT id FROM individual_session_bookings
      WHERE "teacherId" = ${teacherId}
        AND status IN ('CONFIRMED', 'COMPLETED')
        AND "scheduledAt" < ${endTime}
        AND ("scheduledAt" + ("durationMinutes" * interval '1 minute')) > ${startTime}
      LIMIT 1
    `;
    return Array.isArray(overlaps) && overlaps.length > 0;
  }

  async createBooking(studentId: string, teacherId: string, pricingId: string, scheduledAt: Date, durationMinutes: number) {
    return prisma.$transaction(async (tx) => {
      // Check overlap in transaction
      const overlaps = await tx.$queryRaw`
        SELECT id FROM individual_session_bookings
        WHERE "teacherId" = ${teacherId}
          AND status IN ('CONFIRMED', 'COMPLETED')
          AND "scheduledAt" < ${new Date(scheduledAt.getTime() + durationMinutes * 60000)}
          AND ("scheduledAt" + ("durationMinutes" * interval '1 minute')) > ${scheduledAt}
        LIMIT 1
      `;
      if (Array.isArray(overlaps) && overlaps.length > 0) {
        throw new Error('Overlapping booking exists');
      }

      return tx.individualSessionBooking.create({
        data: {
          studentId,
          teacherId,
          pricingId,
          scheduledAt,
          durationMinutes,
          status: 'PENDING_PAYMENT',
        }
      });
    });
  }

  async updateBookingStatus(id: string, status: BookingStatus, meetingUrl?: string, cancellationReason?: string) {
    return prisma.individualSessionBooking.update({
      where: { id },
      data: {
        status,
        ...(meetingUrl !== undefined && { meetingUrl }),
        ...(cancellationReason !== undefined && { cancellationReason })
      }
    });
  }
}

export const bookingsRepository = new BookingsRepository();
