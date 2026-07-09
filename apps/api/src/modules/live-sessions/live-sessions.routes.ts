import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES, scheduleLiveSessionSchema } from '@nama/shared';
import { validate } from '../../middleware/validate.js';
import { scheduleSession, getCourseSessions, getStudentBookings, getTeacherBookings, deleteSession } from './live-sessions.controller.js';

const router = Router();

// Student routes
router.get('/student/bookings', authenticate, authorize(ROLES.STUDENT, ROLES.EMPLOYEE), getStudentBookings);

// Teacher routes
router.get('/teacher/bookings', authenticate, authorize(ROLES.TEACHER), getTeacherBookings);
router.post('/course/:courseId', authenticate, authorize(ROLES.TEACHER), validate(scheduleLiveSessionSchema), scheduleSession);
router.delete('/:sessionId', authenticate, authorize(ROLES.TEACHER), deleteSession);

// Public / Enrolled Student routes (to fetch sessions for a specific course)
router.get('/course/:courseId', getCourseSessions);

export const liveSessionsRouter: Router = router;
