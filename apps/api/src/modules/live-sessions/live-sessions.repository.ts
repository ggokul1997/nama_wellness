import { prisma } from '../../infrastructure/database/prisma.client.js';

export const liveSessionsRepository = {
  async createLiveSession(data: {
    courseId: string;
    title: string;
    description?: string;
    meetingUrl: string;
    scheduledAt: Date;
    durationMinutes: number;
  }) {
    return prisma.liveSession.create({
      data,
    });
  },

  async getLiveSessionsForCourse(courseId: string) {
    return prisma.liveSession.findMany({
      where: { courseId },
      orderBy: { scheduledAt: 'asc' },
    });
  },

  async getStudentUpcomingSessions(studentId: string) {
    // Find all sessions for courses the student is enrolled in
    const enrollments = await prisma.enrollment.findMany({
      where: { userId: studentId, status: 'ACTIVE' },
      select: { courseId: true },
    });
    
    const courseIds = enrollments.map(e => e.courseId);

    return prisma.liveSession.findMany({
      where: {
        courseId: { in: courseIds }
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        course: {
          select: { title: true },
        },
      },
    });
  },

  async getTeacherUpcomingSessions(teacherId: string) {
    return prisma.liveSession.findMany({
      where: {
        course: { teacherId }
      },
      orderBy: { scheduledAt: 'asc' },
      include: {
        course: {
          select: { title: true },
        },
      },
    });
  },

  async deleteLiveSession(sessionId: string) {
    return prisma.liveSession.delete({
      where: { id: sessionId },
    });
  },

  async findById(sessionId: string) {
    return prisma.liveSession.findUnique({
      where: { id: sessionId },
      include: { course: true },
    });
  }
};
