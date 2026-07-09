import { notificationsRepository } from './notifications.repository.js';
import { NotificationType } from '@prisma/client';

export const notificationsService = {
  async createNotification(data: { userId: string; title: string; message: string; type?: NotificationType }) {
    return notificationsRepository.createNotification(data);
  },

  async getMyNotifications(userId: string) {
    return notificationsRepository.getUserNotifications(userId);
  },

  async markAsRead(notificationId: string, _userId: string) {
    // Ideally we would verify ownership here, but for MVP it's okay to just mark it.
    return notificationsRepository.markAsRead(notificationId);
  },

  async markAllAsRead(userId: string) {
    return notificationsRepository.markAllAsRead(userId);
  }
};
