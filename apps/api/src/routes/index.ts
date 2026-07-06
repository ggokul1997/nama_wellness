import { Router, type Request, type Response } from 'express';
import { authRouter } from '../modules/auth/auth.routes.js';
import { usersRouter } from '../modules/users/users.routes.js';
import { categoriesRoutes } from '../modules/categories/categories.routes.js';
import { teacherApplicationsRoutes } from '../modules/teacher-applications/teacher-applications.routes.js';
import coursesRoutes from '../modules/courses/courses.routes.js';
import { studyMaterialsRoutes } from '../modules/study-materials/study-materials.routes.js';
import { enrollmentsRoutes } from '../modules/enrollments/enrollments.routes.js';
import { storageRouter } from '../modules/storage/storage.routes.js';

export const v1Router: Router = Router();

// Health check — no auth required
v1Router.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({
    success: true,
    data: {
      status: 'ok',
      timestamp: new Date().toISOString(),
      version: '1.0.0',
    },
  });
});

// Mount domain modules
v1Router.use('/auth', authRouter);
v1Router.use('/users', usersRouter);
v1Router.use('/categories', categoriesRoutes);
v1Router.use('/teacher-applications', teacherApplicationsRoutes);
v1Router.use('/courses', coursesRoutes);
v1Router.use('/study-materials', studyMaterialsRoutes);
v1Router.use('/enrollments', enrollmentsRoutes);
v1Router.use('/uploads', storageRouter);

// Sprint B onwards — routes added here:
// v1Router.use('/teacher', teacherRouter);
