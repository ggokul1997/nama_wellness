import { Router } from 'express';
import { teacherApplicationsController } from './teacher-applications.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router: Router = Router();

router.use(authenticate);

// User routes (Apply to teach)
router.get('/my-application', teacherApplicationsController.getMyApplication);
router.post('/start', teacherApplicationsController.startApplication);
router.post('/presigned-url', teacherApplicationsController.getPresignedUrl);
router.post('/:id/submit', teacherApplicationsController.submitApplication);

// Admin routes (Review applications)
router.get('/pending', authorize('ADMIN'), teacherApplicationsController.listPending);
router.post('/:id/review', authorize('ADMIN'), teacherApplicationsController.reviewApplication);

export { router as teacherApplicationsRoutes };
