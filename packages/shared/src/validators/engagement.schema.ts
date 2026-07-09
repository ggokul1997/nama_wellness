import { z } from 'zod';

export const createReviewSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  rating: z.number().min(1).max(5),
  comment: z.string().optional(),
});

export const scheduleLiveSessionSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  description: z.string().optional(),
  meetingUrl: z.string().url('Must be a valid URL'),
  scheduledAt: z.string().datetime({ message: 'Must be a valid ISO 8601 datetime' }),
  durationMinutes: z.number().min(15).max(300),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;
export type ScheduleLiveSessionInput = z.infer<typeof scheduleLiveSessionSchema>;
