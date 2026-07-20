export interface AdminPlatformStats {
  totalStudents: number;
  totalTeachers: number;
  totalCorporateClients: number;
  totalCourses: number;
  publishedCourses: number;
  totalEnrollments: number;
  activeEnrollments: number;
  completedEnrollments: number;
  totalRevenue: number;         // sum of SUCCESS transactions
  pendingApplications: number;
  currency: string;
}

export interface RevenueDataPoint {
  date: string;                 // "2026-07-01"
  standardRevenue: number;      // B2C transactions
  corporateRevenue: number;     // B2B transactions
  bookingRevenue: number;       // 1-on-1 session transactions
  total: number;
}

export interface UserGrowthDataPoint {
  date: string;
  students: number;
  teachers: number;
  corporateClients: number;
}

export interface CoursePerformance {
  courseId: string;
  title: string;
  teacherName: string;
  enrollmentCount: number;
  completionRate: number;        // %
  averageRating: number;
  totalRevenue: number;
}

export interface AdminAnalyticsResponse {
  stats: AdminPlatformStats;
  revenue: RevenueDataPoint[];       // last 30 days by default
  userGrowth: UserGrowthDataPoint[]; // last 30 days by default
  topCourses: CoursePerformance[];   // top 5 by enrollment
}
