import type { z } from 'zod';
import type { createCourseSchema, updateCourseSchema, createModuleSchema, updateModuleSchema, createLessonSchema, updateLessonSchema, proposePricingSchema, reviewCourseSchema } from '../validators/course.schema.js';
import type { Category } from './category.types.js';

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type UpdateCourseInput = z.infer<typeof updateCourseSchema>;

export interface Course {
  id: string;
  title: string;
  slug: string;
  description: string;
  courseType: 'LIVE' | 'RECORDED' | 'HYBRID' | 'INDIVIDUAL';
  categoryId: string;
  teacherId?: string;
  status: 'DRAFT' | 'PENDING_REVIEW' | 'CHANGES_REQUESTED' | 'APPROVED' | 'PUBLISHED' | 'REJECTED' | 'ARCHIVED';
  coverImageUrl?: string;
  rejectedReason?: string | null;
  createdAt: string;
  updatedAt: string;
  
  // Relations that might be included
  category?: Category;
  modules?: CourseModule[];
  pricings?: CoursePricing[];
  teacher?: {
    profile?: {
      firstName: string;
      lastName: string;
    };
  };
}

export type ProposePricingInput = z.infer<typeof proposePricingSchema>;
export type ReviewCourseInput = z.infer<typeof reviewCourseSchema>;

export interface CoursePricing {
  id: string;
  courseId: string;
  amount: number;
  currency: string;
  proposedBy: string;
  approvedBy?: string | null;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  effectiveAt?: string | null;
  isCurrent: boolean;
  createdAt: string;
  updatedAt: string;
}

export type CreateModuleInput = z.infer<typeof createModuleSchema>;
export type UpdateModuleInput = z.infer<typeof updateModuleSchema>;

export interface CourseModule {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  sortOrder: number;
  createdAt: string;
  updatedAt: string;
  
  lessons?: Lesson[];
}

export type CreateLessonInput = z.infer<typeof createLessonSchema>;
export type UpdateLessonInput = z.infer<typeof updateLessonSchema>;

export interface Lesson {
  id: string;
  moduleId: string;
  title: string;
  lessonType: 'VIDEO' | 'DOCUMENT' | 'LIVE';
  contentUrl?: string | null;
  durationSeconds?: number | null;
  sortOrder: number;
  isPreview: boolean;
  createdAt: string;
  updatedAt: string;
}
