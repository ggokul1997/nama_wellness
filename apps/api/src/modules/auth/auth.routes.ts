import { Router } from 'express';
import { authController } from './auth.controller.js';
import { authenticate } from '../../middleware/authenticate.js';
import { validate } from '../../middleware/validate.js';
import {
  registerSchema,
  corporateRegisterSchema,
  loginSchema,
  refreshSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from '@nama/shared';
import { z } from 'zod';

export const authRouter: Router = Router();

// Public routes
authRouter.post('/register', validate(registerSchema), authController.register);
authRouter.post('/register/corporate', validate(corporateRegisterSchema), authController.corporateRegister);
authRouter.post('/login', validate(loginSchema), authController.login);
authRouter.post('/refresh', validate(refreshSchema), authController.refresh);

// E2E Test Helper
if (process.env.NODE_ENV !== 'production') {
  authRouter.post('/test-verify', async (req, res) => {
    const { email } = req.body;
    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });
    await prisma.$disconnect();
    res.json({ success: true });
  });
}

authRouter.post('/verify-email', validate(verifyEmailSchema), authController.verifyEmail);
authRouter.post(
  '/resend-verification',
  validate(z.object({ email: z.string().email() })),
  authController.resendVerification,
);
authRouter.post('/forgot-password', validate(forgotPasswordSchema), authController.forgotPassword);
authRouter.post('/reset-password', validate(resetPasswordSchema), authController.resetPassword);

// Protected routes
authRouter.post('/logout', authenticate, authController.logout);
authRouter.get('/me', authenticate, authController.getMe);
