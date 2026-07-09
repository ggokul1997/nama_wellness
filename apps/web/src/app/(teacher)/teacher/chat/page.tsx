'use client';

import ChatInbox from '@/components/chat/ChatInbox';
import { useAuth } from '@/lib/auth/session';
import { redirect } from 'next/navigation';
import { useEffect } from 'react';

export default function TeacherChatPage() {
  const { user, isLoading } = useAuth();

  useEffect(() => {
    if (!isLoading && !user) {
      redirect('/login');
    }
  }, [user, isLoading]);

  if (isLoading || !user) return <div className="p-8">Loading...</div>;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Messages</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Direct messages with your students.</p>
      </div>

      <ChatInbox currentUserId={user.id} role="TEACHER" />
    </div>
  );
}
