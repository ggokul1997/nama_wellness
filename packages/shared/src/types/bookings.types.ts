import { AuthUser } from './auth.types.js';

export interface TeacherAvailability {
  id: string;
  teacherId: string;
  dayOfWeek: number;
  startTime: string;
  endTime: string;
  isAvailable: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IndividualSessionPricing {
  id: string;
  teacherId: string;
  durationMinutes: number;
  amount: string | number; // Decimal comes back as string from prisma often
  currency: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export type BookingStatus = 'PENDING_PAYMENT' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';

export interface IndividualSessionBooking {
  id: string;
  studentId: string;
  teacherId: string;
  pricingId: string;
  scheduledAt: Date;
  durationMinutes: number;
  status: BookingStatus;
  meetingUrl: string | null;
  cancellationReason: string | null;
  rescheduledFromId: string | null;
  createdAt: Date;
  updatedAt: Date;
  
  // Relations
  student?: Partial<AuthUser>;
  teacher?: Partial<AuthUser>;
  pricing?: IndividualSessionPricing;
}
