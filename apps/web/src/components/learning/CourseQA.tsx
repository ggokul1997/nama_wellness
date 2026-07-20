'use client';

import { useState, useEffect } from 'react';
import { discussionsApi } from '@/lib/api/discussions';
import type { CourseDiscussionThread, CourseDiscussionReply } from '@nama/shared';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export function CourseQA({ courseId, defaultThreadId }: { courseId: string, defaultThreadId?: string }) {
  const [threads, setThreads] = useState<CourseDiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [newTitle, setNewTitle] = useState('');
  const [newContent, setNewContent] = useState('');

  // Selected thread view
  const [selectedThread, setSelectedThread] = useState<CourseDiscussionThread | null>(null);
  const [replies, setReplies] = useState<CourseDiscussionReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    loadThreads();
  }, [courseId]);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const res = await discussionsApi.getCourseThreads(courseId);
      const loadedThreads = res.data || [];
      setThreads(loadedThreads);
      
      // Auto-select thread if defaultThreadId is provided
      if (defaultThreadId) {
        const threadToSelect = loadedThreads.find((t: CourseDiscussionThread) => t.id === defaultThreadId);
        if (threadToSelect && !selectedThread) {
          handleSelectThread(threadToSelect);
        }
      }
    } catch (err) {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateThread = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim() || !newContent.trim()) return;

    try {
      setIsPosting(true);
      const res = await discussionsApi.createThread(courseId, {
        title: newTitle.trim(),
        content: newContent.trim()
      });
      if (res.data) {
        setThreads([res.data, ...threads]);
        setNewTitle('');
        setNewContent('');
        toast.success('Question posted');
      }
    } catch (err) {
      toast.error('Failed to post question');
    } finally {
      setIsPosting(false);
    }
  };

  const handleSelectThread = async (thread: CourseDiscussionThread) => {
    setSelectedThread(thread);
    setRepliesLoading(true);
    try {
      const res = await discussionsApi.getThreadReplies(thread.id);
      setReplies(res.data || []);
    } catch (err) {
      toast.error('Failed to load replies');
    } finally {
      setRepliesLoading(false);
    }
  };

  const handlePostReply = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedThread || !replyContent.trim()) return;

    try {
      setIsReplying(true);
      const res = await discussionsApi.createReply(selectedThread.id, {
        content: replyContent.trim()
      });
      if (res.data) {
        setReplies([...replies, res.data]);
        setReplyContent('');
        // Update thread reply count locally
        setThreads(threads.map(t => t.id === selectedThread.id ? { ...t, _count: { replies: (t._count?.replies || 0) + 1 } } : t));
        toast.success('Reply posted');
      }
    } catch (err) {
      toast.error('Failed to post reply');
    } finally {
      setIsReplying(false);
    }
  };

  const renderAvatar = (author: any) => {
    if (author?.profile?.avatarUrl) {
      return <img src={author.profile.avatarUrl} alt="avatar" style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', objectFit: 'cover' }} />;
    }
    const initial = (author?.profile?.firstName?.[0] || '?').toUpperCase();
    return (
      <div style={{ width: 32, height: 32, flexShrink: 0, borderRadius: '50%', background: 'var(--brand-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
        {initial}
      </div>
    );
  };

  const isTeacher = (author: any) => author?.roles?.some((r: any) => r.role === 'TEACHER');

  if (selectedThread) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', marginTop: '1.5rem' }}>
        <button 
          onClick={() => setSelectedThread(null)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}
        >
          ← Back to all questions
        </button>

        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {renderAvatar(selectedThread.author)}
            <div style={{ flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {selectedThread.title}
              </h3>
              <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '1rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                <span style={{ color: 'var(--text-primary)' }}>
                  {selectedThread.author?.profile?.firstName} {selectedThread.author?.profile?.lastName}
                  {isTeacher(selectedThread.author) && <span className="badge badge-brand" style={{ marginLeft: '0.5rem' }}>Teacher</span>}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(selectedThread.createdAt))} ago</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                {selectedThread.content}
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginLeft: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--surface-border)' }}>
          {repliesLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading replies...</p>
          ) : replies.length === 0 ? (
            <p style={{ color: 'var(--text-muted)' }}>No replies yet. Be the first to answer!</p>
          ) : (
            replies.map(reply => (
              <div key={reply.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'flex-start' }}>
                  {renderAvatar(reply.author)}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.5rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>
                        {reply.author?.profile?.firstName} {reply.author?.profile?.lastName}
                        {isTeacher(reply.author) && <span className="badge badge-brand" style={{ marginLeft: '0.5rem' }}>Teacher</span>}
                        {reply.authorId === selectedThread.authorId && <span className="badge badge-neutral" style={{ marginLeft: '0.5rem' }}>Author</span>}
                      </span>
                      <span style={{ color: 'var(--text-muted)' }}>•</span>
                      <span style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(reply.createdAt))} ago</span>
                    </div>
                    <p style={{ color: 'var(--text-secondary)', lineHeight: 1.5, whiteSpace: 'pre-wrap' }}>
                      {reply.content}
                    </p>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        <form onSubmit={handlePostReply} style={{ marginTop: '1rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <textarea
            value={replyContent}
            onChange={(e) => setReplyContent(e.target.value)}
            placeholder="Write your reply..."
            className="input"
            required
            disabled={isReplying}
            style={{ minHeight: '100px' }}
          />
          <button type="submit" className="btn btn-primary" disabled={isReplying || !replyContent.trim()} style={{ alignSelf: 'flex-end' }}>
            {isReplying ? 'Posting...' : 'Post Reply'}
          </button>
        </form>
      </div>
    );
  }

  return (
    <div style={{ marginTop: '1.5rem', display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <form onSubmit={handleCreateThread} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>Ask a Question</h3>
        <div>
          <input
            type="text"
            placeholder="Question title"
            className="input"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
            required
            disabled={isPosting}
          />
        </div>
        <div>
          <textarea
            placeholder="Provide more details about your question..."
            className="input"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            required
            disabled={isPosting}
          />
        </div>
        <button type="submit" className="btn btn-primary" disabled={isPosting || !newTitle.trim() || !newContent.trim()} style={{ alignSelf: 'flex-end' }}>
          {isPosting ? 'Posting...' : 'Post Question'}
        </button>
      </form>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>All Questions</h3>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading discussions...</p>
        ) : threads.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', border: '1px dashed var(--surface-border)', borderRadius: 'var(--radius-xl)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>No questions yet. Be the first to ask!</p>
          </div>
        ) : (
          threads.map(thread => (
            <div 
              key={thread.id} 
              className="glass-card" 
              style={{ padding: '1.25rem', cursor: 'pointer', transition: 'border-color 0.2s' }}
              onClick={() => handleSelectThread(thread)}
              onMouseEnter={(e) => e.currentTarget.style.borderColor = 'var(--brand-500)'}
              onMouseLeave={(e) => e.currentTarget.style.borderColor = 'transparent'}
            >
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                {renderAvatar(thread.author)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 500, color: 'var(--text-primary)', marginBottom: '0.25rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                    {thread.title}
                  </h4>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', marginBottom: '0.75rem' }}>
                    {thread.content}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span>By {thread.author?.profile?.firstName} {thread.author?.profile?.lastName}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(thread.createdAt))} ago</span>
                    <span>•</span>
                    <span style={{ color: thread._count?.replies ? 'var(--brand-400)' : 'inherit' }}>
                      {thread._count?.replies || 0} {(thread._count?.replies === 1) ? 'reply' : 'replies'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
