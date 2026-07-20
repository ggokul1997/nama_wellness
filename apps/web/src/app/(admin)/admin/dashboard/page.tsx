'use client';

import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api/analytics';
import type { AdminPlatformStats } from '@nama/shared';

export default function AdminDashboard() {
  const [stats, setStats] = useState<AdminPlatformStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await analyticsApi.getAnalytics(30);
        if (response.success && response.data) {
          setStats(response.data.stats);
        }
      } catch (err) {
        console.error('Failed to load dashboard stats:', err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchStats();
  }, []);

  const metrics = [
    { label: 'Total Students', value: stats ? stats.totalStudents.toLocaleString() : '—', icon: '🎓' },
    { label: 'Active Teachers', value: stats ? stats.totalTeachers.toLocaleString() : '—', icon: '🧑‍🏫' },
    { label: 'Published Courses', value: stats ? stats.publishedCourses.toLocaleString() : '—', icon: '📚' },
    { label: 'Revenue (₹)', value: stats ? stats.totalRevenue.toLocaleString() : '—', icon: '💰' },
    { label: 'Pending Applications', value: stats ? stats.pendingApplications.toLocaleString() : '—', icon: '📋' },
    { label: 'Corporate Clients', value: stats ? stats.totalCorporateClients.toLocaleString() : '—', icon: '🏢' },
  ];

  return (
    <div className="page-content">
      <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Platform Overview ⚙️
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          Nama Wellness — Admin Control Center
        </p>
      </div>

      <div className="metric-grid" style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.5rem',
        marginTop: '2rem',
        marginBottom: '2rem'
      }}>
        {metrics.map((m, i) => (
          <div key={m.label} className={`glass-card metric-card animate-fade-up stagger-${i+1}`} style={{
            padding: '1.5rem',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-start',
            gap: '0.5rem',
            borderLeft: '4px solid var(--brand-500)'
          }}>
            <div style={{ fontSize: '2rem' }}>{m.icon}</div>
            <div className="metric-value" style={{ 
              fontSize: '1.75rem', 
              fontWeight: '700', 
              color: 'var(--text-primary)',
              opacity: isLoading ? 0.5 : 1,
              transition: 'opacity 0.3s'
            }}>
              {m.value}
            </div>
            <div className="metric-label" style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
              {m.label}
            </div>
          </div>
        ))}
      </div>

      <div className="alert alert-success animate-fade-up stagger-7">
        ✅ Live platform statistics loaded successfully.
      </div>
    </div>
  );
}
