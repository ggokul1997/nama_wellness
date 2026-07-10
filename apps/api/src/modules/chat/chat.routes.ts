import { Router } from 'express';
import { chatController } from './chat.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const chatRouter: Router = Router();

chatRouter.use(authenticate);

chatRouter.get('/sessions', chatController.getSessions);
chatRouter.post('/sessions', chatController.createSession);
chatRouter.get('/sessions/:id/messages', chatController.getMessages);
chatRouter.post('/sessions/:id/read', chatController.markAsRead);
chatRouter.post('/sessions/:id/messages', chatController.sendMessage);
