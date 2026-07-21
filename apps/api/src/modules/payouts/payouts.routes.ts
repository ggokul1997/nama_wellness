import { Router } from 'express';
import { generatePayouts, listPayouts, updatePayout, getPayoutTransactions, getPayout, getMyPayouts } from './payouts.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '@nama/shared';

const router = Router();

router.get('/my-payouts', authenticate, authorize(ROLES.TEACHER), getMyPayouts);
router.get('/', authenticate, authorize(ROLES.ADMIN), listPayouts);
router.post('/generate', authenticate, authorize(ROLES.ADMIN), generatePayouts);
router.get('/:id', authenticate, authorize(ROLES.ADMIN), getPayout);
router.patch('/:id', authenticate, authorize(ROLES.ADMIN), updatePayout);
router.get('/:id/transactions', authenticate, authorize(ROLES.ADMIN), getPayoutTransactions);

export const payoutsRouter: Router = router;
