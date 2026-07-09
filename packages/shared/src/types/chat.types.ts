import type { UserProfile } from './auth.types.js';

export interface ChatMessage {
  id: string;
  sessionId: string;
  senderId: string;
  content: string;
  isRead: boolean;
  createdAt: string;
  sender?: {
    id: string;
    profile: UserProfile | null;
  };
}

export interface ChatSession {
  id: string;
  studentId: string;
  teacherId: string;
  courseId: string;
  createdAt: string;
  updatedAt: string;
  student?: {
    id: string;
    profile: UserProfile | null;
  };
  teacher?: {
    id: string;
    profile: UserProfile | null;
  };
  course?: {
    id: string;
    title: string;
  };
  messages?: ChatMessage[];
}
