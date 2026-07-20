import { Router } from 'express';
import { getAnalytics, getAllTransactions } from './analytics.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '@nama/shared';

const router = Router();

router.get('/', authenticate, authorize(ROLES.ADMIN), getAnalytics);
router.get('/transactions', authenticate, authorize(ROLES.ADMIN), getAllTransactions);

export const analyticsRouter: Router = router;
