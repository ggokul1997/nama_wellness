'use client';

import { useState, useEffect, useCallback } from 'react';
import { adminTeachersApi } from '@/lib/api/admin-teachers';
import type { AdminTeacher, AdminTeacherSummary } from '@nama/shared';
import Link from 'next/link';

export default function AdminTeachersPage() {
  const [teachers, setTeachers] = useState<AdminTeacher[]>([]);
  const [summary, setSummary] = useState<AdminTeacherSummary | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [summaryRes, teachersRes] = await Promise.all([
        adminTeachersApi.getSummary(),
        adminTeachersApi.getTeachers({ search, status: statusFilter })
      ]);
      
      if (summaryRes.success && summaryRes.data) {
        setSummary(summaryRes.data);
      }
      
      if (teachersRes.success && teachersRes.data) {
        setTeachers(teachersRes.data);
      }
    } catch (err) {
      console.error('Failed to load teachers data', err);
    } finally {
      setIsLoading(false);
    }
  }, [search, statusFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  const getStatusColor = (status: string, performanceStatus: string) => {
    if (status === 'SUSPENDED' || performanceStatus === 'SUSPENSION') return { bg: 'rgba(239, 68, 68, 0.1)', text: '#ef4444', label: 'Suspended' };
    if (status === 'ACTIVE' && performanceStatus === 'GOOD_STANDING') return { bg: 'rgba(34, 197, 94, 0.1)', text: '#4ade80', label: 'Verified' };
    return { bg: 'rgba(245, 158, 11, 0.1)', text: '#fbbf24', label: 'Pending' };
  };

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Teachers Directory 🧑‍🏫
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            Manage teachers, approvals, quality, and payouts.
          </p>
        </div>
      </div>

      {/* Summary Cards */}
      {summary && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '1rem', marginBottom: '2rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-400)' }}>{summary.totalTeachers}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Total Teachers</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4ade80' }}>{summary.activeTeachers}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Active Teachers</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#fbbf24' }}>{summary.pendingVerification}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Pending Verification</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#ef4444' }}>{summary.suspendedTeachers}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Suspended Teachers</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: '#a855f7' }}>⭐ {summary.averageRating.toFixed(1)}</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Average Rating</div>
          </div>
          <div className="glass-card" style={{ padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-500)' }}>₹{(summary.totalRevenueGenerated / 1000).toFixed(1)}k</div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.5rem' }}>Total Revenue</div>
          </div>
        </div>
      )}

      {/* Filters Toolbar */}
      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', gap: '0.5rem', flex: 1, minWidth: '250px' }}>
          <input
            type="text"
            className="input"
            placeholder="Search by name or email..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{ flex: 1 }}
          />
          <button type="submit" className="btn btn-primary">Search</button>
        </form>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
          {['ALL', 'VERIFIED', 'PENDING', 'SUSPENDED'].map(s => (
            <button 
              key={s} 
              className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
              onClick={() => setStatusFilter(s)}
              style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
            >
              {s.charAt(0) + s.slice(1).toLowerCase()}
            </button>
          ))}
        </div>
      </div>

      {/* Teacher Cards Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
        {isLoading ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>Loading teachers...</div>
        ) : teachers.length === 0 ? (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No teachers found matching your criteria.</div>
        ) : (
          teachers.map(teacher => {
            const statusStyle = getStatusColor(teacher.status, teacher.performanceStatus);
            return (
              <div key={teacher.userId} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1.25rem', background: 'var(--surface-raised)' }}>
                {/* Header: Avatar, Name, Email, Status */}
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem' }}>
                  <div style={{ 
                    width: '50px', height: '50px', borderRadius: '50%', 
                    background: 'var(--surface-sunken)', display: 'flex', 
                    alignItems: 'center', justifyContent: 'center', 
                    fontSize: '1.25rem', fontWeight: 600, color: 'var(--brand-400)',
                    overflow: 'hidden', flexShrink: 0
                  }}>
                    {teacher.avatarUrl ? (
                      <img src={teacher.avatarUrl} alt={teacher.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      (teacher.firstName?.[0] || teacher.email?.[0] || '?').toUpperCase()
                    )}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: '0.5rem' }}>
                      <h3 style={{ margin: 0, fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {teacher.firstName} {teacher.lastName}
                      </h3>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.text,
                        whiteSpace: 'nowrap'
                      }}>
                        {statusStyle.label}
                      </span>
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                      {teacher.email}
                    </div>
                  </div>
                </div>

                {/* Stats Grid */}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', padding: '1rem', background: 'var(--surface)', borderRadius: 'var(--radius-md)' }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Courses</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{teacher.coursesCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Students</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{teacher.studentsCount}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Revenue</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>₹{teacher.totalRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Rating</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>⭐ {teacher.averageRating.toFixed(1)}</div>
                  </div>
                </div>

                {/* Actions */}
                <div style={{ display: 'flex', gap: '0.5rem', marginTop: 'auto' }}>
                  <Link 
                    href={`/admin/teachers/${teacher.userId}`}
                    className="btn btn-primary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem', textAlign: 'center' }}
                  >
                    View Profile
                  </Link>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
