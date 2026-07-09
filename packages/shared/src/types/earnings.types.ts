
export interface TeacherTransaction {
  id: string;
  courseId: string;
  courseTitle: string;
  amount: number;
  currency: string;
  teacherCut: number;
  status: string;
  studentName?: string;
  studentEmail?: string;
  createdAt: string;
}

export interface TeacherEarningsSummary {
  totalSalesCount: number;
  grossRevenue: number;
  totalEarnings: number;
  currency: string;
  recentTransactions: TeacherTransaction[];
}
