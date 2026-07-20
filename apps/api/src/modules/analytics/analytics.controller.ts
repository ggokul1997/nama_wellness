import type { Request, Response } from 'express';
import { analyticsService } from './analytics.service.js';

export const getAnalytics = async (req: Request, res: Response) => {
  const days = parseInt(req.query.days as string) || 30;
  const data = await analyticsService.getFullAnalytics(days);
  res.json({ success: true, data });
};

export const getAllTransactions = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;

  const data = await analyticsService.getAllTransactions(page, limit, status);
  res.json({ success: true, data });
};
