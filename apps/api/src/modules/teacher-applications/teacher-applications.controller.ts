import type { Request, Response, NextFunction } from 'express';
import { teacherApplicationsService } from './teacher-applications.service.js';
import type { DocumentType } from '@prisma/client';

export const teacherApplicationsController = {
  async getMyApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const app = await teacherApplicationsService.getMyApplication(req.user!.sub);
      res.json({ success: true, data: { application: app } });
    } catch (error) {
      next(error);
    }
  },

  async startApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const app = await teacherApplicationsService.startApplication(req.user!.sub);
      res.status(201).json({ success: true, data: { application: app } });
    } catch (error) {
      next(error);
    }
  },

  async getPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { applicationId, documentType, mimeType, fileSizeBytes } = req.body;
      const result = await teacherApplicationsService.getPresignedUploadUrl(
        req.user!.sub,
        applicationId,
        documentType as DocumentType,
        mimeType,
        fileSizeBytes
      );
      res.json({ success: true, data: result });
    } catch (error) {
      next(error);
    }
  },

  async submitApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { firstName, lastName, teachingSubject } = req.body;
      const app = await teacherApplicationsService.submitApplication(req.user!.sub, id as string, firstName, lastName, teachingSubject);
      res.json({ success: true, data: { application: app } });
    } catch (error) {
      next(error);
    }
  },

  // Admin handlers
  async listPending(_req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const apps = await teacherApplicationsService.listPendingApplications();
      res.json({ success: true, data: { applications: apps } });
    } catch (error) {
      next(error);
    }
  },

  async reviewApplication(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { id } = req.params;
      const { approve, rejectionReason } = req.body;
      const app = await teacherApplicationsService.reviewApplication(
        req.user!.sub,
        id as string,
        approve,
        rejectionReason
      );
      res.json({ success: true, data: { application: app } });
    } catch (error) {
      next(error);
    }
  },
};
