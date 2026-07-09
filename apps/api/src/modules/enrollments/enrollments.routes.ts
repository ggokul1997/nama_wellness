import { Router } from 'express';
import { enrollmentsController } from './enrollments.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '@nama/shared';

const router = Router();

// Ensure all enrollment routes require authentication
router.use(authenticate);

// Student/Employee Routes
router.get('/my-courses', authorize(ROLES.STUDENT, ROLES.EMPLOYEE), enrollmentsController.getMyCourses);
router.get('/company-available', authorize(ROLES.EMPLOYEE), enrollmentsController.getCompanyAvailableCourses);
router.post('/company-enroll/:courseId', authorize(ROLES.EMPLOYEE), enrollmentsController.enrollViaCompany);
router.get('/:courseId/progress', authorize(ROLES.STUDENT, ROLES.EMPLOYEE), enrollmentsController.getCourseProgress);
router.post('/:courseId/lessons/:lessonId/progress', authorize(ROLES.STUDENT, ROLES.EMPLOYEE), enrollmentsController.updateLessonProgress);

// Admin Routes
router.post('/admin/assign', authorize(ROLES.ADMIN), enrollmentsController.adminAssignCourse);

export const enrollmentsRoutes: Router = router;
