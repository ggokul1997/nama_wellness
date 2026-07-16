'use client';

import { useState, useEffect } from 'react';
import { engagementApi } from '@/lib/api/engagement';
import { getMyBookings, updateBookingStatus } from '@/lib/api/bookings';
import type { LiveSession, IndividualSessionBooking } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { format } from 'date-fns';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

export default function StudentBookingsPage() {
  const [activeTab, setActiveTab] = useState<'GROUP' | 'ONE_ON_ONE'>('GROUP');
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [individualBookings, setIndividualBookings] = useState<IndividualSessionBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [sessionsRes, bookingsRes] = await Promise.all([
          engagementApi.getStudentBookings(),
          getMyBookings()
        ]);
        setSessions(sessionsRes.data || []);
        setIndividualBookings(bookingsRes.data?.bookings || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load bookings'));
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleCancel = async (bookingId: string) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;
    try {
      await updateBookingStatus(bookingId, 'CANCELLED');
      toast.success('Booking cancelled');
      const res = await getMyBookings();
      setIndividualBookings(res.data?.bookings || []);
    } catch (err: any) {
      toast.error('Failed to cancel booking');
    }
  };

  if (loading) {
    return <div className="page-content text-center color-text-secondary p-8">Loading bookings...</div>;
  }

  if (error) {
    return <div className="page-content alert alert-error">{error}</div>;
  }

  const upcomingBookings = individualBookings.filter(b => ['PENDING_PAYMENT', 'CONFIRMED'].includes(b.status));
  const pastBookings = individualBookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status));

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Sessions & Classes</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>View and manage your upcoming live group classes and 1-on-1 sessions.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem' }}>
        <button
          onClick={() => setActiveTab('GROUP')}
          style={{
            padding: '0.5rem 1rem',
            fontWeight: 600,
            color: activeTab === 'GROUP' ? 'var(--brand-500)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'GROUP' ? '2px solid var(--brand-500)' : 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          Group Classes
        </button>
        <button
          onClick={() => setActiveTab('ONE_ON_ONE')}
          style={{
            padding: '0.5rem 1rem',
            fontWeight: 600,
            color: activeTab === 'ONE_ON_ONE' ? 'var(--brand-500)' : 'var(--text-secondary)',
            borderBottom: activeTab === 'ONE_ON_ONE' ? '2px solid var(--brand-500)' : 'none',
            borderTop: 'none',
            borderLeft: 'none',
            borderRight: 'none',
            background: 'transparent',
            cursor: 'pointer',
          }}
        >
          1-on-1 Sessions
        </button>
      </div>

      {activeTab === 'GROUP' ? (() => {
        const upcomingGroupSessions = sessions.filter(s => new Date(s.scheduledAt).getTime() >= Date.now());
        const pastGroupSessions = sessions.filter(s => new Date(s.scheduledAt).getTime() < Date.now());
        
        return (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
            <section>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Upcoming Live Classes</h2>
              {upcomingGroupSessions.length === 0 ? (
                <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                  <div style={{ color: 'var(--text-secondary)' }}>You don't have any upcoming live classes scheduled.</div>
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {upcomingGroupSessions.map((session) => (
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
            </section>
            
            {pastGroupSessions.length > 0 && (
              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Past Live Classes</h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
                  {pastGroupSessions.map((session) => (
                    <div key={session.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', opacity: 0.7 }}>
                      <div>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{session.title}</h3>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                          {session.course?.title}
                        </div>
                      </div>

                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.25rem' }}>
                        <div><strong>Scheduled for:</strong> {format(new Date(session.scheduledAt), 'PPp')}</div>
                        <div><strong>Duration:</strong> {session.durationMinutes} minutes</div>
                      </div>
                    </div>
                  ))}
                </div>
              </section>
            )}
          </div>
        );
      })()
      : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
          <div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Upcoming 1-on-1s</h3>
            {upcomingBookings.length === 0 ? (
              <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
                <div style={{ color: 'var(--text-secondary)' }}>You don't have any upcoming 1-on-1 sessions.</div>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem', marginTop: '1rem' }}>
                {upcomingBookings.map((booking) => (
                  <div key={booking.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                      <span style={{ 
                        display: 'inline-block', padding: '0.25rem 0.5rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '4px', marginBottom: '0.5rem',
                        background: booking.status === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                        color: booking.status === 'CONFIRMED' ? '#22c55e' : '#eab308'
                      }}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                        {format(new Date(booking.scheduledAt), 'PPp')}
                      </h3>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Duration: {booking.durationMinutes} mins
                      </div>
                    </div>

                    <div style={{ marginTop: 'auto', display: 'flex', gap: '0.5rem' }}>
                      {booking.status === 'PENDING_PAYMENT' && (
                        <Link href={`/checkout/booking/${booking.id}`} className="btn btn-primary flex-1 text-center">
                          Pay Now
                        </Link>
                      )}
                      {booking.meetingUrl && booking.status === 'CONFIRMED' && (
                        <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer" className="btn btn-primary flex-1 text-center">
                          Join Meeting
                        </a>
                      )}
                      <button onClick={() => handleCancel(booking.id)} className="btn btn-danger">
                        Cancel
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          {pastBookings.length > 0 && (
            <div>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Past 1-on-1s</h3>
              <div className="glass-card" style={{ overflow: 'hidden' }}>
                <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
                  <thead style={{ background: 'var(--surface-active)' }}>
                    <tr>
                      <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Date & Time</th>
                      <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Duration</th>
                      <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pastBookings.map((booking) => (
                      <tr key={booking.id} style={{ borderTop: '1px solid var(--surface-border)' }}>
                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{format(new Date(booking.scheduledAt), 'PPp')}</td>
                        <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>{booking.durationMinutes} mins</td>
                        <td style={{ padding: '1rem' }}>
                          <span style={{ color: booking.status === 'COMPLETED' ? 'var(--brand-500)' : '#ef4444' }}>
                            {booking.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
