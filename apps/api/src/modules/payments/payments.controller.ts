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

export const verifyPayment = async (req: Request, res: Response) => {
  try {
    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    if (!razorpay_order_id || !razorpay_payment_id || !razorpay_signature) {
      return res.status(400).json({ success: false, error: { message: 'Missing payment verification details' } });
    }

    await paymentsService.verifyPayment(razorpay_order_id, razorpay_payment_id, razorpay_signature);
    return res.status(200).json({ success: true, data: { verified: true } });
  } catch (error: any) {
    console.error('Verify error:', error);
    return res.status(500).json({ success: false, error: { message: error.message || 'Payment verification failed' } });
  }
};

export const cancelOrder = async (req: Request, res: Response) => {
  try {
    const orderId = req.params.orderId as string;
    const userId = req.user?.sub;

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (!orderId) {
      return res.status(400).json({ error: 'orderId is required' });
    }

    await paymentsService.cancelOrder(orderId, userId);
    return res.status(200).json({ success: true, data: { cancelled: true } });
  } catch (error: any) {
    console.error('Cancel order error:', error);
    return res.status(500).json({ success: false, error: { message: error.message || 'Failed to cancel order' } });
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
