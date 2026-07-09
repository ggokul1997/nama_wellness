import { Request, Response } from 'express';
import { notificationsService } from './notifications.service.js';

export const getMyNotifications = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const notifications = await notificationsService.getMyNotifications(userId);
    return res.status(200).json({ success: true, data: notifications });
  } catch (error: any) {
    console.error('Error fetching notifications:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch notifications' } });
  }
};

export const markAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    const notificationId = req.params.notificationId as string;
    await notificationsService.markAsRead(notificationId, userId);
    return res.status(200).json({ success: true, message: 'Notification marked as read' });
  } catch (error: any) {
    console.error('Error marking notification as read:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to mark notification as read' } });
  }
};

export const markAllAsRead = async (req: Request, res: Response) => {
  try {
    const userId = req.user!.sub;
    await notificationsService.markAllAsRead(userId);
    return res.status(200).json({ success: true, message: 'All notifications marked as read' });
  } catch (error: any) {
    console.error('Error marking all as read:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to mark all as read' } });
  }
};
