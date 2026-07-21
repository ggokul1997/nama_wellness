import type { Request, Response } from 'express';
import { payoutsService } from './payouts.service.js';

export const generatePayouts = async (req: Request, res: Response) => {
  const { periodStart, periodEnd } = req.body;
  const data = await payoutsService.generatePayouts(periodStart, periodEnd);
  res.json({ success: true, data });
};

export const listPayouts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;
  const teacherId = req.query.teacherId as string | undefined;

  const data = await payoutsService.listPayouts(page, limit, status, teacherId);
  res.json({ success: true, data });
};

export const getMyPayouts = async (req: Request, res: Response) => {
  const page = parseInt(req.query.page as string) || 1;
  const limit = parseInt(req.query.limit as string) || 20;
  const status = req.query.status as string | undefined;
  const teacherId = req.user!.sub; // authenticate middleware sets req.user

  const data = await payoutsService.listPayouts(page, limit, status, teacherId);
  res.json({ success: true, data });
};

export const updatePayout = async (req: Request, res: Response) => {
  const { id } = req.params;
  const { status, notes } = req.body;
  const data = await payoutsService.updatePayout(id as string, status, notes);
  res.json({ success: true, data });
};

export const getPayoutTransactions = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await payoutsService.getPayoutTransactions(id as string);
  res.json({ success: true, data });
};

export const getPayout = async (req: Request, res: Response) => {
  const { id } = req.params;
  const data = await payoutsService.getPayout(id as string);
  res.json({ success: true, data });
};
