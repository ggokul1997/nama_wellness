import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { discussionsController } from './discussions.controller.js';
import { ROLES } from '@nama/shared';

export const router: Router = Router();

// Student / Teacher course-specific routes
router.get('/courses/:courseId', authenticate, discussionsController.getCourseThreads);
router.post('/courses/:courseId', authenticate, discussionsController.createThread);

// Thread specific routes
router.get('/:threadId/replies', authenticate, discussionsController.getThreadReplies);
router.post('/:threadId/replies', authenticate, discussionsController.createReply);

// Teacher global routes
router.get('/teacher/all', authenticate, authorize(ROLES.TEACHER), discussionsController.getTeacherThreads);

export default router;
