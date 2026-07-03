'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuthStore } from '@/stores/auth.store';
import { teacherApplicationsApi } from '@/lib/api/teacher-applications';
import { coursesApi } from '@/lib/api/courses';
import { ROUTES } from '@nama/shared';

export default function TeacherDashboard() {
  const { user } = useAuthStore();
  const firstName = user?.profile?.firstName ?? 'Teacher';

  const [application, setApplication] = useState<any>(null);
  const [loadingApp, setLoadingApp] = useState(true);
  const [courseCount, setCourseCount] = useState<number | null>(null);

  useEffect(() => {
    teacherApplicationsApi.getMyApplication()
      .then(res => {
        const app = res.data?.application;
        setApplication(app);
        if (app?.status === 'APPROVED') {
          coursesApi.getMyCourses()
            .then(r => setCourseCount(r.data?.courses?.length ?? 0))
            .catch(() => setCourseCount(0));
        }
      })
      .catch(console.error)
      .finally(() => setLoadingApp(false));
  }, []);

  const isApproved = application?.status === 'APPROVED';

  return (
    <div className="page-content">
      <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Welcome, {firstName} 🧑‍🏫
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          Your teaching hub
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem', marginBottom: '2.5rem',
      }}>
        {[
          { label: 'My Courses', value: courseCount !== null ? String(courseCount) : '—', icon: '📚' },
          { label: 'Total Students', value: '—', icon: '👥' },
          { label: 'Sessions This Month', value: '—', icon: '📅' },
          { label: 'Earnings (₹)', value: '—', icon: '💰' },
        ].map((m, i) => (
          <div key={m.label} className={`metric-card animate-fade-up stagger-${i + 1}`}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{m.icon}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      {isApproved && (
        <div className="glass-card" style={{ padding: '1.5rem' }}>
          <h2 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Quick Actions</h2>
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            <Link href={ROUTES.TEACHER_COURSES} className="btn btn-ghost" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              📚 View My Courses
            </Link>
            <Link href="/teacher/courses/create" className="btn btn-primary" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              + Create New Course
            </Link>
          </div>
        </div>
      )}

      {loadingApp ? (
        <div style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>Loading...</div>
      ) : !isApproved && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 9999,
          background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(10px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '1.5rem',
        }}>
          <div className="glass-card" style={{ maxWidth: 450, width: '100%', padding: '2.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📝</div>
            <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Action Required
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', lineHeight: 1.6 }}>
              {application?.status === 'PENDING'
                ? "Your application is currently under review. You'll get full access once approved."
                : "You need to submit your teacher application before accessing the dashboard."}
            </p>
            <Link
              href={ROUTES.TEACHER_ONBOARDING}
              className="btn btn-primary"
              style={{ width: '100%', justifyContent: 'center' }}
            >
              {application?.status === 'PENDING' ? 'View Application Status' : 'Start Application'}
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
