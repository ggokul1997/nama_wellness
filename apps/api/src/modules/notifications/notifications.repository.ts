import { prisma } from '../../infrastructure/database/prisma.client.js';
import { NotificationType } from '@prisma/client';

export const notificationsRepository = {
  async createNotification(data: {
    userId: string;
    title: string;
    message: string;
    link?: string;
    type?: NotificationType;
  }) {
    return prisma.notification.create({
      data,
    });
  },

  async getUserNotifications(userId: string) {
    return prisma.notification.findMany({
      where: { userId },
      orderBy: { createdAt: 'desc' },
      take: 50,
    });
  },

  async markAsRead(notificationId: string) {
    return prisma.notification.update({
      where: { id: notificationId },
      data: { isRead: true },
    });
  },

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: { userId, isRead: false },
      data: { isRead: true },
    });
  },
};
