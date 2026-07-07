import { Request, Response } from 'express';
import { paymentsService } from './payments.service.js';

export const createOrder = async (req: Request, res: Response) => {
  try {
    const { courseId } = req.body;
    const userId = req.user?.sub; // Assuming user is attached via authenticate middleware

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!courseId) {
      return res.status(400).json({ error: 'courseId is required' });
    }

    const order = await paymentsService.createOrder(userId, courseId);
    return res.status(200).json({ success: true, data: order });
  } catch (error: any) {
    console.error('Error creating order:', error);
    return res.status(500).json({ success: false, error: { message: error.message || 'Failed to create order' } });
  }
};

export const getMyTransactions = async (req: Request, res: Response) => {
  try {
    const userId = req.user?.sub;
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const transactions = await paymentsService.getMyTransactions(userId);
    return res.status(200).json({ success: true, data: { transactions } });
  } catch (error: any) {
    console.error('Error fetching transactions:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch transactions' } });
  }
};

export const handleRazorpayWebhook = async (req: Request, res: Response) => {
  const signature = req.headers['x-razorpay-signature'] as string;
  const rawBody = (req as any).rawBody;

  if (!signature || !rawBody) {
    return res.status(400).send('Missing x-razorpay-signature or raw body');
  }

  try {
    await paymentsService.handleWebhook(signature, rawBody);
    return res.status(200).json({ received: true });
  } catch (err: any) {
    console.error('Webhook Error:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }
};
