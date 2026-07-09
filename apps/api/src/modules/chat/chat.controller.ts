import type { Request, Response, NextFunction } from 'express';
import { chatService } from './chat.service.js';

export const chatController = {
  async getSessions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const sessions = await chatService.getSessions(req.user!.sub);
      res.json({ success: true, data: { sessions } });
    } catch (error) {
      next(error);
    }
  },

  async createSession(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { studentId, teacherId, courseId } = req.body;
      if (!studentId || !teacherId || !courseId) {
        res.status(400).json({ success: false, error: 'studentId, teacherId, and courseId are required' });
        return;
      }
      const session = await chatService.getOrCreateSession(studentId, teacherId, courseId, req.user!.sub);
      res.status(201).json({ success: true, data: { session } });
    } catch (error) {
      next(error);
    }
  },

  async getMessages(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const skip = req.query.skip ? parseInt(req.query.skip as string, 10) : 0;
      const take = req.query.take ? parseInt(req.query.take as string, 10) : 50;
      const messages = await chatService.getMessages(id, req.user!.sub, skip, take);
      res.json({ success: true, data: { messages } });
    } catch (error) {
      next(error);
    }
  },

  async sendMessage(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const id = req.params.id as string;
      const { content } = req.body;
      const message = await chatService.sendMessage(id, req.user!.sub, content);
      res.status(201).json({ success: true, data: { message } });
    } catch (error) {
      next(error);
    }
  },
};
