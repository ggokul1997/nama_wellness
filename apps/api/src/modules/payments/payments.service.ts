import Razorpay from 'razorpay';
import crypto from 'crypto';
import { paymentsRepository } from './payments.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';

// Initialize Razorpay (dummy key if not provided)
const key_id = process.env.RAZORPAY_KEY_ID || 'rzp_test_dummy';
const key_secret = process.env.RAZORPAY_KEY_SECRET || 'secret_dummy';
const razorpay = new Razorpay({
  key_id,
  key_secret,
});

export class PaymentsService {
  async createOrder(userId: string, courseId: string) {
    // 1. Fetch course to get its price
    const course = await coursesRepository.findById(courseId);
    if (!course) {
      throw new Error('Course not found');
    }

    const currentPrice = course.pricings?.find(p => p.isCurrent);
    if (!currentPrice || currentPrice.amount.toNumber() <= 0) {
      // Free course logic
      return { orderId: 'FREE', amount: 0, currency: 'INR' };
    }

    const amountInPaise = Math.round(currentPrice.amount.toNumber() * 100);

    // 2. Create Razorpay Order
    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: currentPrice.currency,
      receipt: `receipt_${courseId}_${userId}`.substring(0, 40),
      notes: {
        userId,
        courseId,
      }
    });

    // 3. Create a Pending Transaction in the DB
    await paymentsRepository.createTransaction({
      userId,
      courseId,
      amount: currentPrice.amount,
      currency: currentPrice.currency,
      razorpayOrderId: order.id,
      status: 'PENDING'
    });

    return { 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency 
    };
  }

  async handleWebhook(signature: string, body: Buffer) {
    const webhookSecret = process.env.RAZORPAY_WEBHOOK_SECRET;
    if (!webhookSecret) {
      throw new Error('RAZORPAY_WEBHOOK_SECRET is not set');
    }

    // Verify Razorpay signature using HMAC SHA256
    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(body.toString('utf8'))
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Webhook signature verification failed');
    }

    // Parse the body now that it is verified
    const event = JSON.parse(body.toString('utf8'));

    // Handle the event
    switch (event.event) {
      case 'order.paid':
      case 'payment.captured': {
        const payload = event.payload.payment?.entity || event.payload.order?.entity;
        await this.handleSuccessfulPayment(payload);
        break;
      }
      default:
        console.log(`Unhandled event type ${event.event}`);
    }

    return { received: true };
  }

  private async handleSuccessfulPayment(entity: any) {
    // Both payment and order payloads should have an order_id
    const orderId = entity.order_id || entity.id; // if order entity, id is order_id
    
    // Notes are attached to the order and payment
    const notes = entity.notes;
    if (!notes || !notes.userId || !notes.courseId) return;

    const { userId, courseId } = notes;

    const transaction = await paymentsRepository.getTransactionByOrderId(orderId);

    if (!transaction) {
      console.error(`Transaction not found for order ${orderId}`);
      return;
    }

    if (transaction.status === 'SUCCESS') {
      // Already processed (idempotency check)
      return;
    }

    // Update Transaction
    await paymentsRepository.updateTransactionStatus(
      transaction.id, 
      'SUCCESS',
      entity.id // this will be the payment_id if event is payment.captured
    );

    // Create Enrollment
    await paymentsRepository.createEnrollment(userId, courseId, transaction.id);
  }

  async getMyTransactions(userId: string) {
    return paymentsRepository.getTransactionsByUser(userId);
  }
}

export const paymentsService = new PaymentsService();
