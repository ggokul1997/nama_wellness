import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '@nama/shared';
import { createOrder, verifyPayment, getMyTransactions, handleRazorpayWebhook, cancelOrder, getTeacherEarnings, createB2BOrder } from './payments.controller.js';

const router = Router();

// Secure endpoints (require login)
router.post('/orders', authenticate, createOrder);
router.post('/orders/b2b', authenticate, authorize(ROLES.COMPANY_ADMIN), createB2BOrder);
router.put('/orders/:orderId/cancel', authenticate, cancelOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/transactions/me', authenticate, getMyTransactions);
router.get('/earnings/teacher', authenticate, authorize(ROLES.TEACHER), getTeacherEarnings);

// Webhook endpoint
router.post('/webhook', handleRazorpayWebhook);

export const paymentsRouter: Router = router;
