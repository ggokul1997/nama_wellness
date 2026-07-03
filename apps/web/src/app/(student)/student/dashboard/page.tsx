'use client';

import { useAuthStore } from '@/stores/auth.store';

const QUICK_LINKS = [
  { icon: '📚', label: 'Browse Courses', desc: 'Find your next course' },
  { icon: '📅', label: 'Upcoming Sessions', desc: 'Your scheduled classes' },
  { icon: '🎓', label: 'Certificates', desc: 'View your achievements' },
  { icon: '💬', label: 'Messages', desc: 'Chat with teachers' },
];

export default function StudentDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.profile?.firstName ?? 'Student';

  return (
    <div className="page-content">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome back, {firstName} 👋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          Continue your wellness journey
        </p>
      </div>

      {/* Metrics */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem', marginBottom: '2.5rem',
      }}>
        {[
          { label: 'Enrolled Courses', value: '—', icon: '📚' },
          { label: 'Sessions Attended', value: '—', icon: '✅' },
          { label: 'Certificates', value: '—', icon: '🎓' },
          { label: 'Hours Learned', value: '—', icon: '⏱️' },
        ].map((m, i) => (
          <div key={m.label} className={`metric-card animate-fade-up stagger-${i + 1}`}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{m.icon}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {/* Quick links */}
      <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
        Quick Actions
      </h2>
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1rem',
      }}>
        {QUICK_LINKS.map((link, i) => (
          <div key={link.label} className={`glass-card animate-fade-up stagger-${i + 1}`}
            style={{ padding: '1.25rem', cursor: 'pointer' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{link.icon}</div>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
              {link.label}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{link.desc}</div>
          </div>
        ))}
      </div>

      <div className="alert alert-warning" style={{ marginTop: '2rem' }}>
        ⚠️ Sprint A complete — Courses, sessions, and enrollments are coming in Sprint B & C.
      </div>
    </div>
  );
}
