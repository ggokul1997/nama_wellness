import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES, createReviewSchema } from '@nama/shared';
import { validate } from '../../middleware/validate.js';
import { createReview, getCourseReviews } from './reviews.controller.js';

const router = Router();

// Public/Student routes
router.get('/:courseId', getCourseReviews);
router.post('/', authenticate, authorize(ROLES.STUDENT, ROLES.EMPLOYEE), validate(createReviewSchema), createReview);

export const reviewsRouter: Router = router;
