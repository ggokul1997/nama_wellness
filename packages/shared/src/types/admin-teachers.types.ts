import type { UserStatus } from '../constants/roles.js';

export type PerformanceStatus = 'GOOD_STANDING' | 'WARNING' | 'PROBATION' | 'SUSPENSION' | 'TERMINATED';

export interface AdminTeacherSummary {
  totalTeachers: number;
  activeTeachers: number;
  pendingVerification: number;
  suspendedTeachers: number;
  averageRating: number;
  totalRevenueGenerated: number;
}

export interface AdminTeacher {
  id: string; // teacher profile id
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  status: UserStatus;
  performanceStatus: PerformanceStatus;
  coursesCount: number;
  studentsCount: number;
  averageRating: number;
  totalRevenue: number;
  totalEarnings: number;
  joinedAt: string;
}

export interface AdminTeacherDetails extends AdminTeacher {
  bio: string | null;
  specialties: string[];
  recentEnrollments: {
    enrollmentId: string;
    studentName: string;
    courseTitle: string;
    enrolledAt: string;
  }[];
  payoutsCount: number;
}

export interface AdminTeacherCourse {
  id: string;
  title: string;
  slug: string;
  status: string;          // DRAFT | PUBLISHED | REJECTED
  enrollmentsCount: number;
  averageRating: number;
  revenue: number;
  publishedAt: string | null;
}

export interface AdminTeacherStudent {
  userId: string;
  firstName: string;
  lastName: string;
  email: string;
  avatarUrl: string | null;
  courseTitle: string;
  enrolledAt: string;
  completedAt: string | null;
  status: string;          // ACTIVE | COMPLETED | DROPPED
}

export interface AdminTeacherReview {
  id: string;
  rating: number;
  comment: string | null;
  courseTitle: string;
  studentName: string;
  createdAt: string;
}

export interface AdminTeacherPayout {
  id: string;
  amount: number;
  grossRevenue: number;
  currency: string;
  status: string;          // PENDING | PAID | FAILED
  periodStart: string;
  periodEnd: string;
  txCount: number;
  processedAt: string | null;
  createdAt: string;
}
