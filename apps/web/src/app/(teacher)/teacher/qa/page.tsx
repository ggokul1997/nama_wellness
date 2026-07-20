'use client';

import { useState, useEffect } from 'react';
import { discussionsApi } from '@/lib/api/discussions';
import type { CourseDiscussionThread, CourseDiscussionReply } from '@nama/shared';
import { toast } from 'react-hot-toast';
import { formatDistanceToNow } from 'date-fns';

export default function TeacherQAPage() {
  const [threads, setThreads] = useState<CourseDiscussionThread[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'unanswered'>('all');

  const [selectedThread, setSelectedThread] = useState<CourseDiscussionThread | null>(null);
  const [replies, setReplies] = useState<CourseDiscussionReply[]>([]);
  const [repliesLoading, setRepliesLoading] = useState(false);
  const [replyContent, setReplyContent] = useState('');
  const [isReplying, setIsReplying] = useState(false);

  useEffect(() => {
    loadThreads();
  }, []);

  const loadThreads = async () => {
    try {
      setLoading(true);
      const res = await discussionsApi.getTeacherThreads();
      setThreads(res.data || []);
    } catch (err) {
      toast.error('Failed to load discussions');
    } finally {
      setLoading(false);
    }
  };

  const filteredThreads = threads.filter(thread => {
    if (filter === 'unanswered') return thread._count?.replies === 0;
    return true;
  });

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
        setThreads(threads.map(t => 
          t.id === selectedThread.id 
            ? { ...t, _count: { replies: (t._count?.replies || 0) + 1 } } 
            : t
        ));
        
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
      return <img src={author.profile.avatarUrl} alt="avatar" style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', objectFit: 'cover' }} />;
    }
    const initial = (author?.profile?.firstName?.[0] || '?').toUpperCase();
    return (
      <div style={{ width: 40, height: 40, flexShrink: 0, borderRadius: '50%', background: 'var(--brand-500)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold' }}>
        {initial}
      </div>
    );
  };

  const isTeacher = (author: any) => author?.roles?.some((r: any) => r.role === 'TEACHER');

  if (selectedThread) {
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '800px', margin: '0 auto', padding: '1rem' }}>
        <button 
          onClick={() => setSelectedThread(null)}
          style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', alignSelf: 'flex-start' }}
        >
          ← Back to Q&A Dashboard
        </button>

        <div className="glass-card" style={{ padding: '2rem' }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
            {renderAvatar(selectedThread.author)}
            <div style={{ flex: 1 }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
                {selectedThread.title}
              </h1>
              <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center', marginBottom: '1.5rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
                <span className="badge badge-neutral">{selectedThread.course?.title}</span>
                <span style={{ color: 'var(--text-primary)' }}>
                  {selectedThread.author?.profile?.firstName} {selectedThread.author?.profile?.lastName}
                </span>
                <span style={{ color: 'var(--text-muted)' }}>•</span>
                <span style={{ color: 'var(--text-muted)' }}>{formatDistanceToNow(new Date(selectedThread.createdAt))} ago</span>
              </div>
              <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6, whiteSpace: 'pre-wrap', fontSize: '1rem' }}>
                {selectedThread.content}
              </p>
            </div>
          </div>
        </div>

        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', margin: '1rem 0 0' }}>
          {replies.length} {replies.length === 1 ? 'Reply' : 'Replies'}
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {repliesLoading ? (
            <p style={{ color: 'var(--text-muted)' }}>Loading replies...</p>
          ) : replies.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-lg)' }}>
              <p style={{ color: 'var(--text-secondary)' }}>No one has answered this question yet. You can be the first to help!</p>
            </div>
          ) : (
            replies.map(reply => (
              <div key={reply.id} className="glass-card" style={{ padding: '1.5rem', borderLeft: isTeacher(reply.author) ? '3px solid var(--brand-500)' : undefined }}>
                <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
                  {renderAvatar(reply.author)}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginBottom: '0.75rem', fontSize: '0.875rem', flexWrap: 'wrap' }}>
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

        <div className="glass-card" style={{ padding: '1.5rem', marginTop: '1rem', background: 'var(--surface-overlay)' }}>
          <h4 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Your Answer</h4>
          <form onSubmit={handlePostReply} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <textarea
              value={replyContent}
              onChange={(e) => setReplyContent(e.target.value)}
              placeholder="Write your answer to help this student..."
              className="input"
              required
              disabled={isReplying}
              style={{ minHeight: '120px' }}
            />
            <button type="submit" className="btn btn-primary" disabled={isReplying || !replyContent.trim()} style={{ alignSelf: 'flex-end' }}>
              {isReplying ? 'Posting...' : 'Post Answer'}
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Q&A Dashboard</h1>
          <p style={{ color: 'var(--text-secondary)' }}>Manage questions from students across all your courses.</p>
        </div>
      </div>

      <div style={{ display: 'flex', gap: '1rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <button 
          className={filter === 'all' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setFilter('all')}
        >
          All Questions
        </button>
        <button 
          className={filter === 'unanswered' ? 'btn btn-primary' : 'btn btn-secondary'}
          onClick={() => setFilter('unanswered')}
        >
          Unanswered Only
        </button>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
        {loading ? (
          <p style={{ color: 'var(--text-muted)' }}>Loading discussions...</p>
        ) : filteredThreads.length === 0 ? (
          <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
            <h3 style={{ fontSize: '1.25rem', color: 'var(--text-primary)', marginBottom: '0.5rem' }}>No questions found</h3>
            <p style={{ color: 'var(--text-secondary)' }}>
              {filter === 'unanswered' ? "Great job! You've answered all student questions." : "Your students haven't asked any questions yet."}
            </p>
          </div>
        ) : (
          filteredThreads.map(thread => (
            <div 
              key={thread.id} 
              className="glass-card" 
              style={{ padding: '1.5rem', cursor: 'pointer', transition: 'all 0.2s', borderLeft: thread._count?.replies === 0 ? '3px solid var(--warning)' : '3px solid transparent' }}
              onClick={() => handleSelectThread(thread)}
              onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-2px)'}
              onMouseLeave={(e) => e.currentTarget.style.transform = 'none'}
            >
              <div style={{ display: 'flex', gap: '1.5rem', alignItems: 'flex-start' }}>
                {renderAvatar(thread.author)}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '1rem', flexWrap: 'wrap' }}>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                      {thread.title}
                    </h3>
                    <div style={{ whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      {thread._count?.replies === 0 ? (
                        <span className="badge badge-warning">Unanswered</span>
                      ) : (
                        <span className="badge badge-brand">{thread._count?.replies} Replies</span>
                      )}
                    </div>
                  </div>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden', margin: '0.5rem 0 1rem' }}>
                    {thread.content}
                  </p>
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', fontSize: '0.75rem', color: 'var(--text-muted)', flexWrap: 'wrap' }}>
                    <span className="badge badge-neutral" style={{ fontSize: '0.7rem' }}>{thread.course?.title}</span>
                    <span>Asked by {thread.author?.profile?.firstName} {thread.author?.profile?.lastName}</span>
                    <span>•</span>
                    <span>{formatDistanceToNow(new Date(thread.createdAt))} ago</span>
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
