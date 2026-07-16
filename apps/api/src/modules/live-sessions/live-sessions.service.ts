import { liveSessionsRepository } from './live-sessions.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';
import { Errors } from '../../utils/errors.js';
import { ScheduleLiveSessionInput } from '@nama/shared';

export const liveSessionsService = {
  async scheduleSession(teacherId: string, courseId: string, input: ScheduleLiveSessionInput) {
    const course = await coursesRepository.findById(courseId);
    if (!course || course.teacherId !== teacherId) {
      throw Errors.forbidden('You are not authorized to schedule sessions for this course.');
    }

    if (course.courseType !== 'HYBRID') {
      throw Errors.badRequest('Only HYBRID courses can have scheduled group sessions.');
    }

    const scheduledAt = new Date(input.scheduledAt);
    const now = Date.now();
    const oneDay = 24 * 60 * 60 * 1000;
    const sevenDays = 7 * oneDay;

    if (scheduledAt.getTime() <= now + oneDay) {
      throw Errors.badRequest('Sessions must be scheduled at least 24 hours in advance.');
    }

    if (scheduledAt.getTime() > now + sevenDays) {
      throw Errors.badRequest('Sessions cannot be scheduled more than 7 days in advance.');
    }

    if (scheduledAt.getMinutes() % 30 !== 0 || scheduledAt.getSeconds() !== 0) {
      throw Errors.badRequest('Sessions must start on the hour or half-hour mark (e.g., 9:00, 9:30).');
    }

    if (input.durationMinutes % 30 !== 0) {
      throw Errors.badRequest('Session duration must be in 30-minute increments.');
    }

    return liveSessionsRepository.createLiveSession({
      courseId,
      title: input.title,
      description: input.description,
      meetingUrl: input.meetingUrl,
      scheduledAt: new Date(input.scheduledAt),
      durationMinutes: input.durationMinutes,
    });
  },

  async getSessionsForCourse(courseId: string) {
    return liveSessionsRepository.getLiveSessionsForCourse(courseId);
  },

  async getStudentUpcomingSessions(studentId: string) {
    return liveSessionsRepository.getStudentUpcomingSessions(studentId);
  },

  async getTeacherUpcomingSessions(teacherId: string) {
    return liveSessionsRepository.getTeacherUpcomingSessions(teacherId);
  },

  async deleteSession(teacherId: string, sessionId: string) {
    const session = await liveSessionsRepository.findById(sessionId);
    if (!session) {
      throw Errors.notFound('Session not found.');
    }

    if (session.course.teacherId !== teacherId) {
      throw Errors.forbidden('You are not authorized to delete this session.');
    }

    await liveSessionsRepository.deleteLiveSession(sessionId);
    return { success: true };
  }
};
