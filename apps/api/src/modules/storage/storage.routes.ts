import { Router } from 'express';
import { storageController } from './storage.controller.js';
import { authenticate } from '../../middleware/authenticate.js';

export const storageRouter: Router = Router();

// All storage routes require authentication
storageRouter.use(authenticate);

// Generate presigned URL for direct S3 upload
storageRouter.post('/presign', storageController.getPresignedUrl);
