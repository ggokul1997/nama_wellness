import { describe, it, expect, vi, beforeEach } from 'vitest';
import { enrollmentsService } from './enrollments.service.js';
import { enrollmentsRepository } from './enrollments.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';
import { authRepository } from '../auth/auth.repository.js';

// Mock dependencies
vi.mock('./enrollments.repository.js', () => ({
  enrollmentsRepository: {
    getEnrollment: vi.fn(),
    createEnrollment: vi.fn(),
    getMyEnrollments: vi.fn(),
    getCourseProgress: vi.fn(),
    updateLessonProgress: vi.fn(),
  },
}));

vi.mock('../courses/courses.repository.js', () => ({
  coursesRepository: {
    findById: vi.fn(),
  },
}));

vi.mock('../auth/auth.repository.js', () => ({
  authRepository: {
    findByEmail: vi.fn(),
    findUserByEmail: vi.fn(),
  },
}));

describe('enrollmentsService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('adminAssignCourse', () => {
    it('should assign a course successfully if user exists and course is published', async () => {
      // Setup mocks
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({ id: 'user-1' } as any);
      vi.mocked(coursesRepository.findById).mockResolvedValue({ id: 'course-1', status: 'PUBLISHED' } as any);
      vi.mocked(enrollmentsRepository.getEnrollment).mockResolvedValue(null);
      vi.mocked(enrollmentsRepository.createEnrollment).mockResolvedValue({ id: 'enrollment-1' } as any);

      // Execute
      const result = await enrollmentsService.adminAssignCourse('test@example.com', 'course-1');

      // Assert
      expect(authRepository.findUserByEmail).toHaveBeenCalledWith('test@example.com');
      expect(coursesRepository.findById).toHaveBeenCalledWith('course-1');
      expect(enrollmentsRepository.getEnrollment).toHaveBeenCalledWith('user-1', 'course-1');
      expect(enrollmentsRepository.createEnrollment).toHaveBeenCalledWith('user-1', 'course-1');
      expect(result).toEqual({ id: 'enrollment-1' });
    });

    it('should throw badRequest if user is not found', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue(null);

      await expect(enrollmentsService.adminAssignCourse('test@example.com', 'course-1')).rejects.toThrow(
        'User with this email not found'
      );
    });

    it('should throw badRequest if course is not published', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({ id: 'user-1' } as any);
      vi.mocked(coursesRepository.findById).mockResolvedValue({ id: 'course-1', status: 'DRAFT' } as any);

      await expect(enrollmentsService.adminAssignCourse('test@example.com', 'course-1')).rejects.toThrow(
        'Invalid or unpublished course'
      );
    });

    it('should throw badRequest if user is already enrolled', async () => {
      vi.mocked(authRepository.findUserByEmail).mockResolvedValue({ id: 'user-1' } as any);
      vi.mocked(coursesRepository.findById).mockResolvedValue({ id: 'course-1', status: 'PUBLISHED' } as any);
      vi.mocked(enrollmentsRepository.getEnrollment).mockResolvedValue({ id: 'enrollment-existing' } as any);

      await expect(enrollmentsService.adminAssignCourse('test@example.com', 'course-1')).rejects.toThrow(
        'User is already enrolled in this course'
      );
    });
  });
});
