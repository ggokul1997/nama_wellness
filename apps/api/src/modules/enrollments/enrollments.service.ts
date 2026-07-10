import { enrollmentsRepository } from './enrollments.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';
import { Errors } from '../../utils/errors.js';
import type { UpdateLessonProgressInput } from '@nama/shared';
import type { LessonProgress } from '@prisma/client';
import { authRepository } from '../auth/auth.repository.js';
import { prisma } from '../../infrastructure/database/prisma.client.js';

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

  async getCompanyAvailableCourses(userId: string) {
    const employeeRecords = await prisma.companyEmployee.findMany({
      where: { userId },
      include: { company: true }
    });
    
    if (!employeeRecords.length) return [];
    
    const companyIds = employeeRecords.map(e => e.companyId);
    
    // Fetch licenses
    const allLicenses = await prisma.companyLicense.findMany({
      where: {
        companyId: { in: companyIds },
      },
      include: {
        course: { select: { id: true, title: true, coverImageUrl: true, description: true } },
        company: { select: { name: true } }
      }
    });

    // Filter licenses where usedSeats < totalSeats
    return allLicenses.filter(l => l.usedSeats < l.totalSeats);
  },

  async enrollViaCompany(userId: string, courseId: string) {
    return prisma.$transaction(async (tx) => {
      // 1. Check if user is already enrolled
      const existing = await tx.enrollment.findUnique({
        where: { userId_courseId: { userId, courseId } }
      });
      if (existing) {
        throw Errors.badRequest('User is already enrolled in this course');
      }

      // 2. Find user's companies
      const employeeRecords = await tx.companyEmployee.findMany({
        where: { userId }
      });
      const companyIds = employeeRecords.map(e => e.companyId);
      
      if (companyIds.length === 0) {
        throw Errors.forbidden('User does not belong to any company');
      }

      // 3. Find an available license for this course
      const license = await tx.companyLicense.findFirst({
        where: {
          courseId,
          companyId: { in: companyIds }
        }
      });

      if (!license || license.usedSeats >= license.totalSeats) {
        throw Errors.badRequest('No available seats for this course in your company');
      }

      // 4. Atomically increment usedSeats
      const updatedLicense = await tx.companyLicense.updateMany({
        where: {
          id: license.id,
          usedSeats: license.usedSeats // Optimistic locking
        },
        data: {
          usedSeats: { increment: 1 }
        }
      });

      if (updatedLicense.count === 0) {
        throw Errors.badRequest('Seat was taken by someone else. Please try again.');
      }

      // 5. Create enrollment
      return tx.enrollment.create({
        data: {
          userId,
          courseId,
          status: 'ACTIVE'
        }
      });
    });
  },

  async getCourseProgress(userId: string, courseId: string) {
    const enrollment = await enrollmentsRepository.getCourseProgress(userId, courseId);
    return enrollment || null;
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
      data.progressPercent ?? (data.status === 'COMPLETED' ? 100 : 0),
      data.lastWatchedTimestamp
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
