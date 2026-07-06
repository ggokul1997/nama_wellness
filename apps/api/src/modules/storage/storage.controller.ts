import type { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { storageService, StorageError } from './storage.service.js';

const presignSchema = z.object({
  fileName: z.string().min(1),
  mimeType: z.string().min(1),
  fileSizeBytes: z.number().int().positive(),
  purpose: z.enum(['TEACHER_DOCUMENT', 'COURSE_COVER', 'LESSON_VIDEO', 'LESSON_DOCUMENT', 'STUDY_MATERIAL', 'AVATAR'] as const),
});

export const storageController = {
  async getPresignedUrl(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const body = presignSchema.parse(req.body);
      const userId = req.user?.sub;

      if (!userId) {
        res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'User not authenticated' } });
        return;
      }

      const result = await storageService.getPresignedUrl({
        ...body,
        userId,
      });

      res.status(200).json({ success: true, data: result });
    } catch (error) {
      if (error instanceof z.ZodError) {
        res.status(400).json({ success: false, error: { code: 'VALIDATION_ERROR', message: 'Invalid payload', details: error.errors } });
      } else if (error instanceof StorageError) {
        res.status(error.statusCode).json({ success: false, error: { code: 'STORAGE_ERROR', message: error.message } });
      } else {
        next(error);
      }
    }
  }
};
