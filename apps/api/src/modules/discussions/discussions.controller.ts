import { Request, Response } from 'express';
import { discussionsService } from './discussions.service.js';

export const discussionsController = {
  getCourseThreads: async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;
    const cursor = req.query.cursor as string | undefined;
    const userId = req.user!.sub;
    
    const threads = await discussionsService.getCourseThreads(courseId, userId, cursor);
    return res.status(200).json({ success: true, data: threads });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to fetch threads' } });
  }
  },

  getThreadReplies: async (req: Request, res: Response) => {
  try {
    const threadId = req.params.threadId as string;
    const cursor = req.query.cursor as string | undefined;
    const userId = req.user!.sub;
    
    const replies = await discussionsService.getThreadReplies(threadId, userId, cursor);
    return res.status(200).json({ success: true, data: replies });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to fetch replies' } });
  }
  },

  createThread: async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;
    const userId = req.user!.sub;
    const { title, content } = req.body;
    
    if (!title || !content) {
      return res.status(400).json({ success: false, error: { message: 'Title and content are required' } });
    }
    
    const thread = await discussionsService.createThread({
      courseId,
      authorId: userId,
      title,
      content
    });
    
    return res.status(201).json({ success: true, data: thread });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to create thread' } });
  }
  },

  createReply: async (req: Request, res: Response) => {
  try {
    const threadId = req.params.threadId as string;
    const userId = req.user!.sub;
    const { content } = req.body;
    
    if (!content) {
      return res.status(400).json({ success: false, error: { message: 'Content is required' } });
    }
    
    const reply = await discussionsService.createReply({
      threadId,
      authorId: userId,
      content
    });
    
    return res.status(201).json({ success: true, data: reply });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to create reply' } });
  }
  },

  getTeacherThreads: async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.sub;
    const cursor = req.query.cursor as string | undefined;
    
    const threads = await discussionsService.getTeacherThreads(teacherId, cursor);
    return res.status(200).json({ success: true, data: threads });
  } catch (error: any) {
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to fetch teacher threads' } });
  }
  }
};
