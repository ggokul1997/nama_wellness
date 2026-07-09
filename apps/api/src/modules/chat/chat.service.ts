import { chatRepository } from './chat.repository.js';
import { Errors } from '../../utils/errors.js';

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

  async sendMessage(sessionId: string, senderId: string, content: string) {
    if (!content || !content.trim()) {
      throw Errors.badRequest('Message content cannot be empty');
    }

    const session = await chatRepository.getSessionById(sessionId);
    if (!session) throw Errors.notFound('Session');
    if (session.studentId !== senderId && session.teacherId !== senderId) {
      throw Errors.forbidden('Access denied to this session');
    }

    return chatRepository.createMessage(sessionId, senderId, content.trim());
  },
};
