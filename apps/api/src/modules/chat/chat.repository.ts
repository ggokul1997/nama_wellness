import { prisma } from '../../infrastructure/database/prisma.client.js';

export const chatRepository = {
  async getSessionsForUser(userId: string) {
    return prisma.chatSession.findMany({
      where: {
        OR: [{ studentId: userId }, { teacherId: userId }],
      },
      include: {
        student: { include: { profile: true } },
        teacher: { include: { profile: true } },
        course: { select: { id: true, title: true } },
        messages: {
          orderBy: { createdAt: 'desc' },
          take: 1, // Get the latest message for the preview
        },
      },
      orderBy: { updatedAt: 'desc' },
    });
  },

  async getSessionById(sessionId: string) {
    return prisma.chatSession.findUnique({
      where: { id: sessionId },
      include: {
        student: { include: { profile: true } },
        teacher: { include: { profile: true } },
        course: { select: { id: true, title: true } },
      },
    });
  },

  async findSession(studentId: string, courseId: string) {
    return prisma.chatSession.findUnique({
      where: {
        studentId_courseId: { studentId, courseId },
      },
      include: {
        course: { select: { id: true, title: true } },
      }
    });
  },

  async createSession(studentId: string, teacherId: string, courseId: string) {
    return prisma.chatSession.create({
      data: { studentId, teacherId, courseId },
      include: {
        course: { select: { id: true, title: true } },
      }
    });
  },

  async getMessages(sessionId: string, skip: number = 0, take: number = 50) {
    return prisma.chatMessage.findMany({
      where: { sessionId },
      orderBy: { createdAt: 'desc' },
      skip,
      take,
      include: {
        sender: { include: { profile: true } },
      },
    });
  },

  async createMessage(sessionId: string, senderId: string, content: string) {
    const message = await prisma.chatMessage.create({
      data: { sessionId, senderId, content },
      include: { sender: { include: { profile: true } } },
    });

    // Update the session's updatedAt timestamp
    await prisma.chatSession.update({
      where: { id: sessionId },
      data: { updatedAt: new Date() },
    });

    return message;
  },

  async markMessagesAsRead(sessionId: string, userId: string) {
    return prisma.chatMessage.updateMany({
      where: {
        sessionId,
        senderId: { not: userId },
        isRead: false,
      },
      data: { isRead: true },
    });
  },
};
