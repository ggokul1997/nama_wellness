import type { Request, Response } from 'express';
import { authService } from './auth.service.js';
import type { ApiResponse } from '@nama/shared';

// Controllers are thin — parse request, call service, send response.
// All business logic lives in auth.service.ts.

// Helper to set cookies
const setAuthCookies = (res: Response, accessToken: string, refreshToken: string) => {
  const isProd = process.env.NODE_ENV === 'production';
  res.cookie('nama_access_token', accessToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 15 * 60 * 1000, // 15 mins
  });
  res.cookie('nama_refresh_token', refreshToken, {
    httpOnly: true,
    secure: isProd,
    sameSite: isProd ? 'none' : 'lax',
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

export const authController = {
  async register(req: Request, res: Response): Promise<void> {
    const result = await authService.register(req.body);
    const response: ApiResponse = { success: true, data: result, message: result.message };
    res.status(201).json(response);
  },

  async login(req: Request, res: Response): Promise<void> {
    const result = await authService.login(req.body);
    setAuthCookies(res, result.tokens.accessToken, result.tokens.refreshToken);
    const response: ApiResponse = { success: true, data: result };
    res.status(200).json(response);
  },

  async refresh(req: Request, res: Response): Promise<void> {
    const refreshToken = req.body.refreshToken || req.cookies?.nama_refresh_token;
    if (!refreshToken) {
      res.status(401).json({ success: false, error: { code: 'UNAUTHORIZED', message: 'No refresh token' } });
      return;
    }
    const tokens = await authService.refresh(refreshToken);
    setAuthCookies(res, tokens.accessToken, tokens.refreshToken);
    const response: ApiResponse = { success: true, data: tokens };
    res.status(200).json(response);
  },

  async logout(req: Request, res: Response): Promise<void> {
    const refreshToken = req.body.refreshToken || req.cookies?.nama_refresh_token;
    if (refreshToken) {
      await authService.logout(refreshToken);
    }
    const isProd = process.env.NODE_ENV === 'production';
    res.clearCookie('nama_access_token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
    res.clearCookie('nama_refresh_token', { httpOnly: true, secure: isProd, sameSite: isProd ? 'none' : 'lax' });
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
