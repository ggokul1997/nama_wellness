import type { z } from 'zod';
import type { createStudyMaterialSchema, reviewStudyMaterialSchema } from '../validators/study-material.schema.js';

export type CreateStudyMaterialInput = z.infer<typeof createStudyMaterialSchema>;
export type ReviewStudyMaterialInput = z.infer<typeof reviewStudyMaterialSchema>;

export interface StudyMaterial {
  id: string;
  courseId: string;
  title: string;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  uploadedBy: string;
  approvalStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
  approvedBy?: string | null;
  approvedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}
