export interface Review {
  id: string;
  courseId: string;
  studentId: string;
  enrollmentId: string;
  rating: number;
  comment?: string | null;
  createdAt: string | Date;
  updatedAt: string | Date;
  
  // Relations
  student?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
    } | null;
  };
}

export interface LiveSession {
  id: string;
  courseId: string;
  title: string;
  description?: string | null;
  meetingUrl: string;
  scheduledAt: string | Date;
  durationMinutes: number;
  createdAt: string | Date;
  updatedAt: string | Date;

  // Relations
  course?: {
    id: string;
    title: string;
    teacher?: {
      profile?: {
        firstName: string;
        lastName: string;
      } | null;
    } | null;
  };
}

export interface Certificate {
  id: string;
  courseId: string;
  studentId: string;
  enrollmentId: string;
  issuedAt: string | Date;

  // Relations
  course?: {
    title: string;
  };
}

export type NotificationType = 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR';

export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  link?: string | null;
  isRead: boolean;
  type: NotificationType;
  createdAt: string | Date;
}

export interface CourseDiscussionReply {
  id: string;
  threadId: string;
  authorId: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  
  author?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    } | null;
    roles?: { role: string }[];
  };
}

export interface CourseDiscussionThread {
  id: string;
  courseId: string;
  authorId: string;
  title: string;
  content: string;
  createdAt: string | Date;
  updatedAt: string | Date;
  
  course?: {
    title: string;
  };
  author?: {
    id: string;
    profile?: {
      firstName: string;
      lastName: string;
      avatarUrl?: string | null;
    } | null;
    roles?: { role: string }[];
  };
  replies?: CourseDiscussionReply[];
  _count?: {
    replies: number;
  };
}

export interface CreateDiscussionThreadInput {
  title: string;
  content: string;
}

export interface CreateDiscussionReplyInput {
  content: string;
}
