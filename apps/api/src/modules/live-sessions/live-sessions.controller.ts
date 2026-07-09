import { Request, Response } from 'express';
import { liveSessionsService } from './live-sessions.service.js';

export const scheduleSession = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.sub;
    const courseId = req.params.courseId as string;
    const session = await liveSessionsService.scheduleSession(teacherId, courseId, req.body);
    return res.status(201).json({ success: true, data: session });
  } catch (error: any) {
    console.error('Error scheduling session:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to schedule session' } });
  }
};

export const getCourseSessions = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;
    const sessions = await liveSessionsService.getSessionsForCourse(courseId);
    return res.status(200).json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('Error fetching sessions:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch sessions' } });
  }
};

export const getStudentBookings = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.sub;
    const sessions = await liveSessionsService.getStudentUpcomingSessions(studentId);
    return res.status(200).json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('Error fetching student bookings:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch bookings' } });
  }
};

export const getTeacherBookings = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.sub;
    const sessions = await liveSessionsService.getTeacherUpcomingSessions(teacherId);
    return res.status(200).json({ success: true, data: sessions });
  } catch (error: any) {
    console.error('Error fetching teacher bookings:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch bookings' } });
  }
};

export const deleteSession = async (req: Request, res: Response) => {
  try {
    const teacherId = req.user!.sub;
    const sessionId = req.params.sessionId as string;
    await liveSessionsService.deleteSession(teacherId, sessionId);
    return res.status(200).json({ success: true, message: 'Session deleted successfully' });
  } catch (error: any) {
    console.error('Error deleting session:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to delete session' } });
  }
};
