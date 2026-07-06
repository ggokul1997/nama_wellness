import type { Request, Response, NextFunction } from 'express';
import { enrollmentsService } from './enrollments.service.js';
import { adminAssignSchema, updateLessonProgressSchema } from '@nama/shared';

export const enrollmentsController = {
  async adminAssignCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = adminAssignSchema.parse(req.body);
      const enrollment = await enrollmentsService.adminAssignCourse(data.userEmail, data.courseId);
      res.status(201).json({ success: true, data: { enrollment } });
    } catch (error) {
      next(error);
    }
  },

  async getMyCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollments = await enrollmentsService.getMyCourses(req.user!.sub);
      res.json({ success: true, data: { enrollments } });
    } catch (error) {
      next(error);
    }
  },

  async getCourseProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const enrollment = await enrollmentsService.getCourseProgress(req.user!.sub, req.params.courseId as string);
      res.json({ success: true, data: { enrollment } });
    } catch (error) {
      next(error);
    }
  },

  async updateLessonProgress(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateLessonProgressSchema.parse(req.body);
      const progress = await enrollmentsService.updateLessonProgress(
        req.user!.sub,
        req.params.courseId as string,
        req.params.lessonId as string,
        data
      );
      res.json({ success: true, data: { progress } });
    } catch (error) {
      next(error);
    }
  }
};
