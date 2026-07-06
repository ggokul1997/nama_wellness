import { z } from 'zod';

export const adminAssignSchema = z.object({
  userEmail: z.string().email('Invalid email address'),
  courseId: z.string().min(1, 'Course ID is required'),
});

export const updateLessonProgressSchema = z.object({
  status: z.enum(['NOT_STARTED', 'IN_PROGRESS', 'COMPLETED']),
  progressPercent: z.number().min(0).max(100).optional(),
});

export type AdminAssignInput = z.infer<typeof adminAssignSchema>;
export type UpdateLessonProgressInput = z.infer<typeof updateLessonProgressSchema>;
