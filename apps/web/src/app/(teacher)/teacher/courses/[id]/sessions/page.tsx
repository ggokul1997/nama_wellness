'use client';

import { useState, useEffect, use } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import Link from 'next/link';
import { engagementApi } from '@/lib/api/engagement';
import { coursesApi } from '@/lib/api/courses';
import type { LiveSession, Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { format } from 'date-fns';

export default function TeacherCourseSessionsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const dialog = useDialog();
  const [course, setCourse] = useState<Course | null>(null);
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [meetingUrl, setMeetingUrl] = useState('');
  const [scheduledDate, setScheduledDate] = useState('');
  const [scheduledHour, setScheduledHour] = useState('12');
  const [scheduledMinute, setScheduledMinute] = useState('00');
  const [scheduledAmpm, setScheduledAmpm] = useState('PM');
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
    const init = async () => {
      try {
        const [courseRes] = await Promise.all([
          coursesApi.getCourse(id),
          fetchSessions(),
        ]);
        setCourse(courseRes.data?.course || null);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load course'));
        setLoading(false);
      }
    };
    init();
  }, [id]);

  const handleSchedule = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      let h24 = parseInt(scheduledHour, 10);
      if (scheduledAmpm === 'PM' && h24 !== 12) h24 += 12;
      if (scheduledAmpm === 'AM' && h24 === 12) h24 = 0;
      
      const timeStr = `${h24.toString().padStart(2, '0')}:${scheduledMinute}:00`;
      
      await engagementApi.scheduleSession(id, {
        title,
        description,
        meetingUrl,
        scheduledAt: new Date(`${scheduledDate}T${timeStr}`).toISOString(),
        durationMinutes: Number(durationMinutes)
      });
      setTitle('');
      setDescription('');
      setMeetingUrl('');
      setScheduledDate('');
      setScheduledHour('12');
      setScheduledMinute('00');
      setScheduledAmpm('PM');
      setDurationMinutes(60);
      await fetchSessions();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to schedule session'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (sessionId: string) => {
    const confirmed = await dialog.confirm({ title: 'Confirm', message: 'Are you sure you want to delete this session?', isDestructive: true, confirmText: 'Delete' });
    if (!confirmed) return;
    try {
      await engagementApi.deleteSession(sessionId);
      await fetchSessions();
    } catch (err: unknown) {
      await dialog.alert({ title: 'Notification', message: getErrorMessage(err, 'Failed to delete session') });
    }
  };

  if (loading) {
    return <div className="page-content text-center p-8">Loading sessions...</div>;
  }

  if (course && course.courseType !== 'HYBRID') {
    return (
      <div className="page-content" style={{ maxWidth: '600px', margin: '0 auto', textAlign: 'center', paddingTop: '4rem' }}>
        <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📹</div>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>Group Sessions Not Available</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
          Scheduled group sessions are only available for <strong>Hybrid</strong> courses. Pre-Recorded courses do not support live group sessions.
        </p>
        <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', marginBottom: '2rem' }}>
          💡 You can still offer 1-on-1 sessions with students by setting your availability and pricing in the sidebar.
        </p>
        <Link href={`/teacher/courses`} className="btn btn-primary">Back to My Courses</Link>
      </div>
    );
  }

  const getMinMaxDateTime = () => {
    const min = new Date(Date.now() + 24 * 60 * 60 * 1000);
    // Round min UP to the next 30-minute boundary
    const rem = min.getMinutes() % 30;
    if (rem !== 0 || min.getSeconds() !== 0 || min.getMilliseconds() !== 0) {
      min.setMinutes(min.getMinutes() + (30 - rem));
      min.setSeconds(0, 0);
    }

    const max = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    // Round max DOWN to the previous 30-minute boundary
    max.setMinutes(max.getMinutes() - (max.getMinutes() % 30));
    max.setSeconds(0, 0);

    const formatStr = (d: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
    };
    return { min: formatStr(min), max: formatStr(max) };
  };
  const { min: minDateTime, max: maxDateTime } = getMinMaxDateTime();

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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div>
                <label className="label">Date</label>
                <input 
                  type="date" 
                  className="input" 
                  required 
                  min={minDateTime.split('T')[0]} 
                  max={maxDateTime.split('T')[0]} 
                  value={scheduledDate} 
                  onChange={e => setScheduledDate(e.target.value)} 
                />
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <label className="label">Time</label>
                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <select 
                    className="input" 
                    required 
                    value={scheduledHour} 
                    onChange={e => setScheduledHour(e.target.value)}
                    style={{ flex: 1, minWidth: '4rem', padding: '0.5rem' }}
                  >
                    {Array.from({ length: 12 }).map((_, i) => {
                      const h = (i + 1).toString();
                      return <option key={h} value={h}>{h}</option>;
                    })}
                  </select>
                  <span style={{ display: 'flex', alignItems: 'center' }}>:</span>
                  <select 
                    className="input" 
                    required 
                    value={scheduledMinute} 
                    onChange={e => setScheduledMinute(e.target.value)}
                    style={{ flex: 1, minWidth: '4rem', padding: '0.5rem' }}
                  >
                    <option value="00">00</option>
                    <option value="30">30</option>
                  </select>
                  <select 
                    className="input" 
                    required 
                    value={scheduledAmpm} 
                    onChange={e => setScheduledAmpm(e.target.value)}
                    style={{ flex: 1, minWidth: '4.5rem', padding: '0.5rem' }}
                  >
                    <option value="AM">AM</option>
                    <option value="PM">PM</option>
                  </select>
                </div>
              </div>
            </div>

            <div>
              <label className="label">Duration (Minutes)</label>
              <input type="number" className="input" required min={30} max={300} step={30} value={durationMinutes} onChange={e => setDurationMinutes(Number(e.target.value))} />
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
                  <button onClick={() => handleDelete(session.id)} className="btn btn-danger">
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
