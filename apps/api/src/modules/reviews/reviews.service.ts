import { reviewsRepository } from './reviews.repository.js';
import { enrollmentsRepository } from '../enrollments/enrollments.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';
import { Errors } from '../../utils/errors.js';
import { CreateReviewInput } from '@nama/shared';
import { notificationsService } from '../notifications/notifications.service.js';
import { logger } from '../../infrastructure/logger/logger.js';

export const reviewsService = {
  async createReview(studentId: string, input: CreateReviewInput) {
    // Check if enrolled and completed
    const enrollment = await enrollmentsRepository.getEnrollment(studentId, input.courseId);
    if (!enrollment) {
      throw Errors.forbidden('You must be enrolled in this course to review it.');
    }
    
    if (enrollment.status !== 'COMPLETED') {
      throw Errors.forbidden('You can only review a course after completing it.');
    }

    const existingReview = await reviewsRepository.findReviewByEnrollmentId(enrollment.id);
    if (existingReview) {
      throw Errors.conflict('You have already submitted a review for this course.');
    }

    const course = await coursesRepository.findById(input.courseId);
    if (!course || !course.teacherId) {
      throw Errors.notFound('Course or teacher not found.');
    }

    const review = await reviewsRepository.createReview({
      courseId: input.courseId,
      studentId,
      enrollmentId: enrollment.id,
      rating: input.rating,
      comment: input.comment,
    });

    // Update teacher rating
    const { averageRating, totalReviews } = await reviewsRepository.calculateAverageRatingForTeacher(course.teacherId);
    await reviewsRepository.updateTeacherProfileRating(course.teacherId, averageRating, totalReviews);

    notificationsService.createNotification({
      userId: course.teacherId,
      title: 'New Review Received ⭐',
      message: `A student left a ${input.rating}-star review on your course "${course.title}".`,
      link: `/courses/${course.slug}`,
      type: 'INFO'
    }).catch(err => logger.error({ err }, 'Failed to notify teacher of new review'));

    return review;
  },

  async getCourseReviews(courseId: string) {
    return reviewsRepository.getReviewsForCourse(courseId);
  },
};
