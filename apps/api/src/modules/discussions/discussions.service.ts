import { discussionsRepository } from './discussions.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';
import { enrollmentsRepository } from '../enrollments/enrollments.repository.js';
import { notificationsService } from '../notifications/notifications.service.js';
import { Errors } from '../../utils/errors.js';
import { authRepository } from '../auth/auth.repository.js';

export const discussionsService = {
  async getCourseThreads(courseId: string, userId: string, cursor?: string) {
    // Verify user can access course
    await this.verifyAccess(courseId, userId);
    return discussionsRepository.getThreadsByCourse(courseId, 20, cursor);
  },

  async getThreadReplies(threadId: string, userId: string, cursor?: string) {
    const thread = await discussionsRepository.getThreadById(threadId);
    if (!thread) throw Errors.notFound('Thread not found');
    await this.verifyAccess(thread.courseId, userId);
    return discussionsRepository.getRepliesByThread(threadId, 50, cursor);
  },

  async createThread(data: { courseId: string; authorId: string; title: string; content: string }) {
    await this.verifyAccess(data.courseId, data.authorId);
    
    const thread = await discussionsRepository.createThread(data);
    const course = await coursesRepository.findById(data.courseId);
    
    // Notify teacher
    if (course && course.teacherId && course.teacherId !== data.authorId) {
      await notificationsService.createNotification({
        userId: course.teacherId,
        title: 'New Question in Q&A',
        message: `A new question "${data.title}" was posted in ${course.title}.`,
        link: `/teacher/qa`,
        type: 'INFO'
      });
    }
    
    return thread;
  },

  async createReply(data: { threadId: string; authorId: string; content: string }) {
    const thread = await discussionsRepository.getThreadById(data.threadId);
    if (!thread) throw Errors.notFound('Thread not found');
    
    await this.verifyAccess(thread.courseId, data.authorId);
    const reply = await discussionsRepository.createReply(data);
    
    // Notify thread author
    if (thread.authorId !== data.authorId) {
      const isEmployee = thread.author?.roles?.some((r: any) => r.role === 'EMPLOYEE');
      const portal = isEmployee ? 'employee' : 'student';

      await notificationsService.createNotification({
        userId: thread.authorId,
        title: 'New Reply to your Question',
        message: `Someone replied to your question "${thread.title}".`,
        link: `/${portal}/courses/${thread.course.slug}/learn?tab=qa&threadId=${thread.id}`,
        type: 'SUCCESS'
      });
    }
    
    return reply;
  },

  async getTeacherThreads(teacherId: string, cursor?: string) {
    return discussionsRepository.getTeacherThreads(teacherId, 50, cursor);
  },

  async verifyAccess(courseId: string, userId: string) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw Errors.notFound('Course not found');
    
    if (course.teacherId === userId) return true;
    
    const user = await authRepository.findUserById(userId);
    if (user?.roles.some(r => r.role === 'ADMIN')) return true;
    
    const enrollment = await enrollmentsRepository.getEnrollment(userId, courseId);
    if (!enrollment) throw Errors.forbidden('You must be enrolled in this course to access discussions.');
    
    return true;
  }
};
