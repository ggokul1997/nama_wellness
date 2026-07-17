'use client';

import { useState, useEffect } from 'react';
import { coursesApi } from '@/lib/api/courses';
import type { Course } from '@nama/shared';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/error';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [corporateFilter, setCorporateFilter] = useState<boolean>(false);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesApi.adminGetPendingCourses();
      setCourses(res.data?.courses || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch courses'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return 'badge-success';
      case 'REJECTED':
        return 'badge-error';
      case 'CHANGES_REQUESTED':
      case 'PENDING_REVIEW':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  };

  if (loading) return <div className="page-content">Loading...</div>;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Review Courses</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Courses submitted by teachers waiting for approval.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-secondary)' }}>
            <input 
              type="checkbox" 
              checked={corporateFilter} 
              onChange={(e) => setCorporateFilter(e.target.checked)} 
              style={{ width: '1.25rem', height: '1.25rem', accentColor: 'var(--brand-500)' }}
            />
            Corporate Enabled
          </label>
          <select 
            className="input" 
            value={typeFilter} 
            onChange={(e) => setTypeFilter(e.target.value)}
            style={{ width: '150px' }}
          >
            <option value="ALL">All Types</option>
            <option value="RECORDED">Pre-recorded</option>
            <option value="HYBRID">Hybrid</option>
          </select>
          <select 
            className="input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="APPROVED">Approved</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {courses.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎉</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>All caught up!</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>There are no courses pending review at the moment.</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {(() => {
            const filteredCourses = courses.filter(c => {
              if (statusFilter !== 'ALL' && c.status !== statusFilter) return false;
              if (typeFilter !== 'ALL' && c.courseType !== typeFilter) return false;
              if (corporateFilter && !c.isAvailableForCorporate) return false;
              return true;
            });
            if (filteredCourses.length === 0) {
              return (
                <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  No courses found matching these filters.
                </div>
              );
            }
            return filteredCourses.map((course) => (
              <div key={course.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                  <div>
                    <h3 style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.125rem' }}>{course.title}</h3>
                    <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.5rem', flexWrap: 'wrap' }}>
                      <span className="badge" style={{ background: 'var(--brand-500)', color: 'white' }}>{course.courseType}</span>
                      <span className={`badge ${getStatusBadgeClass(course.status)}`}>{course.status}</span>
                      {course.isAvailableForCorporate && (
                        <span className="badge" style={{ background: '#3b82f6', color: 'white' }}>CORPORATE</span>
                      )}
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    {course.pricings?.[0] ? (
                      <div style={{ fontWeight: 600, color: 'var(--success)', fontSize: '1.125rem' }}>
                        {course.pricings[0].currency} {course.pricings[0].amount}
                      </div>
                    ) : (
                      <div style={{ color: 'var(--text-muted)' }}>--</div>
                    )}
                  </div>
                </div>
                <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                  <Link href={`/admin/courses/${course.id}`} className="btn btn-secondary">
                    Review
                  </Link>
                </div>
              </div>
            ));
          })()}
        </div>
      )}
    </div>
  );
}
