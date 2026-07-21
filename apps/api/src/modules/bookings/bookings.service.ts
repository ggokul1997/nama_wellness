import { bookingsRepository } from './bookings.repository.js';
import { Errors } from '../../utils/errors.js';
import { UpdateAvailabilityInput, IndividualPricingInput, CreateBookingInput } from '@nama/shared';
import { notificationsService } from '../notifications/notifications.service.js';
import { logger } from '../../infrastructure/logger/logger.js';

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
    const teacherAvail = await bookingsRepository.getTeacherAvailability(input.teacherId);
    const advanceNoticeHours = teacherAvail.advanceNoticeHours;
    const advanceNoticeMs = advanceNoticeHours * 60 * 60 * 1000;
    const sevenDays = 7 * 24 * 60 * 60 * 1000;

    if (scheduledAt.getTime() <= now + advanceNoticeMs) {
      throw Errors.badRequest(`Bookings must be scheduled at least ${advanceNoticeHours} hours in advance.`);
    }

    if (scheduledAt.getTime() > now + sevenDays) {
      throw Errors.badRequest('Bookings cannot be scheduled more than 7 days in advance.');
    }

    if (scheduledAt.getMinutes() % 30 !== 0 || scheduledAt.getSeconds() !== 0) {
      throw Errors.badRequest('Bookings must start on the hour or half-hour mark (e.g., 9:00, 9:30).');
    }

    try {
      const booking = await bookingsRepository.createBooking(
        studentId,
        input.teacherId,
        input.pricingId,
        scheduledAt,
        pricing.durationMinutes
      );

      notificationsService.createNotification({
        userId: input.teacherId,
        title: 'New Booking Request',
        message: 'You have a new booking request from a student.',
        link: '/teacher/bookings',
        type: 'INFO'
      }).catch(err => logger.error({ err }, 'Failed to notify teacher of booking'));

      return booking;
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

    const updated = await bookingsRepository.updateBookingStatus(bookingId, status, meetingUrl, cancellationReason);

    if (status === 'CONFIRMED') {
      notificationsService.createNotification({
        userId: booking.studentId,
        title: 'Booking Confirmed ✅',
        message: 'Your booking has been confirmed by the teacher.',
        link: '/student/bookings',
        type: 'SUCCESS'
      }).catch(err => logger.error({ err }, 'Failed to notify student of booking confirmation'));
    } else if (status === 'CANCELLED') {
      const recipientId = userRole === 'TEACHER' ? booking.studentId : booking.teacherId;
      const link = userRole === 'TEACHER' ? '/student/bookings' : '/teacher/bookings';
      
      notificationsService.createNotification({
        userId: recipientId,
        title: 'Booking Cancelled ❌',
        message: cancellationReason ? `A booking was cancelled: ${cancellationReason}` : 'A booking was cancelled.',
        link,
        type: 'WARNING'
      }).catch(err => logger.error({ err }, 'Failed to notify about booking cancellation'));
    }

    return updated;
  }
};
