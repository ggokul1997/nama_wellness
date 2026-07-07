import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { createOrder, getMyTransactions, handleRazorpayWebhook } from './payments.controller.js';

const router = Router();

// Secure endpoints (require login)
router.post('/orders', authenticate, createOrder);
router.get('/transactions/me', authenticate, getMyTransactions);

// Webhook endpoint
router.post('/webhook', handleRazorpayWebhook);

export const paymentsRouter: Router = router;
