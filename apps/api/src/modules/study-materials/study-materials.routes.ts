import { Router } from 'express';
import { studyMaterialsController } from './study-materials.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';

const router: Router = Router();

// All routes require authentication
router.use(authenticate);

// Admin Routes
router.get('/admin/pending', authorize('ADMIN'), studyMaterialsController.getPendingMaterials);
router.patch('/admin/:id/review', authorize('ADMIN'), studyMaterialsController.reviewMaterial);

// Download (Auth required for enrolled user/teacher/admin checks)
router.get('/:id/download', studyMaterialsController.getDownloadUrl);

// Course-specific material routes
router.get('/course/:courseId', studyMaterialsController.getCourseMaterials);
router.post('/course/:courseId/upload-url', authorize('TEACHER'), studyMaterialsController.getUploadUrl);
router.post('/course/:courseId', authorize('TEACHER'), studyMaterialsController.createMaterial);

export { router as studyMaterialsRoutes };
