import { z } from 'zod';

export const teacherAvailabilitySchema = z.object({
  dayOfWeek: z.number().min(0).max(6),
  startTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:MM format'),
  endTime: z.string().regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Must be in HH:MM format'),
  isAvailable: z.boolean().default(true),
});

export const updateAvailabilitySchema = z.object({
  slots: z.array(teacherAvailabilitySchema)
});

export const individualPricingSchema = z.object({
  durationMinutes: z.number().positive(),
  amount: z.number().positive(),
  currency: z.string().default('INR'),
  isActive: z.boolean().default(true),
});

export const createBookingSchema = z.object({
  teacherId: z.string(),
  pricingId: z.string(),
  scheduledAt: z.string().datetime(), // ISO string in UTC
});

export const rescheduleBookingSchema = z.object({
  newScheduledAt: z.string().datetime(), // ISO string in UTC
});

export type TeacherAvailabilityInput = z.infer<typeof teacherAvailabilitySchema>;
export type UpdateAvailabilityInput = z.infer<typeof updateAvailabilitySchema>;
export type IndividualPricingInput = z.infer<typeof individualPricingSchema>;
export type CreateBookingInput = z.infer<typeof createBookingSchema>;
export type RescheduleBookingInput = z.infer<typeof rescheduleBookingSchema>;
