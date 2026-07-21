import { Request, Response } from 'express';
import { teachersService } from './teachers.service.js';

export const getTeacherSummary = async (_req: Request, res: Response) => {
  try {
    const summary = await teachersService.getSummary();
    res.json({ success: true, data: summary });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getTeachersList = async (req: Request, res: Response) => {
  try {
    const search = req.query.search as string | undefined;
    const status = req.query.status as string | undefined;
    const teachers = await teachersService.getTeachers({ 
      search, 
      status 
    });
    res.json({ success: true, data: teachers });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getTeacherDetails = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const details = await teachersService.getTeacherDetails(id);
    res.json({ success: true, data: details });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const updateTeacherStatus = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const { status, performanceStatus } = req.body;
    
    await teachersService.updateTeacherStatus(id, status as any, performanceStatus as any);
    res.json({ success: true, message: 'Teacher status updated successfully' });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getTeacherCourses = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const courses = await teachersService.getTeacherCourses(id);
    res.json({ success: true, data: courses });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getTeacherStudents = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const students = await teachersService.getTeacherStudents(id);
    res.json({ success: true, data: students });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getTeacherReviews = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const reviews = await teachersService.getTeacherReviews(id);
    res.json({ success: true, data: reviews });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};

export const getTeacherPayouts = async (req: Request, res: Response) => {
  try {
    const id = req.params.id as string;
    const payouts = await teachersService.getTeacherPayouts(id);
    res.json({ success: true, data: payouts });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    res.status(500).json({ success: false, error: message });
  }
};
