import { z } from 'zod';

export const CourseTypeEnum = z.enum(['LIVE', 'RECORDED', 'HYBRID', 'INDIVIDUAL']);

export const createCourseSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters').max(100, 'Title is too long'),
  description: z.string().min(20, 'Description must be at least 20 characters').max(2000, 'Description is too long'),
  courseType: CourseTypeEnum,
  categoryId: z.string().min(1, 'Category is required'),
});

export const updateCourseSchema = createCourseSchema.partial();

export const createModuleSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  description: z.string().max(1000, 'Description is too long').optional(),
  sortOrder: z.number().int().min(0).optional(),
});

export const updateModuleSchema = createModuleSchema.partial();

export const LessonTypeEnum = z.enum(['VIDEO', 'DOCUMENT', 'LIVE']);

export const createLessonSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title is too long'),
  lessonType: LessonTypeEnum,
  durationSeconds: z.number().int().min(0).optional(),
  sortOrder: z.number().int().min(0).optional(),
  isPreview: z.boolean().optional(),
});

export const updateLessonSchema = createLessonSchema.partial().extend({
  contentUrl: z.string().url().optional(),
});

export const proposePricingSchema = z.object({
  amount: z.number().min(0, 'Price cannot be negative'),
  currency: z.string().min(3).max(3).default('INR'),
});

export const reviewCourseSchema = z.object({
  status: z.enum(['APPROVED', 'CHANGES_REQUESTED', 'REJECTED']),
  rejectionReason: z.string().optional(),
  finalPrice: z.number().min(0).optional(),
});
