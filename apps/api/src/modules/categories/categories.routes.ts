import { Router } from 'express';
import { categoriesController } from './categories.controller.js';
import { authenticate, optionalAuthenticate } from '../../middleware/authenticate.js';
import { authorize } from '../../middleware/authorize.js';
import { validate } from '../../middleware/validate.js';
import { createCategorySchema, updateCategorySchema } from '@nama/shared';

const router: Router = Router();

// Public routes (uses optional authentication to know if user is ADMIN for inactive categories)
router.get('/', optionalAuthenticate, categoriesController.getAllCategories);
router.get('/:id', optionalAuthenticate, categoriesController.getCategoryById);

// Admin routes
router.use(authenticate);
router.use(authorize('ADMIN'));

router.post('/upload-url', categoriesController.getUploadUrl);
router.post('/', validate(createCategorySchema), categoriesController.createCategory);
router.patch('/:id', validate(updateCategorySchema), categoriesController.updateCategory);
router.delete('/:id', categoriesController.deleteCategory);

export { router as categoriesRoutes };
