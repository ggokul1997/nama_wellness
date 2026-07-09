'use client';

import { useState, useEffect } from 'react';
import { authApi } from '@/lib/api/auth';
import type { AuthUser } from '@nama/shared';

export default function StudentProfilePage() {
  const [user, setUser] = useState<AuthUser | null>(null);

  useEffect(() => {
    authApi.getMe().then(res => setUser(res.data?.user || null)).catch(console.error);
  }, []);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Profile</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Manage your personal information and account settings.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Account Details</h2>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Email Address</label>
            <div style={{ marginTop: '0.25rem', padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--surface-border)' }}>
              {user?.email || 'Loading...'}
            </div>
          </div>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: 'var(--text-secondary)' }}>Role</label>
            <div style={{ marginTop: '0.25rem', padding: '0.75rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--surface-border)', textTransform: 'capitalize' }}>
              {user?.roles?.[0]?.role?.toLowerCase() || 'Student'}
            </div>
          </div>
        </div>

        <div style={{ marginTop: '2rem', padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px solid var(--surface-border)' }}>
          <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>Coming Soon</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', fontSize: '0.875rem' }}>
            Full profile management (avatar uploads, bio, password changes) will be available in an upcoming update.
          </p>
        </div>
      </div>
    </div>
  );
}
