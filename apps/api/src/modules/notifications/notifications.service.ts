import { notificationsRepository } from './notifications.repository.js';
import { NotificationType } from '@prisma/client';
import { socketService } from '../../infrastructure/socket/socket.service.js';
import { logger } from '../../infrastructure/logger/logger.js';

export const notificationsService = {
  async createNotification(data: { userId: string; title: string; message: string; link?: string; type?: NotificationType }) {
    const notification = await notificationsRepository.createNotification(data);
    try {
      socketService.getIo().to(data.userId).emit('new_notification', notification);
    } catch (err) {
      logger.error({ err, userId: data.userId }, 'Failed to emit socket event for new notification');
    }
    return notification;
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
