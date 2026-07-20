export type PayoutStatus = 'PENDING' | 'PROCESSING' | 'PAID' | 'FAILED';

export interface Payout {
  id: string;
  teacherId: string;
  amount: number;
  currency: string;
  status: PayoutStatus;
  periodStart: string;
  periodEnd: string;
  txCount: number;
  grossRevenue: number;
  notes?: string | null;
  processedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  teacher?: {
    email: string;
    profile?: { firstName: string; lastName: string; } | null;
  };
}

export interface GeneratePayoutsInput {
  periodStart: string;  // ISO date string
  periodEnd: string;
}

export interface UpdatePayoutInput {
  status: PayoutStatus;
  notes?: string;
}

export interface AdminTransaction {
  id: string;
  userId: string;
  userEmail: string;
  userName?: string;
  courseTitle?: string;
  amount: number;
  currency: string;
  status: string;
  type: 'COURSE' | 'BOOKING' | 'B2B';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  createdAt: string;
}
