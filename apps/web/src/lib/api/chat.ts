import { apiFetch } from './client';
import type { ChatSession, ChatMessage } from '@nama/shared';

export const chatApi = {
  getSessions: () =>
    apiFetch<{ sessions: ChatSession[] }>('/chat/sessions'),

  createSession: (studentId: string, teacherId: string, courseId: string) =>
    apiFetch<{ session: ChatSession }>('/chat/sessions', {
      method: 'POST',
      body: JSON.stringify({ studentId, teacherId, courseId }),
    }),

  getMessages: (sessionId: string, skip: number = 0, take: number = 50) =>
    apiFetch<{ messages: ChatMessage[] }>(`/chat/sessions/${sessionId}/messages?skip=${skip}&take=${take}`),

  sendMessage: (sessionId: string, content: string) =>
    apiFetch<{ message: ChatMessage }>(`/chat/sessions/${sessionId}/messages`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    }),
};
