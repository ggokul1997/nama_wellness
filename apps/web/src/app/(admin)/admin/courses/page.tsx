'use client';

import { useState, useEffect } from 'react';
import { coursesApi } from '@/lib/api/courses';
import type { Course } from '@nama/shared';
import Link from 'next/link';

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesApi.adminGetPendingCourses();
      setCourses(res.data?.courses || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch courses');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Review Courses</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Courses submitted by teachers waiting for approval.</p>
        </div>
        <div>
          <select 
            className="input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '200px' }}
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
        <div className="glass-card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--surface-hover)', textAlign: 'left', borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Course Title</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Type</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Price</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-secondary)', textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {(() => {
                const filteredCourses = statusFilter === 'ALL' ? courses : courses.filter(c => c.status === statusFilter);
                if (filteredCourses.length === 0) {
                  return (
                    <tr>
                      <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
                        No courses found matching this status.
                      </td>
                    </tr>
                  );
                }
                return filteredCourses.map((course) => (
                  <tr key={course.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{course.title}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ background: 'var(--brand-500)', color: 'white' }}>{course.courseType}</span>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      {course.pricings?.[0] ? (
                        <span style={{ fontWeight: 600, color: 'var(--success)' }}>
                          {course.pricings[0].currency} {course.pricings[0].amount}
                        </span>
                      ) : (
                        <span style={{ color: 'var(--text-muted)' }}>--</span>
                      )}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className={`badge ${getStatusBadgeClass(course.status)}`}>{course.status}</span>
                    </td>
                    <td style={{ padding: '1rem', textAlign: 'right' }}>
                      <Link href={`/admin/courses/${course.id}`} className="btn btn-secondary" style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
                        Review
                      </Link>
                    </td>
                  </tr>
                ));
              })()}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
