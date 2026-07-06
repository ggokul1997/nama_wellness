import { z } from 'zod';

export const createStudyMaterialSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters'),
  fileUrl: z.string().url('Invalid file URL'),
  fileName: z.string().min(1, 'File name is required'),
  mimeType: z.string().min(1, 'MIME type is required'),
  fileSizeBytes: z.number().positive('File size must be positive'),
});

export const reviewStudyMaterialSchema = z.object({
  status: z.enum(['APPROVED', 'REJECTED']),
});
