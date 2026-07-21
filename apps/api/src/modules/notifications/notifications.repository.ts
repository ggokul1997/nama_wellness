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

  async getAdminUserIds() {
    const admins = await prisma.user.findMany({
      where: { roles: { some: { role: 'ADMIN' } } },
      select: { id: true },
    });
    return admins.map(a => a.id);
  },

  async getCompanyEmployeeUserIds(companyId: string) {
    const employees = await prisma.companyEmployee.findMany({
      where: { companyId },
      select: { userId: true },
    });
    return employees.map(e => e.userId);
  }
};
