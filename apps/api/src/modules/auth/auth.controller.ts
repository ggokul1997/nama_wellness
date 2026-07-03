import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import type { ApiResponse } from '@nama/shared';

// Controllers are thin — parse request, call service, send response.
// All business logic lives in auth.service.ts.

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    const response: ApiResponse = { success: true, data: result, message: result.message };
    res.status(201).json(response);
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as { refreshToken: string };
    const tokens = await authService.refresh(refreshToken);
    const response: ApiResponse = { success: true, data: tokens };
    res.status(200).json(response);
  },

  async logout(req: Request, res: Response): Promise<void> {
    const { refreshToken } = req.body as { refreshToken?: string };
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    const response: ApiResponse = { success: true, message: 'Logged out successfully' };
    res.status(200).json(response);
  },

  async verifyEmail(req: Request, res: Response): Promise<void> {
    const result = await authService.verifyEmail(req.body);
    const response: ApiResponse = { success: true, data: result, message: result.message };
    res.status(200).json(response);
  },

  async resendVerification(req: Request, res: Response): Promise<void> {
    const { email } = req.body as { email: string };
    const result = await authService.resendVerification(email);
    const response: ApiResponse = { success: true, message: result.message };
    res.status(200).json(response);
  },

  async forgotPassword(req: Request, res: Response): Promise<void> {
    const result = await authService.forgotPassword(req.body);
    const response: ApiResponse = { success: true, message: result.message };
    res.status(200).json(response);
  },

  async resetPassword(req: Request, res: Response): Promise<void> {
    const result = await authService.resetPassword(req.body);
    const response: ApiResponse = { success: true, message: result.message };
    res.status(200).json(response);
  },

  async getMe(req: Request, res: Response): Promise<void> {
    const user = await authService.getMe(req.user!.sub);
    const response: ApiResponse = { success: true, data: { user } };
    res.status(200).json(response);
  },
};
