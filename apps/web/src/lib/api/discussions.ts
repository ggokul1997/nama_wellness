import { apiFetch } from './client';
import type { CourseDiscussionThread, CourseDiscussionReply, CreateDiscussionThreadInput, CreateDiscussionReplyInput } from '@nama/shared';

export const discussionsApi = {
  getCourseThreads: (courseId: string, cursor?: string) => {
    const query = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<CourseDiscussionThread[]>(`/discussions/courses/${courseId}${query}`, { auth: true });
  },

  createThread: (courseId: string, data: CreateDiscussionThreadInput) => {
    return apiFetch<CourseDiscussionThread>(`/discussions/courses/${courseId}`, {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true
    });
  },

  getThreadReplies: (threadId: string, cursor?: string) => {
    const query = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<CourseDiscussionReply[]>(`/discussions/${threadId}/replies${query}`, { auth: true });
  },

  createReply: (threadId: string, data: CreateDiscussionReplyInput) => {
    return apiFetch<CourseDiscussionReply>(`/discussions/${threadId}/replies`, {
      method: 'POST',
      body: JSON.stringify(data),
      auth: true
    });
  },
  
  getTeacherThreads: (cursor?: string) => {
    const query = cursor ? `?cursor=${cursor}` : '';
    return apiFetch<CourseDiscussionThread[]>(`/discussions/teacher/all${query}`, { auth: true });
  }
};
