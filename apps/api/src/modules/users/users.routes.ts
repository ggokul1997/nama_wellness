import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

export const usersRouter: Router = Router();

// All users routes require authentication
usersRouter.use(authenticate);

usersRouter.get('/profile', usersController.getProfile);
usersRouter.patch('/profile', usersController.updateProfile);
usersRouter.get('/teacher-profile', usersController.getTeacherProfile);

// Admin-only routes
usersRouter.get('/admin', authorize('ADMIN'), usersController.getAdminUsersList);
usersRouter.patch('/admin/:id/status', authorize('ADMIN'), usersController.updateUserStatus);
