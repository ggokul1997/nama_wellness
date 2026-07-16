import { Request, Response, NextFunction } from 'express';
import { bookingsService } from './bookings.service.js';
import { 
  updateAvailabilitySchema, 
  individualPricingSchema, 
  createBookingSchema 
} from '@nama/shared';
import { z } from 'zod';

export const bookingsController = {
  // --- Availability ---
  async getAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = req.params.teacherId as string;
      const availability = await bookingsService.getAvailability(teacherId);
      res.json({ success: true, data: { availability } });
    } catch (error) {
      next(error);
    }
  },

  async updateAvailability(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user!.sub;
      const input = updateAvailabilitySchema.parse(req.body);
      const availability = await bookingsService.updateAvailability(teacherId, input);
      res.json({ success: true, data: { availability } });
    } catch (error) {
      next(error);
    }
  },

  // --- Pricing ---
  async getPricing(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = req.params.teacherId as string;
      const pricing = await bookingsService.getPricing(teacherId);
      res.json({ success: true, data: { pricing } });
    } catch (error) {
      next(error);
    }
  },

  async createPricing(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user!.sub;
      const input = individualPricingSchema.parse(req.body);
      const pricing = await bookingsService.createPricing(teacherId, input);
      res.status(201).json({ success: true, data: { pricing } });
    } catch (error) {
      next(error);
    }
  },

  async updatePricing(req: Request, res: Response, next: NextFunction) {
    try {
      const teacherId = req.user!.sub;
      const pricingId = req.params.pricingId as string;
      const input = individualPricingSchema.partial().parse(req.body);
      const pricing = await bookingsService.updatePricing(teacherId, pricingId, input);
      res.json({ success: true, data: { pricing } });
    } catch (error) {
      next(error);
    }
  },

  // --- Bookings ---
  async getMyBookings(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const activeRole = req.user!.activeRole;
      let bookings;
      
      if (activeRole === 'TEACHER') {
        bookings = await bookingsService.getTeacherBookings(userId);
      } else {
        bookings = await bookingsService.getStudentBookings(userId);
      }
      
      res.json({ success: true, data: { bookings } });
    } catch (error) {
      next(error);
    }
  },

  async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const studentId = req.user!.sub;
      const input = createBookingSchema.parse(req.body);
      const booking = await bookingsService.createBooking(studentId, input);
      res.status(201).json({ success: true, data: { booking } });
    } catch (error) {
      next(error);
    }
  },

  async updateBookingStatus(req: Request, res: Response, next: NextFunction) {
    try {
      const userId = req.user!.sub;
      const userRole = req.user!.activeRole;
      const bookingId = req.params.bookingId as string;
      const schema = z.object({
        status: z.enum(['CONFIRMED', 'CANCELLED', 'COMPLETED']),
        meetingUrl: z.string().optional(),
        cancellationReason: z.string().optional(),
      });
      const input = schema.parse(req.body);
      
      const booking = await bookingsService.updateBookingStatus(
        userId, 
        userRole, 
        bookingId, 
        input.status, 
        input.meetingUrl, 
        input.cancellationReason
      );
      res.json({ success: true, data: { booking } });
    } catch (error) {
      next(error);
    }
  }
};
