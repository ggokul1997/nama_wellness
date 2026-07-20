import { prisma } from '../../infrastructure/database/prisma.client.js';
import type { AdminPlatformStats, RevenueDataPoint, UserGrowthDataPoint, CoursePerformance } from '@nama/shared';

export const analyticsRepository = {
  async getPlatformStats(): Promise<AdminPlatformStats> {
    const [
      totalStudents,
      totalTeachers,
      totalCorporateClients,
      publishedCourses,
      totalCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalRevenueData,
      pendingApplications,
    ] = await Promise.all([
      prisma.userRole.count({ where: { role: 'STUDENT' } }),
      prisma.userRole.count({ where: { role: 'TEACHER' } }),
      prisma.userRole.count({ where: { role: 'COMPANY_ADMIN' } }),
      prisma.course.count({ where: { status: 'PUBLISHED' } }),
      prisma.course.count(),
      prisma.enrollment.count(),
      prisma.enrollment.count({ where: { status: 'ACTIVE' } }),
      prisma.enrollment.count({ where: { status: 'COMPLETED' } }),
      prisma.transaction.aggregate({ where: { status: 'SUCCESS' }, _sum: { amount: true } }),
      prisma.teacherApplication.count({ where: { status: 'PENDING' } }),
    ]);

    return {
      totalStudents,
      totalTeachers,
      totalCorporateClients,
      totalCourses,
      publishedCourses,
      totalEnrollments,
      activeEnrollments,
      completedEnrollments,
      totalRevenue: Number(totalRevenueData._sum.amount || 0),
      pendingApplications,
      currency: 'INR',
    };
  },

  async getRevenueByDay(startDate: Date, endDate: Date): Promise<RevenueDataPoint[]> {
    // Generate dates array for the range
    const dates: string[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      dates.push(current.toISOString().split('T')[0] as string);
      current.setDate(current.getDate() + 1);
    }

    const transactions = await prisma.transaction.findMany({
      where: {
        status: 'SUCCESS',
        createdAt: { gte: startDate, lte: endDate },
      },
      select: { amount: true, createdAt: true, enrollmentId: true, bookingId: true },
    });

    const dataMap: Record<string, RevenueDataPoint> = {};
    dates.forEach((date) => {
      dataMap[date] = { date, standardRevenue: 0, corporateRevenue: 0, bookingRevenue: 0, total: 0 };
    });

    for (const tx of transactions) {
      const dateStr = tx.createdAt.toISOString().split('T')[0] as string;
      if (dataMap[dateStr]) {
        const amount = Number(tx.amount);
        dataMap[dateStr]!.total += amount;
        if (tx.bookingId) {
          dataMap[dateStr]!.bookingRevenue += amount;
        } else if (tx.enrollmentId) {
          dataMap[dateStr]!.standardRevenue += amount;
        } else {
          // Assume B2B if no enrollment or booking
          dataMap[dateStr]!.corporateRevenue += amount;
        }
      }
    }

    return dates.map((date) => dataMap[date]!);
  },

  async getUserGrowthByDay(startDate: Date, endDate: Date): Promise<UserGrowthDataPoint[]> {
    // Generate dates array for the range
    const dates: string[] = [];
    let current = new Date(startDate);
    while (current <= endDate) {
      dates.push(current.toISOString().split('T')[0] as string);
      current.setDate(current.getDate() + 1);
    }

    const roles = await prisma.userRole.findMany({
      where: {
        createdAt: { gte: startDate, lte: endDate },
        role: { in: ['STUDENT', 'TEACHER', 'COMPANY_ADMIN'] },
      },
      select: { role: true, createdAt: true },
    });

    const dataMap: Record<string, UserGrowthDataPoint> = {};
    dates.forEach((date) => {
      dataMap[date] = { date, students: 0, teachers: 0, corporateClients: 0 };
    });

    for (const role of roles) {
      const dateStr = role.createdAt.toISOString().split('T')[0] as string;
      if (dataMap[dateStr]) {
        if (role.role === 'STUDENT') dataMap[dateStr]!.students++;
        else if (role.role === 'TEACHER') dataMap[dateStr]!.teachers++;
        else if (role.role === 'COMPANY_ADMIN') dataMap[dateStr]!.corporateClients++;
      }
    }

    // Cumulative sum
    let cumStudents = await prisma.userRole.count({ where: { role: 'STUDENT', createdAt: { lt: startDate } } });
    let cumTeachers = await prisma.userRole.count({ where: { role: 'TEACHER', createdAt: { lt: startDate } } });
    let cumClients = await prisma.userRole.count({ where: { role: 'COMPANY_ADMIN', createdAt: { lt: startDate } } });

    return dates.map((date) => {
      cumStudents += dataMap[date]!.students;
      cumTeachers += dataMap[date]!.teachers;
      cumClients += dataMap[date]!.corporateClients;
      return {
        date,
        students: cumStudents,
        teachers: cumTeachers,
        corporateClients: cumClients,
      };
    });
  },

  async getTopCoursesByEnrollment(limit: number): Promise<CoursePerformance[]> {
    const courses = await prisma.course.findMany({
      take: limit,
      orderBy: { enrollments: { _count: 'desc' } },
      where: { status: 'PUBLISHED' },
      select: {
        id: true,
        title: true,
        teacher: { select: { profile: { select: { firstName: true, lastName: true } } } },
        _count: { select: { enrollments: true } },
        reviews: { select: { rating: true } },
        transactions: { where: { status: 'SUCCESS' }, select: { amount: true } },
        enrollments: { select: { status: true } },
      },
    });

    return courses.map((course) => {
      const enrollmentCount = course._count.enrollments;
      const completedCount = course.enrollments.filter((e) => e.status === 'COMPLETED').length;
      const completionRate = enrollmentCount > 0 ? (completedCount / enrollmentCount) * 100 : 0;
      const totalRating = course.reviews.reduce((sum, r) => sum + r.rating, 0);
      const averageRating = course.reviews.length > 0 ? totalRating / course.reviews.length : 0;
      const totalRevenue = course.transactions.reduce((sum, t) => sum + Number(t.amount), 0);

      return {
        courseId: course.id,
        title: course.title,
        teacherName: course.teacher?.profile ? `${course.teacher.profile.firstName} ${course.teacher.profile.lastName}` : 'System',
        enrollmentCount,
        completionRate: Math.round(completionRate),
        averageRating: Number(averageRating.toFixed(1)),
        totalRevenue,
      };
    });
  },

  async getAllTransactions(page: number, limit: number, status?: string) {
    const skip = (page - 1) * limit;
    const whereClause: any = {};
    
    // Exact match for enums, but API gets string
    if (status && ['PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'].includes(status.toUpperCase())) {
      whereClause.status = status.toUpperCase();
    }

    const [transactions, total] = await Promise.all([
      prisma.transaction.findMany({
        where: whereClause,
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
        include: {
          user: { select: { email: true, profile: { select: { firstName: true, lastName: true } } } },
          course: { select: { title: true } },
        },
      }),
      prisma.transaction.count({ where: whereClause }),
    ]);

    return { transactions, total };
  },
};
