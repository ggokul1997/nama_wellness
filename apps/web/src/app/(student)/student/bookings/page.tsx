'use client';

import { useState, useEffect } from 'react';
import { engagementApi } from '@/lib/api/engagement';
import type { LiveSession } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { format } from 'date-fns';

export default function StudentBookingsPage() {
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      try {
        const res = await engagementApi.getStudentBookings();
        setSessions(res.data || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load bookings'));
      } finally {
        setLoading(false);
      }
    };
    fetchBookings();
  }, []);

  if (loading) {
    return <div className="page-content text-center color-text-secondary p-8">Loading bookings...</div>;
  }

  if (error) {
    return <div className="page-content alert alert-error">{error}</div>;
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Live Classes</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>View and join your upcoming live sessions.</p>
      </div>

      {sessions.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>You don't have any upcoming live classes scheduled.</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {sessions.map((session) => (
            <div key={session.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{session.title}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--brand-500)', marginTop: '0.25rem' }}>
                  {session.course?.title}
                </div>
              </div>

              {session.description && (
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{session.description}</p>
              )}

              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                <div><strong>Scheduled for:</strong> {format(new Date(session.scheduledAt), 'PPp')}</div>
                <div><strong>Duration:</strong> {session.durationMinutes} minutes</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <a 
                  href={session.meetingUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-primary"
                  style={{ width: '100%', textAlign: 'center', display: 'inline-block' }}
                >
                  Join Class
                </a>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
