'use client';

import { useState, useEffect } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import Link from 'next/link';
import { coursesApi } from '@/lib/api/courses';
import type { Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function TeacherCoursesPage() {
  const dialog = useDialog();
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
    const confirmed = await dialog.confirm({ title: 'Confirm', message: `Are you sure you want to delete "${title}"?`, isDestructive: true, confirmText: 'Delete' });
    if (!confirmed) return;
    try {
      await coursesApi.deleteCourse(id);
      setCourses(courses.filter((c) => c.id !== id));
    } catch (err: unknown) {
      await dialog.alert({ title: 'Notification', message: getErrorMessage(err, 'Failed to delete course') });
    }
  };

  const handleClearFeedback = async (id: string) => {
    try {
      await coursesApi.clearCourseFeedback(id);
      setCourses(courses.map(c => c.id === id ? { ...c, rejectedReason: null } : c));
      setFeedbackModalCourse(null);
    } catch (err: unknown) {
      await dialog.alert({ title: 'Notification', message: getErrorMessage(err, 'Failed to clear feedback') });
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Courses</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Create and manage your educational content.</p>
        </div>
        <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
          <select 
            className="input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'clamp(140px, 30vw, 180px)' }}
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
        <div className="responsive-grid-3">
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
                <div style={{ display: 'flex', padding: '1rem', gap: '1rem' }}>
                  <div style={{ 
                    width: '80px', height: '80px', flexShrink: 0, 
                    borderRadius: 'var(--radius-md)', 
                    background: course.coverImageUrl ? `url(${course.coverImageUrl}) center/cover` : 'var(--surface-hover)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
                    border: '1px solid var(--surface-border)'
                  }}>
                    {!course.coverImageUrl && <span style={{ fontSize: '0.65rem', color: 'var(--text-muted)' }}>No Cover</span>}
                  </div>
                  
                  <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', justifyContent: 'center' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.25rem' }}>
                      <h3 style={{ fontSize: '1rem', fontWeight: 600, color: 'var(--text-primary)', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap', paddingRight: '0.5rem' }}>
                        {course.title}
                      </h3>
                      <span className={`badge ${getStatusBadgeClass(course.status)}`} style={{ padding: '0.15rem 0.4rem', fontSize: '0.65rem', flexShrink: 0 }}>
                        {course.status}
                      </span>
                    </div>
                    
                    <p style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 1, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {course.description}
                    </p>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span className="badge" style={{ background: 'var(--brand-500)', color: 'white', padding: '0.15rem 0.4rem', fontSize: '0.65rem' }}>
                        {course.courseType === 'HYBRID' ? 'Hybrid' : 'Pre-Recorded'}
                      </span>
                      {course.pricings?.[0] && (
                        <span style={{ fontSize: '0.8125rem', fontWeight: 600, color: 'var(--success)' }}>
                          {course.pricings[0].currency} {course.pricings[0].amount}
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {(course.status === 'CHANGES_REQUESTED' || course.status === 'REJECTED') && course.rejectedReason && (
                  <div style={{ padding: '0 1rem 0.75rem' }}>
                    <button 
                      onClick={(e) => { e.stopPropagation(); setFeedbackModalCourse(course); }}
                      className="btn btn-secondary"
                      style={{ width: '100%', fontSize: '0.75rem', padding: '0.35rem', background: 'var(--warning-10)', color: 'var(--warning)', border: '1px solid var(--warning-20)' }}
                    >
                      ⚠️ View Admin Feedback
                    </button>
                  </div>
                )}

                <div style={{ display: 'flex', borderTop: '1px solid var(--surface-border)', background: 'rgba(255,255,255,0.02)' }} onClick={(e) => e.stopPropagation()}>
                  <Link href={`/teacher/courses/${course.id}/curriculum`} className="btn btn-ghost" style={{ flex: 1, borderRadius: 0, fontSize: '0.8125rem', padding: '0.5rem', borderRight: '1px solid var(--surface-border)' }}>
                    Curriculum
                  </Link>
                  {course.courseType === 'HYBRID' && (
                    <Link href={`/teacher/courses/${course.id}/sessions`} className="btn btn-ghost" style={{ flex: 1, borderRadius: 0, fontSize: '0.8125rem', padding: '0.5rem', borderRight: '1px solid var(--surface-border)' }}>
                      Sessions
                    </Link>
                  )}
                  <Link href={`/teacher/courses/${course.id}/edit`} className="btn btn-ghost" style={{ flex: 1, borderRadius: 0, fontSize: '0.8125rem', padding: '0.5rem', borderRight: '1px solid var(--surface-border)' }}>
                    Edit
                  </Link>
                  <button onClick={() => handleDelete(course.id, course.title)} className="btn btn-ghost" style={{ flex: 1, borderRadius: 0, fontSize: '0.8125rem', padding: '0.5rem', color: 'var(--error)' }}>
                    Delete
                  </button>
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
