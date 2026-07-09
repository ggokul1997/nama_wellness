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

    if (course.courseType !== 'LIVE') {
      throw Errors.badRequest('Only LIVE courses can have scheduled sessions.');
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
