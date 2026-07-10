import { prisma } from '../../infrastructure/database/prisma.client.js';

export const enrollmentsRepository = {
  async createEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.create({
      data: {
        userId,
        courseId,
        status: 'ACTIVE',
      },
    });
  },

  async getEnrollment(userId: string, courseId: string) {
    return prisma.enrollment.findUnique({
      where: {
        userId_courseId: {
          userId,
          courseId,
        },
      },
    });
  },

  async getMyEnrollments(userId: string) {
    return prisma.enrollment.findMany({
      where: { userId },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: true,
              }
            },
            teacher: {
              include: { profile: true }
            }
          }
        },
        progress: true,
      },
      orderBy: { enrolledAt: 'desc' },
    });
  },

  async getCourseProgress(userId: string, courseIdOrSlug: string) {
    return prisma.enrollment.findFirst({
      where: {
        userId,
        course: {
          OR: [
            { id: courseIdOrSlug },
            { slug: courseIdOrSlug }
          ]
        }
      },
      include: {
        course: {
          include: {
            modules: {
              include: {
                lessons: {
                  orderBy: { sortOrder: 'asc' }
                },
              },
              orderBy: { sortOrder: 'asc' }
            },
            studyMaterials: {
              where: { approvalStatus: 'APPROVED' }
            }
          }
        },
        progress: true,
      }
    });
  },

  async upsertLessonProgress(enrollmentId: string, lessonId: string, status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED', progressPercent: number, lastWatchedTimestamp?: number) {
    return prisma.lessonProgress.upsert({
      where: {
        enrollmentId_lessonId: {
          enrollmentId,
          lessonId,
        },
      },
      update: {
        status,
        progressPercent,
        ...(lastWatchedTimestamp !== undefined && { lastWatchedTimestamp }),
        lastAccessedAt: new Date(),
      },
      create: {
        enrollmentId,
        lessonId,
        status,
        progressPercent,
        ...(lastWatchedTimestamp !== undefined && { lastWatchedTimestamp }),
      },
    });
  },

  async markEnrollmentCompleted(enrollmentId: string) {
    return prisma.enrollment.update({
      where: { id: enrollmentId },
      data: {
        status: 'COMPLETED',
        completedAt: new Date(),
      },
    });
  },

  async getCourseLessonsCount(courseId: string) {
    const modules = await prisma.courseModule.findMany({
      where: { courseId },
      include: {
        _count: {
          select: { lessons: true }
        }
      }
    });
    return modules.reduce((total: number, mod: { _count: { lessons: number } }) => total + mod._count.lessons, 0);
  }
};
