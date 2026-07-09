import { Request, Response } from 'express';
import { certificatesService } from './certificates.service.js';

export const issueCertificate = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.sub;
    const { courseId } = req.body;
    
    if (!courseId) {
      return res.status(400).json({ success: false, error: { message: 'Course ID is required' } });
    }

    const certificate = await certificatesService.issueCertificate(studentId, courseId);
    return res.status(201).json({ success: true, data: certificate });
  } catch (error: any) {
    console.error('Error issuing certificate:', error);
    const status = error.statusCode || 500;
    return res.status(status).json({ success: false, error: { message: error.message || 'Failed to issue certificate' } });
  }
};

export const getMyCertificates = async (req: Request, res: Response) => {
  try {
    const studentId = req.user!.sub;
    const certificates = await certificatesService.getMyCertificates(studentId);
    return res.status(200).json({ success: true, data: certificates });
  } catch (error: any) {
    console.error('Error fetching certificates:', error);
    return res.status(500).json({ success: false, error: { message: 'Failed to fetch certificates' } });
  }
};
