import { Request, Response } from 'express';
import { reviewsService } from './reviews.service.js';

export const createReview = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.sub;
    const review = await reviewsService.createReview(studentId, req.body);
    return res.status(201).json({ success: true, data: review });
  } catch (error: any) {
    console.error('Error creating review:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to create review' } });
  }
};

export const getCourseReviews = async (req: Request, res: Response) => {
  try {
    const courseId = req.params.courseId as string;
    const reviews = await reviewsService.getCourseReviews(courseId);
    return res.status(200).json({ success: true, data: reviews });
  } catch (error: any) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch reviews' } });
  }
};
