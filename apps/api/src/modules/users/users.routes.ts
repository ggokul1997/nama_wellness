import { Router } from 'express';
import { usersController } from './users.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const usersRouter: Router = Router();

// All users routes require authentication
usersRouter.use(authenticate);

usersRouter.get('/profile', usersController.getProfile);
usersRouter.patch('/profile', usersController.updateProfile);
