import { prisma } from '../../infrastructure/database/prisma.client.js';
import { UserStatus, PerformanceStatus, Prisma } from '@prisma/client';

export class TeachersService {
  /**
   * Retrieves high-level metrics for all teachers
   */
  async getSummary() {
    const teachers = await prisma.user.findMany({
      where: { roles: { some: { role: 'TEACHER' } } },
      select: {
        status: true,
        teacherProfile: {
          select: {
            performanceStatus: true,
            averageRating: true
          }
        },
        transactions: {
          where: { status: 'SUCCESS' },
          select: { amount: true }
        }
      }
    });

    let activeTeachers = 0;
    let pendingVerification = 0; // if status is active but no teacherProfile? Actually, pending verification usually means TeacherApplication is not approved. But we'll count teacherProfile.performanceStatus or user.status.
    let suspendedTeachers = 0;
    let totalRating = new Prisma.Decimal(0);
    let ratingCount = 0;
    let totalRevenueGenerated = new Prisma.Decimal(0);

    for (const t of teachers) {
      if (t.status === 'SUSPENDED' || t.teacherProfile?.performanceStatus === 'SUSPENSION') {
        suspendedTeachers++;
      } else if (!t.teacherProfile) {
        pendingVerification++;
      } else {
        activeTeachers++;
      }

      if (t.teacherProfile?.averageRating) {
        totalRating = totalRating.add(t.teacherProfile.averageRating);
        ratingCount++;
      }

      for (const tx of t.transactions) {
        totalRevenueGenerated = totalRevenueGenerated.add(tx.amount);
      }
    }

    const averageRating = ratingCount > 0 ? totalRating.toNumber() / ratingCount : 0;

    return {
      totalTeachers: teachers.length,
      activeTeachers,
      pendingVerification,
      suspendedTeachers,
      averageRating: Number(averageRating.toFixed(2)),
      totalRevenueGenerated: totalRevenueGenerated.toNumber(),
    };
  }

  /**
   * Retrieves a paginated list of teachers with filtering and sorting
   */
  async getTeachers(filters: { search?: string, status?: string }) {
    const where: Prisma.UserWhereInput = {
      roles: { some: { role: 'TEACHER' } }
    };

    if (filters.search) {
      where.OR = [
        { email: { contains: filters.search, mode: 'insensitive' } },
        { profile: { firstName: { contains: filters.search, mode: 'insensitive' } } },
        { profile: { lastName: { contains: filters.search, mode: 'insensitive' } } }
      ];
    }

    if (filters.status) {
      if (filters.status === 'VERIFIED') {
        where.status = 'ACTIVE';
        where.teacherProfile = { isNot: null };
      } else if (filters.status === 'PENDING') {
        where.teacherProfile = null;
      } else if (filters.status === 'SUSPENDED') {
        where.OR = [
          { status: 'SUSPENDED' },
          { teacherProfile: { performanceStatus: 'SUSPENSION' } }
        ];
      }
    }

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        status: true,
        createdAt: true,
        profile: {
          select: {
            firstName: true,
            lastName: true,
            avatarUrl: true
          }
        },
        teacherProfile: {
          select: {
            id: true,
            performanceStatus: true,
            averageRating: true
          }
        },
        _count: {
          select: {
            courses: true,
          }
        },
        courses: {
          select: {
            _count: {
              select: { enrollments: true }
            }
          }
        },
        transactions: {
          where: { status: 'SUCCESS' },
          select: { amount: true }
        },
        payouts: {
          where: { status: 'PAID' },
          select: { amount: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return users.map(user => {
      const studentsCount = user.courses.reduce((acc, c) => acc + c._count.enrollments, 0);
      const totalRevenue = user.transactions.reduce((acc, tx) => acc + tx.amount.toNumber(), 0);
      const totalEarnings = user.payouts.reduce((acc, p) => acc + p.amount.toNumber(), 0);

      return {
        id: user.teacherProfile?.id || user.id, // Use profile ID if available
        userId: user.id,
        firstName: user.profile?.firstName || '',
        lastName: user.profile?.lastName || '',
        email: user.email,
        avatarUrl: user.profile?.avatarUrl || null,
        status: user.status,
        performanceStatus: user.teacherProfile?.performanceStatus || 'GOOD_STANDING',
        coursesCount: user._count.courses,
        studentsCount,
        averageRating: user.teacherProfile?.averageRating ? user.teacherProfile.averageRating.toNumber() : 0,
        totalRevenue,
        totalEarnings,
        joinedAt: user.createdAt.toISOString()
      };
    });
  }

  /**
   * Retrieves detailed information for a specific teacher
   */
  async getTeacherDetails(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        profile: true,
        teacherProfile: true,
        courses: {
          include: {
            _count: {
              select: { enrollments: true }
            }
          }
        },
        transactions: {
          where: { status: 'SUCCESS' }
        },
        payouts: true
      }
    });

    if (!user) {
      throw new Error('Teacher not found');
    }

    // Fetch recent enrollments for this teacher's courses
    const recentEnrollmentsRaw = await prisma.enrollment.findMany({
      where: { course: { teacherId: user.id } },
      take: 10,
      orderBy: { enrolledAt: 'desc' },
      include: {
        user: { include: { profile: true } },
        course: true
      }
    });

    const studentsCount = user.courses.reduce((acc, c) => acc + c._count.enrollments, 0);
    const totalRevenue = user.transactions.reduce((acc, tx) => acc + tx.amount.toNumber(), 0);
    const totalEarnings = user.payouts.filter(p => p.status === 'PAID').reduce((acc, p) => acc + p.amount.toNumber(), 0);

    return {
      id: user.teacherProfile?.id || user.id,
      userId: user.id,
      firstName: user.profile?.firstName || '',
      lastName: user.profile?.lastName || '',
      email: user.email,
      avatarUrl: user.profile?.avatarUrl || null,
      status: user.status,
      performanceStatus: user.teacherProfile?.performanceStatus || 'GOOD_STANDING',
      coursesCount: user.courses.length,
      studentsCount,
      averageRating: user.teacherProfile?.averageRating ? user.teacherProfile.averageRating.toNumber() : 0,
      totalRevenue,
      totalEarnings,
      joinedAt: user.createdAt.toISOString(),
      bio: user.profile?.bio || null,
      specialties: user.teacherProfile?.specialties || [],
      recentEnrollments: recentEnrollmentsRaw.map(e => ({
        enrollmentId: e.id,
        studentName: `${e.user.profile?.firstName} ${e.user.profile?.lastName}`,
        courseTitle: e.course.title,
        enrolledAt: e.enrolledAt.toISOString()
      })),
      payoutsCount: user.payouts.length
    };
  }

  /**
   * Updates a teacher's status (suspension/activation)
   */
  async updateTeacherStatus(id: string, status: UserStatus, performanceStatus?: PerformanceStatus) {
    const user = await prisma.user.findUnique({
      where: { id },
      include: { teacherProfile: true }
    });

    if (!user) {
      throw new Error('Teacher not found');
    }

    await prisma.user.update({
      where: { id },
      data: { status }
    });

    if (user.teacherProfile && performanceStatus) {
      await prisma.teacherProfile.update({
        where: { id: user.teacherProfile.id },
        data: { performanceStatus }
      });
    }

    return true;
  }

  /**
   * Retrieves all courses for a specific teacher
   */
  async getTeacherCourses(userId: string) {
    const courses = await prisma.course.findMany({
      where: { teacherId: userId },
      include: {
        _count: {
          select: { enrollments: true }
        },
        transactions: {
          where: { status: 'SUCCESS' },
          select: { amount: true }
        },
        reviews: {
          select: { rating: true }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    return courses.map(course => {
      const revenue = course.transactions.reduce((acc, tx) => acc + tx.amount.toNumber(), 0);
      const totalRating = course.reviews.reduce((acc, rev) => acc + rev.rating, 0);
      const averageRating = course.reviews.length > 0 ? totalRating / course.reviews.length : 0;

      return {
        id: course.id,
        title: course.title,
        slug: course.slug,
        status: course.status,
        enrollmentsCount: course._count.enrollments,
        averageRating: Number(averageRating.toFixed(2)),
        revenue,
        publishedAt: course.publishedAt?.toISOString() || null
      };
    });
  }

  /**
   * Retrieves all students enrolled in a specific teacher's courses
   */
  async getTeacherStudents(userId: string) {
    const enrollments = await prisma.enrollment.findMany({
      where: { course: { teacherId: userId } },
      include: {
        user: { include: { profile: true } },
        course: { select: { title: true } }
      },
      orderBy: { enrolledAt: 'desc' }
    });

    return enrollments.map(e => ({
      userId: e.user.id,
      firstName: e.user.profile?.firstName || '',
      lastName: e.user.profile?.lastName || '',
      email: e.user.email,
      avatarUrl: e.user.profile?.avatarUrl || null,
      courseTitle: e.course.title,
      enrolledAt: e.enrolledAt.toISOString(),
      completedAt: e.completedAt?.toISOString() || null,
      status: e.status
    }));
  }

  /**
   * Retrieves all reviews for a specific teacher's courses
   */
  async getTeacherReviews(userId: string) {
    const reviews = await prisma.review.findMany({
      where: { course: { teacherId: userId } },
      include: {
        student: { include: { profile: true } },
        course: { select: { title: true } }
      },
      orderBy: { createdAt: 'desc' }
    });

    return reviews.map(r => ({
      id: r.id,
      rating: r.rating,
      comment: r.comment,
      courseTitle: r.course.title,
      studentName: r.student.profile ? `${r.student.profile.firstName} ${r.student.profile.lastName}` : 'Anonymous',
      createdAt: r.createdAt.toISOString()
    }));
  }

  /**
   * Retrieves all payouts for a specific teacher
   */
  async getTeacherPayouts(userId: string) {
    const payouts = await prisma.payout.findMany({
      where: { teacherId: userId },
      orderBy: { createdAt: 'desc' }
    });

    return payouts.map(p => ({
      id: p.id,
      amount: p.amount.toNumber(),
      grossRevenue: p.grossRevenue.toNumber(),
      currency: p.currency,
      status: p.status,
      periodStart: p.periodStart.toISOString(),
      periodEnd: p.periodEnd.toISOString(),
      txCount: p.txCount,
      processedAt: p.processedAt?.toISOString() || null,
      createdAt: p.createdAt.toISOString()
    }));
  }
}

export const teachersService = new TeachersService();
