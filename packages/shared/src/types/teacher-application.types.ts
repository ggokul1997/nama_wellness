export type TeacherAppStatus = 'DRAFT' | 'PENDING' | 'UNDER_REVIEW' | 'INTERVIEW_SCHEDULED' | 'APPROVED' | 'REJECTED';
export type DocumentType = 'GOVERNMENT_ID' | 'CERTIFICATION' | 'EXPERIENCE_PROOF' | 'PROFILE_PHOTO';
export type InterviewOutcome = 'PENDING' | 'PASSED' | 'FAILED';

export interface TeacherApplication {
  id: string;
  userId: string;
  status: TeacherAppStatus;
  submittedAt: string | null;
  reviewedBy: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  adminNotes: string | null;
  teachingSubject: string | null;
  createdAt: string;
  updatedAt: string;

  // Relations
  documents?: TeacherDocument[];
  user?: {
    email: string;
    profile?: {
      firstName: string | null;
      lastName: string | null;
    } | null;
  };
}

export interface TeacherDocument {
  id: string;
  applicationId: string;
  documentType: DocumentType;
  fileUrl: string;
  fileName: string;
  mimeType: string;
  fileSizeBytes: number;
  verified: boolean;
  verifiedBy: string | null;
  verifiedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
