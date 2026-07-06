import { enrollmentsRepository } from './enrollments.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';
import { Errors } from '../../utils/errors.js';
import type { UpdateLessonProgressInput } from '@nama/shared';
import type { LessonProgress } from '@prisma/client';
import { authRepository } from '../auth/auth.repository.js';

export const enrollmentsService = {
  async adminAssignCourse(userEmail: string, courseId: string) {
    const user = await authRepository.findUserByEmail(userEmail);
    if (!user) {
      throw Errors.badRequest('User with this email not found');
    }
    const userId = user.id;

    const course = await coursesRepository.findById(courseId);
    if (!course || course.status !== 'PUBLISHED') {
      throw Errors.badRequest('Invalid or unpublished course');
    }

    const existing = await enrollmentsRepository.getEnrollment(userId, courseId);
    if (existing) {
      throw Errors.badRequest('User is already enrolled in this course');
    }

    return enrollmentsRepository.createEnrollment(userId, courseId);
  },

  async getMyCourses(userId: string) {
    const enrollments = await enrollmentsRepository.getMyEnrollments(userId);
    
    return enrollments.map((enrollment) => {
      // Calculate progress
      let totalLessons = 0;
      enrollment.course.modules.forEach((m) => {
        totalLessons += m.lessons.length;
      });

      const completedLessons = enrollment.progress.filter((p: LessonProgress) => p.status === 'COMPLETED').length;
      const progressPercent = totalLessons === 0 ? 0 : Math.round((completedLessons / totalLessons) * 100);

      return {
        enrollment,
        completedLessons,
        totalLessons,
        overallProgressPercent: progressPercent
      };
    });
  },

  async getCourseProgress(userId: string, courseId: string) {
    const enrollment = await enrollmentsRepository.getCourseProgress(userId, courseId);
    if (!enrollment) {
      throw Errors.notFound('Enrollment not found');
    }
    return enrollment;
  },

  async updateLessonProgress(userId: string, courseId: string, lessonId: string, data: UpdateLessonProgressInput) {
    const enrollment = await enrollmentsRepository.getEnrollment(userId, courseId);
    if (!enrollment) {
      throw Errors.notFound('Enrollment not found');
    }

    const progress = await enrollmentsRepository.upsertLessonProgress(
      enrollment.id,
      lessonId,
      data.status,
      data.progressPercent ?? (data.status === 'COMPLETED' ? 100 : 0)
    );

    // Check if course is now fully completed
    if (data.status === 'COMPLETED' && enrollment.status !== 'COMPLETED') {
      const allProgress = await enrollmentsRepository.getCourseProgress(userId, courseId);
      if (allProgress) {
        const completedCount = allProgress.progress.filter((p: LessonProgress) => p.status === 'COMPLETED').length;
        const totalLessons = await enrollmentsRepository.getCourseLessonsCount(courseId);
        
        if (completedCount >= totalLessons && totalLessons > 0) {
          await enrollmentsRepository.markEnrollmentCompleted(enrollment.id);
        }
      }
    }

    return progress;
  }
};
