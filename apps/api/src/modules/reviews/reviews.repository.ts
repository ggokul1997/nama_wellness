import { prisma } from '../../infrastructure/database/prisma.client.js';

export const reviewsRepository = {
  async createReview(data: {
    courseId: string;
    studentId: string;
    enrollmentId: string;
    rating: number;
    comment?: string;
  }) {
    return prisma.review.create({
      data,
      include: {
        student: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  },

  async findReviewByEnrollmentId(enrollmentId: string) {
    return prisma.review.findUnique({
      where: { enrollmentId },
    });
  },

  async getReviewsForCourse(courseId: string) {
    return prisma.review.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      include: {
        student: {
          select: {
            id: true,
            profile: {
              select: { firstName: true, lastName: true },
            },
          },
        },
      },
    });
  },

  async calculateAverageRatingForTeacher(teacherId: string) {
    const result = await prisma.review.aggregate({
      where: {
        course: { teacherId },
      },
      _avg: { rating: true },
      _count: { id: true },
    });

    return {
      averageRating: result._avg.rating || 0,
      totalReviews: result._count.id || 0,
    };
  },

  async updateTeacherProfileRating(teacherId: string, averageRating: number, totalReviews: number) {
    await prisma.teacherProfile.upsert({
      where: { userId: teacherId },
      update: { averageRating, totalReviews },
      create: {
        userId: teacherId,
        averageRating,
        totalReviews,
      },
    });
  },
};
