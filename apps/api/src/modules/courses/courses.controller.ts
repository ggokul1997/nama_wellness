import type { Request, Response, NextFunction } from 'express';
import { coursesService } from './courses.service.js';
import { createCourseSchema, updateCourseSchema, createModuleSchema, updateModuleSchema, createLessonSchema, updateLessonSchema, proposePricingSchema, reviewCourseSchema, updateCorporateSettingsSchema } from '@nama/shared';

export const coursesController = {
  // Public Methods
  async getPublicCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await coursesService.getPublicCourses();
      res.json({ success: true, data: { courses } });
    } catch (error) {
      next(error);
    }
  },

  async getCorporateCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await coursesService.getCorporateCourses();
      res.json({ success: true, data: { courses } });
    } catch (error) {
      next(error);
    }
  },

  async getPublicCourseBySlug(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await coursesService.getPublicCourseBySlug(req.params.slug as string);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  async getPublicCourseById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await coursesService.getPublicCourseById(req.params.id as string);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  // Teacher Methods
  async getMyCourses(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await coursesService.getMyCourses(req.user!.sub);
      res.json({ success: true, data: { courses } });
    } catch (error) {
      next(error);
    }
  },

  async getCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await coursesService.getCourseById(req.params.id as string, req.user!.sub);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  async createCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createCourseSchema.parse(req.body);
      const course = await coursesService.createCourse(req.user!.sub, data);
      res.status(201).json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  async updateCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateCourseSchema.parse(req.body);
      const course = await coursesService.updateCourse(req.params.id as string, req.user!.sub, data);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  async getPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mimeType, fileSizeBytes } = req.body;
      const result = await coursesService.getPresignedCoverUrl(
        req.params.id as string,
        req.user!.sub,
        mimeType,
        fileSizeBytes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async deleteCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await coursesService.deleteCourse(req.params.id as string, req.user!.sub);
      res.json({ success: true, message: 'Course deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Modules
  async getModules(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const modules = await coursesService.getModulesByCourseId(req.params.id as string, req.user!.sub);
      res.json({ success: true, data: { modules } });
    } catch (error) {
      next(error);
    }
  },

  async createModule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createModuleSchema.parse(req.body);
      const module = await coursesService.createModule(req.params.id as string, req.user!.sub, data);
      res.status(201).json({ success: true, data: { module } });
    } catch (error) {
      next(error);
    }
  },

  async updateModule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateModuleSchema.parse(req.body);
      const module = await coursesService.updateModule(req.params.id as string, req.params.moduleId as string, req.user!.sub, data);
      res.json({ success: true, data: { module } });
    } catch (error) {
      next(error);
    }
  },

  async deleteModule(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await coursesService.deleteModule(req.params.id as string, req.params.moduleId as string, req.user!.sub);
      res.json({ success: true, message: 'Module deleted' });
    } catch (error) {
      next(error);
    }
  },

  // Lessons
  async createLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createLessonSchema.parse(req.body);
      const lesson = await coursesService.createLesson(req.params.id as string, req.params.moduleId as string, req.user!.sub, data);
      res.status(201).json({ success: true, data: { lesson } });
    } catch (error) {
      next(error);
    }
  },

  async updateLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateLessonSchema.parse(req.body);
      const lesson = await coursesService.updateLesson(req.params.id as string, req.params.moduleId as string, req.params.lessonId as string, req.user!.sub, data);
      res.json({ success: true, data: { lesson } });
    } catch (error) {
      next(error);
    }
  },

  async deleteLesson(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await coursesService.deleteLesson(req.params.id as string, req.params.moduleId as string, req.params.lessonId as string, req.user!.sub);
      res.json({ success: true, message: 'Lesson deleted' });
    } catch (error) {
      next(error);
    }
  },

  async getPresignedLessonUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mimeType, fileSizeBytes } = req.body;
      const result = await coursesService.getPresignedLessonUrl(
        req.params.id as string,
        req.params.moduleId as string,
        req.params.lessonId as string,
        req.user!.sub,
        mimeType,
        fileSizeBytes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  // Pricing & Review Workflow
  async proposePricing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = proposePricingSchema.parse(req.body);
      const pricing = await coursesService.proposePricing(req.params.id as string, req.user!.sub, data);
      res.json({ success: true, data: { pricing } });
    } catch (error) {
      next(error);
    }
  },

  async deletePricing(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await coursesService.deletePricing(req.params.id as string, req.user!.sub);
      res.json({ success: true, data: { message: 'Pricing deleted successfully' } });
    } catch (error) {
      next(error);
    }
  },

  async submitForReview(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await coursesService.submitForReview(req.params.id as string, req.user!.sub);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  async clearCourseFeedback(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      await coursesService.clearCourseFeedback(req.params.id as string, req.user!.sub);
      res.json({ success: true, message: 'Feedback cleared' });
    } catch (error) {
      next(error);
    }
  },

  // Admin Methods
  async adminGetPendingCourses(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const courses = await coursesService.adminGetPendingCourses();
      res.json({ success: true, data: { courses } });
    } catch (error) {
      next(error);
    }
  },

  async adminGetCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await coursesService.adminGetCourse(req.params.id as string);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  async adminReviewCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = reviewCourseSchema.parse(req.body);
      const course = await coursesService.adminReviewCourse(req.params.id as string, req.user!.sub, data);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  async adminPublishCourse(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const course = await coursesService.adminPublishCourse(req.params.id as string);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  },

  async updateCorporateSettings(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = updateCorporateSettingsSchema.parse(req.body);
      const course = await coursesService.updateCorporateSettings(req.params.id as string, req.user!.sub, data);
      res.json({ success: true, data: { course } });
    } catch (error) {
      next(error);
    }
  }
};
