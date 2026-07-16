import { Router } from 'express';
import { bookingsController } from './bookings.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { ROLES } from '@nama/shared';

const router = Router();

// Ensure all routes require authentication
router.use(authenticate);

// --- Availability ---
router.get('/availability/:teacherId', bookingsController.getAvailability);
router.put('/availability', authorize(ROLES.TEACHER), bookingsController.updateAvailability);

// --- Pricing ---
router.get('/pricing/:teacherId', bookingsController.getPricing);
router.post('/pricing', authorize(ROLES.TEACHER), bookingsController.createPricing);
router.patch('/pricing/:pricingId', authorize(ROLES.TEACHER), bookingsController.updatePricing);

// --- Bookings ---
router.get('/my-bookings', bookingsController.getMyBookings);
router.post('/', authorize(ROLES.STUDENT, ROLES.EMPLOYEE), bookingsController.createBooking);
router.patch('/:bookingId/status', bookingsController.updateBookingStatus);

export const bookingsRoutes: Router = router;
