'use client';

import { useState, useEffect } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import { useAuth } from '@/lib/auth/session';
import { getMyBookings, updateBookingStatus } from '@/lib/api/bookings';
import { engagementApi } from '@/lib/api/engagement';
import { IndividualSessionBooking, LiveSession } from '@nama/shared';
import { toast } from 'react-hot-toast';
import { format } from 'date-fns';

export default function TeacherBookingsPage() {
  const { user } = useAuth();
  const dialog = useDialog();
  const [activeTab, setActiveTab] = useState<'GROUP' | 'ONE_ON_ONE'>('GROUP');
  const [sessions, setSessions] = useState<LiveSession[]>([]);
  const [bookings, setBookings] = useState<IndividualSessionBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Edit Meeting URL modal state
  const [editingBooking, setEditingBooking] = useState<IndividualSessionBooking | null>(null);
  const [meetingUrl, setMeetingUrl] = useState('');

  useEffect(() => {
    if (user?.id) {
      loadBookings();
    }
  }, [user]);

  const loadBookings = async () => {
    try {
      setIsLoading(true);
      const [sessionsRes, bookingsRes] = await Promise.all([
        engagementApi.getTeacherBookings(),
        getMyBookings()
      ]);
      setSessions(sessionsRes.data || []);
      setBookings(bookingsRes.data?.bookings || []);
    } catch (err: any) {
      toast.error('Failed to load bookings');
    } finally {
      setIsLoading(false);
    }
  };

  const handleUpdateStatus = async (bookingId: string, status: 'CONFIRMED' | 'CANCELLED' | 'COMPLETED', mUrl?: string) => {
    try {
      await updateBookingStatus(bookingId, status, mUrl);
      toast.success(`Booking ${status.toLowerCase()}`);
      loadBookings();
      setEditingBooking(null);
    } catch (err: any) {
      toast.error('Failed to update booking status');
    }
  };

  const handleAddMeetingLink = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingBooking) {
      handleUpdateStatus(editingBooking.id, 'CONFIRMED', meetingUrl);
    }
  };

  if (isLoading) {
    return <div className="page-content text-center p-8 text-muted">Loading bookings...</div>;
  }

  const upcomingBookings = bookings.filter(b => ['PENDING_PAYMENT', 'CONFIRMED'].includes(b.status));
  const pastBookings = bookings.filter(b => ['COMPLETED', 'CANCELLED'].includes(b.status));

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Sessions & Classes</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>View and manage your upcoming live group classes and 1-on-1 sessions.</p>
      </div>

      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', paddingBottom: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
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
              <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Upcoming Group Classes</h2>
              <div className="responsive-grid-3">
                {upcomingGroupSessions.length === 0 ? (
                  <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--surface-border)', borderRadius: 'var(--radius-xl)' }}>
                    You have no upcoming group sessions.
                  </div>
                ) : (
                  upcomingGroupSessions.map(session => (
                    <div key={session.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{session.title}</h3>
                          {session.course && (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
                              Course: {session.course.title}
                            </p>
                          )}
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {format(new Date(session.scheduledAt), 'PPp')}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--brand-500)', marginTop: '0.25rem' }}>
                            Duration: {session.durationMinutes} mins
                          </p>
                        </div>
                      </div>
                      {session.description && (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '1.5rem' }}>
                          {session.description}
                        </p>
                      )}
                      <div style={{ paddingTop: '1rem', marginTop: 'auto', borderTop: '1px solid var(--surface-border)', display: 'flex', gap: '0.5rem' }}>
                        <a 
                          href={session.meetingUrl} 
                          target="_blank" 
                          rel="noopener noreferrer" 
                          className="btn btn-primary"
                          style={{ flex: 1, textDecoration: 'none', textAlign: 'center' }}
                        >
                          Join Meeting
                        </a>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>

            {pastGroupSessions.length > 0 && (
              <section>
                <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Past Group Classes</h2>
                <div className="responsive-grid-3">
                  {pastGroupSessions.map(session => (
                    <div key={session.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', opacity: 0.7 }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                        <div>
                          <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>{session.title}</h3>
                          {session.course && (
                            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem', fontWeight: 500 }}>
                              Course: {session.course.title}
                            </p>
                          )}
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                            {format(new Date(session.scheduledAt), 'PPp')}
                          </p>
                          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                            Duration: {session.durationMinutes} mins
                          </p>
                        </div>
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
        <div style={{ display: 'flex', flexDirection: 'column', gap: '3rem' }}>
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Upcoming Sessions</h2>
            <div className="responsive-grid-3">
            {upcomingBookings.length === 0 ? (
              <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', border: '1px dashed var(--surface-border)', borderRadius: 'var(--radius-xl)' }}>
                You have no upcoming sessions.
              </div>
            ) : (
              upcomingBookings.map(booking => (
                <div key={booking.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ 
                        display: 'inline-block', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '999px', marginBottom: '0.75rem',
                        background: booking.status === 'CONFIRMED' ? 'rgba(34,197,94,0.1)' : 'rgba(234,179,8,0.1)',
                        color: booking.status === 'CONFIRMED' ? '#22c55e' : '#eab308',
                        border: booking.status === 'CONFIRMED' ? '1px solid rgba(34,197,94,0.2)' : '1px solid rgba(234,179,8,0.2)'
                      }}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {format(new Date(booking.scheduledAt), 'PPp')}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Duration: {booking.durationMinutes} mins
                      </p>
                    </div>
                  </div>

                  <div style={{ paddingTop: '1rem', marginTop: 'auto', borderTop: '1px solid var(--surface-border)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Student ID:</span> {booking.studentId}
                    </p>
                    
                    {booking.meetingUrl ? (
                      <div style={{ marginTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        <a href={booking.meetingUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--brand-500)', fontSize: '0.875rem', fontWeight: 600, textDecoration: 'none' }}>
                          Join Meeting
                        </a>
                        {booking.status === 'CONFIRMED' && (
                          <button 
                            onClick={() => { setEditingBooking(booking); setMeetingUrl(booking.meetingUrl || ''); }}
                            className="btn btn-ghost"
                            style={{ padding: '0', height: 'auto', color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 500 }}
                          >
                            ✎ Edit
                          </button>
                        )}
                      </div>
                    ) : booking.status === 'CONFIRMED' ? (
                      <button 
                        onClick={() => { setEditingBooking(booking); setMeetingUrl(''); }}
                        className="btn btn-ghost"
                        style={{ marginTop: '0.75rem', padding: '0', height: 'auto', color: 'var(--brand-500)', fontSize: '0.875rem', fontWeight: 600 }}
                      >
                        + Add Meeting Link
                      </button>
                    ) : (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', fontStyle: 'italic', marginTop: '0.75rem' }}>
                        Waiting for student payment.
                      </p>
                    )}
                  </div>

                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', marginTop: '1.5rem' }}>
                    {booking.status === 'CONFIRMED' && (
                      <button 
                        onClick={async () => {
                          const confirmed = await dialog.confirm({ title: 'Confirm Completion', message: 'Are you sure you want to mark this session as completed?', confirmText: 'Mark Completed' });
                          if (!confirmed) return;
                          handleUpdateStatus(booking.id, 'COMPLETED');
                        }}
                        className="btn btn-outline"
                        style={{ flex: 1 }}
                      >
                        Mark Completed
                      </button>
                    )}
                    <button 
                      onClick={async () => {
                        const confirmed = await dialog.confirm({ title: 'Confirm', message: 'Are you sure you want to cancel this booking?', isDestructive: true, confirmText: 'Delete' });
                        if (!confirmed) return;
                        handleUpdateStatus(booking.id, 'CANCELLED');
                      }}
                      className="btn btn-danger"
                      style={{ flex: 1 }}
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>

        {pastBookings.length > 0 && (
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Past Sessions</h2>
            <div className="responsive-grid-3">
              {pastBookings.map((booking) => (
                <div key={booking.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', opacity: 0.7 }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <span style={{ 
                        display: 'inline-block', padding: '0.25rem 0.75rem', fontSize: '0.75rem', fontWeight: 600, borderRadius: '999px', marginBottom: '0.75rem',
                        background: booking.status === 'COMPLETED' ? 'rgba(59,130,246,0.1)' : 'rgba(239,68,68,0.1)',
                        color: booking.status === 'COMPLETED' ? '#3b82f6' : '#ef4444'
                      }}>
                        {booking.status.replace('_', ' ')}
                      </span>
                      <h3 style={{ fontSize: '1.125rem', fontWeight: 700, color: 'var(--text-primary)' }}>
                        {format(new Date(booking.scheduledAt), 'PPp')}
                      </h3>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                        Duration: {booking.durationMinutes} mins
                      </p>
                    </div>
                  </div>
                  <div style={{ paddingTop: '1rem', marginTop: 'auto', borderTop: '1px solid var(--surface-border)' }}>
                    <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                      <span style={{ color: 'var(--text-muted)' }}>Student ID:</span> {booking.studentId}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
        </div>
      )}

      {editingBooking && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)', zIndex: 50, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '1rem' }}>
          <div className="glass-card" style={{ maxWidth: '400px', width: '100%', padding: '1.5rem', boxShadow: 'var(--shadow-lg)' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>Add Meeting Link</h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
              Provide a video conferencing link (e.g., Zoom, Google Meet) for this 1-on-1 session.
            </p>
            <form onSubmit={handleAddMeetingLink} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">
                  Meeting URL
                </label>
                <input
                  type="url"
                  required
                  value={meetingUrl}
                  onChange={(e) => setMeetingUrl(e.target.value)}
                  className="input"
                  placeholder="https://meet.google.com/..."
                />
              </div>

              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '0.75rem', paddingTop: '1.5rem' }}>
                <button
                  type="button"
                  onClick={() => setEditingBooking(null)}
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                >
                  Save Link
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
