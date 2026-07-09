'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useAuth } from '@/lib/auth/session';
import { ROUTES } from '@nama/shared';
import { NotificationBell } from './NotificationBell';

export function Navigation() {
  const { user, logout } = useAuth();
  const isAuthenticated = !!user;
  const activeRole = user?.roles[0]?.role || null;
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="main-header">
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <div style={{ fontSize: '1.5rem', fontWeight: 'bold', letterSpacing: '-0.05em' }}>NAMA</div>
        </Link>
        {mounted && isAuthenticated && (
          <span style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', background: 'rgba(255,255,255,0.1)', borderRadius: '4px' }}>
            {activeRole === 'ADMIN' ? 'ADMIN' : activeRole === 'COMPANY_ADMIN' || activeRole === 'EMPLOYEE' ? 'Corporate Wellness' : 'EDPRO'}
          </span>
        )}
      </div>
      <nav style={{ display: 'flex', gap: '1.5rem', fontSize: '0.875rem', alignItems: 'center' }}>
        <Link href="/courses" className="nav-link">Explore Courses</Link>
        
        {mounted && isAuthenticated && (
          <>
            {activeRole === 'ADMIN' ? (
              <Link href={ROUTES.ADMIN_DASHBOARD} className="nav-link" style={{ color: 'var(--brand-400)' }}>Admin Portal</Link>
            ) : activeRole === 'TEACHER' ? (
              <Link href={ROUTES.TEACHER_DASHBOARD} className="nav-link">Teacher Dashboard</Link>
            ) : activeRole === 'COMPANY_ADMIN' ? (
              <Link href={ROUTES.COMPANY_ADMIN_DASHBOARD} className="nav-link">Company Portal</Link>
            ) : activeRole === 'EMPLOYEE' ? (
              <Link href={ROUTES.EMPLOYEE_DASHBOARD} className="nav-link">My Learning</Link>
            ) : (
              <Link href={ROUTES.STUDENT_DASHBOARD} className="nav-link">My Dashboard</Link>
            )}
          </>
        )}

        {mounted && !isAuthenticated && (
          <Link href={ROUTES.TEACHER_ONBOARDING} className="nav-link">Teach on Nama</Link>
        )}

        {mounted && (
          isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginLeft: '1rem' }}>
              <NotificationBell />
              <span style={{ color: 'var(--text-secondary)' }}>{user?.email}</span>
              <button onClick={handleLogout} className="btn" style={{ padding: '0.5rem 1rem', background: 'rgba(255,255,255,0.1)' }}>Logout</button>
            </div>
          ) : (
            <Link href={ROUTES.LOGIN} className="btn btn-primary" style={{ padding: '0.5rem 1rem' }}>Sign In</Link>
          )
        )}
      </nav>
    </header>
  );
}
