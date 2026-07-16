import Razorpay from 'razorpay';
import crypto from 'crypto';
import { paymentsRepository } from './payments.repository.js';
import { coursesRepository } from '../courses/courses.repository.js';
import { companiesRepository } from '../companies/companies.repository.js';
import { bookingsRepository } from '../bookings/bookings.repository.js';

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
      // Free course logic: Create transaction and enrollment immediately
      const transaction = await paymentsRepository.createTransaction({
        userId,
        courseId,
        amount: currentPrice ? currentPrice.amount : 0,
        currency: 'INR',
        razorpayOrderId: 'FREE_' + Date.now(),
        status: 'SUCCESS'
      });
      await paymentsRepository.createEnrollment(userId, courseId, transaction.id);
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

  async createBookingOrder(userId: string, bookingId: string) {
    const booking = await bookingsRepository.getBookingById(bookingId);
    if (!booking) throw new Error('Booking not found');
    if (booking.studentId !== userId) throw new Error('Unauthorized');
    if (booking.status !== 'PENDING_PAYMENT') throw new Error('Booking is not pending payment');

    const pricing = booking.pricing;
    const amountInPaise = Math.round(pricing.amount.toNumber() * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: pricing.currency,
      receipt: `booking_${bookingId}`.substring(0, 40),
      notes: {
        type: 'BOOKING',
        userId,
        bookingId,
      }
    });

    await paymentsRepository.createTransaction({
      userId,
      bookingId,
      amount: pricing.amount,
      currency: pricing.currency,
      razorpayOrderId: order.id,
      status: 'PENDING'
    });

    return { 
      orderId: order.id, 
      amount: order.amount, 
      currency: order.currency 
    };
  }

  async createB2BOrder(adminId: string, companyId: string, courseId: string, seats: number) {
    const course = await coursesRepository.findById(courseId);
    if (!course) throw new Error('Course not found');
    
    if (!course.isAvailableForCorporate || !course.corporatePrice) {
      throw new Error('Course is not available for corporate purchase');
    }

    const totalAmount = course.corporatePrice.toNumber() * seats;
    const amountInPaise = Math.round(totalAmount * 100);

    const order = await razorpay.orders.create({
      amount: amountInPaise,
      currency: 'INR',
      receipt: `b2b_${companyId}_${courseId}`.substring(0, 40),
      notes: {
        type: 'B2B',
        userId: adminId, // The admin making the purchase
        courseId,
        companyId,
        seats: seats.toString(),
      }
    });

    await paymentsRepository.createTransaction({
      userId: adminId,
      courseId,
      amount: totalAmount,
      currency: 'INR',
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
    if (!notes || !notes.userId) return;
    if (!notes.courseId && notes.type !== 'BOOKING') return;

    const { userId, courseId, bookingId } = notes;

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

    if (notes.type === 'B2B' && notes.companyId && notes.seats) {
      const seats = parseInt(notes.seats, 10);
      if (seats > 0) {
        await companiesRepository.purchaseLicense(notes.companyId, courseId, seats);
      }
    } else if (notes.type === 'BOOKING' && bookingId) {
      await paymentsRepository.linkBookingToTransaction(transaction.id, bookingId);
    } else {
      // Create Enrollment for B2C
      await paymentsRepository.createEnrollment(userId, courseId, transaction.id);
    }
  }

  async verifyPayment(orderId: string, paymentId: string, signature: string) {
    const webhookSecret = process.env.RAZORPAY_KEY_SECRET; // verification from frontend uses key_secret, not webhook secret
    if (!webhookSecret) {
      throw new Error('RAZORPAY_KEY_SECRET is not set');
    }

    const expectedSignature = crypto
      .createHmac('sha256', webhookSecret)
      .update(`${orderId}|${paymentId}`)
      .digest('hex');

    if (expectedSignature !== signature) {
      throw new Error('Payment signature verification failed');
    }

    const transaction = await paymentsRepository.getTransactionByOrderId(orderId);
    if (!transaction) throw new Error('Transaction not found');
    
    if (transaction.status === 'SUCCESS') {
      return { success: true };
    }

    // Update Transaction
    await paymentsRepository.updateTransactionStatus(
      transaction.id, 
      'SUCCESS',
      paymentId
    );

    // Fetch order to read notes
    const order = await razorpay.orders.fetch(orderId);
    const notes = order.notes as any;

    if (notes && notes.type === 'B2B' && notes.companyId && notes.seats) {
      const seats = parseInt(notes.seats, 10);
      if (seats > 0 && transaction.courseId) {
        await companiesRepository.purchaseLicense(notes.companyId, transaction.courseId, seats);
      }
    } else if (notes && notes.type === 'BOOKING' && transaction.bookingId) {
      await paymentsRepository.linkBookingToTransaction(transaction.id, transaction.bookingId);
    } else if (transaction.courseId) {
      // Create Enrollment
      await paymentsRepository.createEnrollment(transaction.userId, transaction.courseId, transaction.id);
    }

    return { success: true };
  }

  async cancelOrder(orderId: string, userId: string) {
    const transaction = await paymentsRepository.getTransactionByOrderId(orderId);
    if (!transaction) throw new Error('Transaction not found');
    
    // Only allow canceling pending transactions belonging to the user
    if (transaction.userId !== userId) throw new Error('Unauthorized');
    if (transaction.status !== 'PENDING') {
      return { success: true, message: 'Transaction is already processed' };
    }

    await paymentsRepository.updateTransactionStatus(transaction.id, 'FAILED');
    return { success: true };
  }

  async getMyTransactions(userId: string) {
    return paymentsRepository.getTransactionsByUser(userId);
  }

  async getTeacherEarnings(teacherId: string) {
    const transactions = await paymentsRepository.getTeacherTransactions(teacherId);
    
    let totalSalesCount = 0;
    let grossRevenue = 0;
    let totalEarnings = 0;

    const TEACHER_CUT_PERCENTAGE = 0.70; // 70%

    const recentTransactions = transactions.map(t => {
      totalSalesCount++;
      const amount = t.amount.toNumber();
      grossRevenue += amount;
      
      const teacherCut = amount * TEACHER_CUT_PERCENTAGE;
      totalEarnings += teacherCut;

      const studentName = t.user.profile 
        ? `${t.user.profile.firstName} ${t.user.profile.lastName}`.trim() 
        : undefined;

      const courseTitle = t.course?.title || '1-on-1 Session';

      return {
        id: t.id,
        courseId: t.courseId,
        bookingId: t.bookingId,
        courseTitle,
        amount,
        currency: t.currency,
        teacherCut,
        status: t.status,
        studentName,
        studentEmail: t.user.email,
        createdAt: t.createdAt.toISOString()
      };
    });

    return {
      totalSalesCount,
      grossRevenue,
      totalEarnings,
      currency: 'INR', // Assuming INR as base for MVP
      recentTransactions
    };
  }
}

export const paymentsService = new PaymentsService();
