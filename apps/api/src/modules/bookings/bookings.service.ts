import { bookingsRepository } from './bookings.repository.js';
import { Errors } from '../../utils/errors.js';
import { UpdateAvailabilityInput, IndividualPricingInput, CreateBookingInput } from '@nama/shared';

export const bookingsService = {
  // --- Availability ---
  async getAvailability(teacherId: string) {
    return bookingsRepository.getTeacherAvailability(teacherId);
  },

  async updateAvailability(teacherId: string, input: UpdateAvailabilityInput) {
    return bookingsRepository.setTeacherAvailability(teacherId, input);
  },

  // --- Pricing ---
  async getPricing(teacherId: string) {
    return bookingsRepository.getTeacherPricing(teacherId);
  },

  async createPricing(teacherId: string, input: IndividualPricingInput) {
    return bookingsRepository.createPricing(teacherId, input);
  },

  async updatePricing(teacherId: string, pricingId: string, input: Partial<IndividualPricingInput>) {
    const existing = await bookingsRepository.getPricingById(pricingId);
    if (!existing || existing.teacherId !== teacherId) {
      throw Errors.notFound('Pricing not found');
    }
    return bookingsRepository.updatePricing(pricingId, input);
  },

  // --- Bookings ---
  async getStudentBookings(studentId: string) {
    return bookingsRepository.getStudentBookings(studentId);
  },

  async getTeacherBookings(teacherId: string) {
    return bookingsRepository.getTeacherBookings(teacherId);
  },

  async createBooking(studentId: string, input: CreateBookingInput) {
    const pricing = await bookingsRepository.getPricingById(input.pricingId);
    if (!pricing || !pricing.isActive || pricing.teacherId !== input.teacherId) {
      throw Errors.badRequest('Invalid pricing selected');
    }

    const scheduledAt = new Date(input.scheduledAt);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    if (scheduledAt.getTime() <= now + oneDay) {
      throw Errors.badRequest('Bookings must be scheduled at least 24 hours in advance.');
    }

    if (scheduledAt.getTime() > now + sevenDays) {
      throw Errors.badRequest('Bookings cannot be scheduled more than 7 days in advance.');
    }

    if (scheduledAt.getMinutes() % 30 !== 0 || scheduledAt.getSeconds() !== 0) {
      throw Errors.badRequest('Bookings must start on the hour or half-hour mark (e.g., 9:00, 9:30).');
    }

    try {
      return await bookingsRepository.createBooking(
        studentId,
        input.teacherId,
        input.pricingId,
        scheduledAt,
        pricing.durationMinutes
      );
    } catch (err: unknown) {
      if (err instanceof Error && err.message.includes('Overlapping booking')) {
        throw Errors.badRequest('This time slot is no longer available. Please select another slot.');
      }
      throw err;
    }
  },

  async updateBookingStatus(
    userId: string, 
    userRole: string, 
    bookingId: string, 
    status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', 
    meetingUrl?: string, 
    cancellationReason?: string
  ) {
    const booking = await bookingsRepository.getBookingById(bookingId);
    if (!booking) {
      throw Errors.notFound('Booking not found');
    }

    // Authorization
    if (userRole === 'STUDENT' && booking.studentId !== userId) {
      throw Errors.forbidden('Not authorized');
    }
    if (userRole === 'TEACHER' && booking.teacherId !== userId) {
      throw Errors.forbidden('Not authorized');
    }

    // Validate state transitions
    if (status === 'COMPLETED' && booking.status !== 'CONFIRMED') {
      throw Errors.badRequest('Only confirmed bookings can be completed');
    }

    return bookingsRepository.updateBookingStatus(bookingId, status, meetingUrl, cancellationReason);
  }
};
