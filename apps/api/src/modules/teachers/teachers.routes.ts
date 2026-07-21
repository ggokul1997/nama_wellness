import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { 
  getTeacherSummary, 
  getTeachersList, 
  getTeacherDetails, 
  updateTeacherStatus,
  getTeacherCourses,
  getTeacherStudents,
  getTeacherReviews,
  getTeacherPayouts
} from './teachers.controller.js';

const router: Router = Router();

// All routes require ADMIN access
router.use(authenticate, authorize('ADMIN'));

router.get('/summary', getTeacherSummary);
router.get('/', getTeachersList);
router.get('/:id', getTeacherDetails);
router.patch('/:id/status', updateTeacherStatus);
router.get('/:id/courses', getTeacherCourses);
router.get('/:id/students', getTeacherStudents);
router.get('/:id/reviews', getTeacherReviews);
router.get('/:id/payouts', getTeacherPayouts);

export default router;
