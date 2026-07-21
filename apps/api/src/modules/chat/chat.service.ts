import { chatRepository } from './chat.repository.js';
import { Errors } from '../../utils/errors.js';
import { notificationsService } from '../notifications/notifications.service.js';
import { logger } from '../../infrastructure/logger/logger.js';

export const chatService = {
  async getSessions(userId: string) {
    return chatRepository.getSessionsForUser(userId);
  },

  async getOrCreateSession(studentId: string, teacherId: string, courseId: string, requestUserId: string) {
    // Basic validation: user can only create a session if they are one of the participants
    if (studentId !== requestUserId && teacherId !== requestUserId) {
      throw Errors.forbidden('You can only create a session for yourself.');
    }

    let session = await chatRepository.findSession(studentId, courseId);
    if (!session) {
      session = await chatRepository.createSession(studentId, teacherId, courseId);
    }
    return session;
  },

  async getMessages(sessionId: string, userId: string, skip?: number, take?: number) {
    const session = await chatRepository.getSessionById(sessionId);
    if (!session) throw Errors.notFound('Session');
    if (session.studentId !== userId && session.teacherId !== userId) {
      throw Errors.forbidden('Access denied to this session');
    }
    
    // Mark messages as read when we fetch them
    await chatRepository.markMessagesAsRead(sessionId, userId);
    
    return chatRepository.getMessages(sessionId, skip, take);
  },

  async markAsRead(sessionId: string, userId: string) {
    const session = await chatRepository.getSessionById(sessionId);
    if (!session) throw Errors.notFound('Session');
    if (session.studentId !== userId && session.teacherId !== userId) {
      throw Errors.forbidden('Access denied to this session');
    }
    
    await chatRepository.markMessagesAsRead(sessionId, userId);
    return true;
  },

  async sendMessage(sessionId: string, senderId: string, content: string) {
    if (!content || !content.trim()) {
      throw Errors.badRequest('Message content cannot be empty');
    }

    const session = await chatRepository.getSessionById(sessionId);
    if (!session) throw Errors.notFound('Session');
    if (session.studentId !== senderId && session.teacherId !== senderId) {
      throw Errors.forbidden('Access denied to this session');
    }

    const message = await chatRepository.createMessage(sessionId, senderId, content.trim());
    
    // Determine recipient and their role based on who sent it
    const isSenderStudent = senderId === session.studentId;
    const recipientId = isSenderStudent ? session.teacherId : session.studentId;
    const link = isSenderStudent ? `/teacher/chat` : `/student/chat`;

    notificationsService.createNotification({
      userId: recipientId,
      title: 'New Chat Message 💬',
      message: 'You have a new message in chat.',
      link,
      type: 'INFO'
    }).catch(err => logger.error({ err }, 'Failed to notify about new chat message'));

    return { message, session };
  },
};
