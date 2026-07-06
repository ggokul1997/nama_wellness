import type { Course, Lesson } from './course.types.js';

export interface Enrollment {
  id: string;
  userId: string;
  courseId: string;
  status: 'ACTIVE' | 'SUSPENDED' | 'COMPLETED' | 'CANCELLED';
  enrolledAt: string | Date;
  completedAt: string | Date | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  
  // Relations
  course?: Course;
  progress?: LessonProgress[];
}

export interface LessonProgress {
  id: string;
  enrollmentId: string;
  lessonId: string;
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED';
  progressPercent: number;
  lastAccessedAt: string | Date;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Relations
  lesson?: Lesson;
}

export interface MyCourseResponse {
  enrollment: Enrollment;
  overallProgressPercent: number;
  completedLessons: number;
  totalLessons: number;
}
