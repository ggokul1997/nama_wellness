import { Request, Response, NextFunction } from 'express';
import { studyMaterialsService } from './study-materials.service.js';
import { createStudyMaterialSchema, reviewStudyMaterialSchema } from '@nama/shared';

export const studyMaterialsController = {
  // Teacher Endpoints
  async getUploadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { mimeType, fileSizeBytes } = req.body;
      const result = await studyMaterialsService.getPresignedUploadUrl(
        req.params.courseId as string,
        req.user!.sub,
        mimeType,
        fileSizeBytes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async createMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = createStudyMaterialSchema.parse(req.body);
      const material = await studyMaterialsService.createMaterial(req.params.courseId as string, req.user!.sub, data);
      res.json({ success: true, data: { material } });
    } catch (error) {
      next(error);
    }
  },

  async getCourseMaterials(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const materials = await studyMaterialsService.getMaterialsForCourse(req.params.courseId as string, req.user!.sub, req.user!.activeRole);
      res.json({ success: true, data: { materials } });
    } catch (error) {
      next(error);
    }
  },

  // Admin Endpoints
  async getPendingMaterials(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const materials = await studyMaterialsService.getPendingMaterials();
      res.json({ success: true, data: { materials } });
    } catch (error) {
      next(error);
    }
  },

  async reviewMaterial(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const data = reviewStudyMaterialSchema.parse(req.body);
      const material = await studyMaterialsService.reviewMaterial(req.params.id as string, req.user!.sub, data);
      res.json({ success: true, data: { material } });
    } catch (error) {
      next(error);
    }
  },

  // Download Endpoint
  async getDownloadUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const result = await studyMaterialsService.getDownloadUrl(req.params.id as string, req.user!.sub, req.user!.activeRole);
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  }
};
