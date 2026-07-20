import { prisma } from '../../infrastructure/database/prisma.client.js';

export const discussionsRepository = {
  async getThreadsByCourse(courseId: string, limit = 20, cursor?: string) {
    return prisma.courseDiscussionThread.findMany({
      where: { courseId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            roles: { select: { role: true } },
          }
        },
        _count: { select: { replies: true } }
      }
    });
  },

  async getThreadById(threadId: string) {
    return prisma.courseDiscussionThread.findUnique({
      where: { id: threadId },
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            roles: { select: { role: true } },
          }
        },
        course: { select: { title: true, teacherId: true, slug: true } }
      }
    });
  },

  async getRepliesByThread(threadId: string, limit = 50, cursor?: string) {
    return prisma.courseDiscussionReply.findMany({
      where: { threadId },
      orderBy: { createdAt: 'asc' }, // Oldest first for replies usually makes sense
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            roles: { select: { role: true } },
          }
        }
      }
    });
  },

  async createThread(data: { courseId: string; authorId: string; title: string; content: string }) {
    return prisma.courseDiscussionThread.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            roles: { select: { role: true } },
          }
        },
        _count: { select: { replies: true } }
      }
    });
  },

  async createReply(data: { threadId: string; authorId: string; content: string }) {
    return prisma.courseDiscussionReply.create({
      data,
      include: {
        author: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            roles: { select: { role: true } },
          }
        }
      }
    });
  },
  
  async getTeacherThreads(teacherId: string, limit = 50, cursor?: string) {
    return prisma.courseDiscussionThread.findMany({
      where: {
        course: { teacherId }
      },
      orderBy: { createdAt: 'desc' },
      take: limit,
      ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
      include: {
        course: { select: { title: true } },
        author: {
          select: {
            id: true,
            profile: { select: { firstName: true, lastName: true, avatarUrl: true } },
            roles: { select: { role: true } },
          }
        },
        _count: { select: { replies: true } }
      }
    });
  }
};
