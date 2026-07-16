'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api/courses';
import type { Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function TeacherCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [feedbackModalCourse, setFeedbackModalCourse] = useState<Course | null>(null);

  useEffect(() => {
    fetchCourses();
  }, []);

  const fetchCourses = async () => {
    try {
      const res = await coursesApi.getMyCourses();
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

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete "${title}"?`)) return;
    try {
      await coursesApi.deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to delete course'));
    }
  };

  const handleClearFeedback = async (id: string) => {
    try {
      await coursesApi.clearCourseFeedback(id);
      setCourses(courses.map(c => c.id === id ? { ...c, rejectedReason: null } : c));
      setFeedbackModalCourse(null);
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to clear feedback'));
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Courses</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Create and manage your educational content.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem' }}>
          <select 
            className="input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: '180px' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="DRAFT">Draft</option>
            <option value="PENDING_REVIEW">Pending Review</option>
            <option value="CHANGES_REQUESTED">Changes Requested</option>
            <option value="APPROVED">Approved</option>
            <option value="PUBLISHED">Published</option>
            <option value="REJECTED">Rejected</option>
          </select>
          <Link href="/teacher/courses/create" className="btn btn-primary">
            Create Course
          </Link>
        </div>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      {loading ? (
        <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your courses...</div>
      ) : courses.length === 0 ? (
        <div className="glass-card" style={{ padding: '4rem 2rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📚</div>
          <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>No courses yet</h3>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', marginBottom: '1.5rem' }}>
            Start building your audience by creating your first course.
          </p>
          <Link href="/teacher/courses/create" className="btn btn-primary">
            Create your first course
          </Link>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {(() => {
            const filteredCourses = statusFilter === 'ALL' ? courses : courses.filter(c => c.status === statusFilter);
            if (filteredCourses.length === 0) {
              return (
                <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
                  No courses found matching this status.
                </div>
              );
            }
            return filteredCourses.map((course) => (
              <div key={course.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', transition: 'transform var(--transition-fast)' }} onClick={() => window.location.href = `/teacher/courses/${course.id}/curriculum`}>
                <div style={{ 
                  height: 160, 
                  background: course.coverImageUrl ? `url(${course.coverImageUrl}) center/cover` : 'var(--surface-hover)',
                  borderBottom: '1px solid var(--surface-border)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  {!course.coverImageUrl && <span style={{ color: 'var(--text-muted)' }}>No Cover Image</span>}
                </div>
                <div style={{ padding: '1.25rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <span className={`badge ${getStatusBadgeClass(course.status)}`}>
                      {course.status}
                    </span>
                    <span className="badge" style={{ background: 'var(--brand-500)', color: 'white' }}>
                      {course.courseType === 'HYBRID' ? 'Hybrid' : 'Pre-Recorded'}
                    </span>
                  </div>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.25rem' }}>
                    {course.title}
                  </h3>
                  
                  {course.pricings?.[0] && (
                    <div style={{ marginBottom: '0.5rem', fontWeight: 600, color: 'var(--success)' }}>
                      {course.pricings[0].currency} {course.pricings[0].amount}
                    </div>
                  )}

                  {course.rejectedReason && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <button 
                        onClick={(e) => { e.stopPropagation(); setFeedbackModalCourse(course); }}
                        className="btn btn-secondary"
                        style={{ fontSize: '0.75rem', padding: '0.25rem 0.5rem', background: 'var(--warning-10)', color: 'var(--warning)', border: '1px solid var(--warning-20)' }}
                      >
                        ⚠️ View Feedback
                      </button>
                    </div>
                  )}

                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem', flex: 1, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }} onClick={(e) => e.stopPropagation()}>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/teacher/courses/${course.id}/curriculum`} className="btn btn-primary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                        Curriculum
                      </Link>
                      {course.courseType === 'HYBRID' && (
                        <Link href={`/teacher/courses/${course.id}/sessions`} className="btn btn-secondary" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                          Sessions
                        </Link>
                      )}
                    </div>
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      <Link href={`/teacher/courses/${course.id}/edit`} className="btn btn-ghost" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem' }}>
                        Edit
                      </Link>
                      <button onClick={() => handleDelete(course.id, course.title)} className="btn btn-ghost" style={{ fontSize: '0.875rem', padding: '0.25rem 0.5rem', color: 'var(--error)' }}>
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ));
          })()}
        </div>
      )}

      {feedbackModalCourse && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '500px', padding: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem', color: 'var(--warning)' }}>Admin Feedback</h2>
            <p style={{ fontSize: '1rem', color: 'var(--text-primary)', marginBottom: '1.5rem', whiteSpace: 'pre-wrap' }}>
              {feedbackModalCourse.rejectedReason}
            </p>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              <button onClick={() => setFeedbackModalCourse(null)} className="btn btn-ghost">
                Close
              </button>
              <button onClick={() => handleClearFeedback(feedbackModalCourse.id)} className="btn btn-primary">
                Got it!
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
