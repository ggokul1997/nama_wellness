import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { createOrder, verifyPayment, getMyTransactions, handleRazorpayWebhook, cancelOrder } from './payments.controller.js';

const router = Router();

// Secure endpoints (require login)
router.post('/orders', authenticate, createOrder);
router.put('/orders/:orderId/cancel', authenticate, cancelOrder);
router.post('/verify', authenticate, verifyPayment);
router.get('/transactions/me', authenticate, getMyTransactions);

// Webhook endpoint
router.post('/webhook', handleRazorpayWebhook);

export const paymentsRouter: Router = router;
