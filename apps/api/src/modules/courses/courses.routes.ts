import { Router } from 'express';
import { coursesController } from './courses.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router: Router = Router();

// Public routes (uses optional authentication to know if user is enrolled later on)
// For now, these are completely public
router.get('/public', coursesController.getPublicCourses);
router.get('/public/:slug', coursesController.getPublicCourseBySlug);
router.get('/public/id/:id', coursesController.getPublicCourseById);
router.get('/corporate', coursesController.getCorporateCourses);

// All course routes below this require authentication
router.use(authenticate);

// Admin routes (must be before /:id routes to prevent conflict)
router.get('/admin/pending', authorize('ADMIN'), coursesController.adminGetPendingCourses);
router.get('/admin/:id', authorize('ADMIN'), coursesController.adminGetCourse);
router.put('/admin/:id/review', authorize('ADMIN'), coursesController.adminReviewCourse);
router.post('/admin/:id/publish', authorize('ADMIN'), coursesController.adminPublishCourse);
router.patch('/admin/:id/corporate', authorize('ADMIN'), coursesController.updateCorporateSettings);

// *** IMPORTANT: This MUST be before /:id routes to prevent Express matching
// "lessons" as the :id parameter and blocking students with TEACHER-only auth.
// Any enrolled student (or teacher) can stream lesson videos.
router.get('/lessons/:lessonId/stream', coursesController.streamLessonVideo);

// Teacher routes
router.get('/my-courses', authorize('TEACHER'), coursesController.getMyCourses);
router.post('/', authorize('TEACHER'), coursesController.createCourse);
router.get('/:id', authorize('TEACHER'), coursesController.getCourse);
router.put('/:id', authorize('TEACHER'), coursesController.updateCourse);
router.post('/:id/cover/presign', authorize('TEACHER'), coursesController.getPresignedUrl);
router.delete('/:id', authorize('TEACHER'), coursesController.deleteCourse);
router.post('/:id/pricing', authorize('TEACHER'), coursesController.proposePricing);
router.delete('/:id/pricing', authorize('TEACHER'), coursesController.deletePricing);
router.post('/:id/submit', authorize('TEACHER'), coursesController.submitForReview);
router.patch('/:id/clear-feedback', authorize('TEACHER'), coursesController.clearCourseFeedback);

// Module routes
router.get('/:id/modules', authorize('TEACHER'), coursesController.getModules);
router.post('/:id/modules', authorize('TEACHER'), coursesController.createModule);
router.put('/:id/modules/:moduleId', authorize('TEACHER'), coursesController.updateModule);
router.delete('/:id/modules/:moduleId', authorize('TEACHER'), coursesController.deleteModule);

// Lesson routes
router.post('/:id/modules/:moduleId/lessons', authorize('TEACHER'), coursesController.createLesson);
router.put('/:id/modules/:moduleId/lessons/:lessonId', authorize('TEACHER'), coursesController.updateLesson);
router.delete('/:id/modules/:moduleId/lessons/:lessonId', authorize('TEACHER'), coursesController.deleteLesson);
router.post('/:id/modules/:moduleId/lessons/:lessonId/upload/presign', authorize('TEACHER'), coursesController.getPresignedLessonUrl);

export default router;
