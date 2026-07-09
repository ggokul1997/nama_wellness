import { Router } from 'express';
import { authenticate } from '../../middleware/authenticate.js';
import { getMyNotifications, markAsRead, markAllAsRead } from './notifications.controller.js';

const router = Router();

router.use(authenticate);

router.get('/', getMyNotifications);
router.put('/mark-all-read', markAllAsRead);
router.put('/:notificationId/read', markAsRead);

export const notificationsRouter: Router = router;
