export type AuditLogEventType = 
  | 'USER_REGISTERED'
  | 'TEACHER_APPLICATION'
  | 'COURSE_PUBLISHED'
  | 'ENROLLMENT'
  | 'PAYOUT_GENERATED'
  | 'SUSPENSION';

export interface AuditLogEntry {
  id: string;
  type: AuditLogEventType;
  description: string;
  actorName: string;
  targetName?: string;
  timestamp: string;
  metadata?: Record<string, any>;
}
