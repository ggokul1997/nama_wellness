'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { engagementApi } from '@/lib/api/engagement';
import type { LiveSession } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { format } from 'date-fns';

export default function TeacherCourseSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [durationMinutes, setDurationMinutes] = useState(60);
  const [submitting, setSubmitting] = useState(false);

  const fetchSessions = async () => {
    try {
      const res = await engagementApi.getCourseSessions(id);
      setSessions(res.data || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load sessions'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSessions();
  }, [id]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      await engagementApi.scheduleSession(id, {
        title,
        description,
        meetingUrl,
        scheduledAt: new Date(scheduledAt).toISOString(),
        durationMinutes: Number(durationMinutes)
      });
      setTitle('');
      setDescription('');
      setMeetingUrl('');
      setScheduledAt('');
      setDurationMinutes(60);
      await fetchSessions();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to schedule session'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    if (!confirm('Are you sure you want to delete this session?')) return;
    try {
      await engagementApi.deleteSession(sessionId);
      await fetchSessions();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete session'));
    }
  };

  if (loading) {
    return <div className="page-content text-center p-8">Loading sessions...</div>;
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Live Sessions</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Schedule and manage live classes for this course.</p>
        </div>
        <Link href={`/teacher/courses/${id}/edit`} className="btn btn-ghost" style={{ border: '1px solid var(--surface-border)' }}>
          ← Back to Course Edit
        </Link>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '2rem', alignItems: 'start' }}>
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1.5rem' }}>Schedule New Session</h3>
          <form onSubmit={handleSchedule} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <div>
              <label className="label">Title</label>
              <input type="text" className="input" required value={title} onChange={e => setTitle(e.target.value)} placeholder="e.g. Week 1 Q&A" />
            </div>
            
            <div>
              <label className="label">Description (Optional)</label>
              <textarea className="input" rows={3} value={description} onChange={e => setDescription(e.target.value)} />
            </div>

            <div>
              <label className="label">Zoom / Meeting URL</label>
              <input type="url" className="input" required value={meetingUrl} onChange={e => setMeetingUrl(e.target.value)} placeholder="https://zoom.us/j/..." />
            </div>

            <div>
              <label className="label">Date & Time</label>
              <input type="datetime-local" className="input" required value={scheduledAt} onChange={e => setScheduledAt(e.target.value)} />
            </div>

            <div>
              <label className="label">Duration (Minutes)</label>
              <input type="number" className="input" required min={15} max={300} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} />
            </div>

            <button type="submit" className="btn btn-primary" disabled={submitting} style={{ marginTop: '0.5rem' }}>
              {submitting ? 'Scheduling...' : 'Schedule Session'}
            </button>
          </form>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Upcoming Sessions</h3>
          {sessions.length === 0 ? (
            <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
              No upcoming sessions scheduled for this course.
            </div>
          ) : (
            sessions.map(session => (
              <div key={session.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <h4 style={{ fontWeight: 600, fontSize: '1.125rem' }}>{session.title}</h4>
                  <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                    {format(new Date(session.scheduledAt), 'PPp')} • {session.durationMinutes} min
                  </div>
                  <a href={session.meetingUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-500)', fontSize: '0.875rem', display: 'inline-block', marginTop: '0.5rem' }}>
                    {session.meetingUrl}
                  </a>
                </div>
                <div>
                  <button onClick={() => handleDelete(session.id)} className="btn btn-outline" style={{ color: 'var(--danger-500)', borderColor: 'var(--danger-500)' }}>
                    Cancel
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
