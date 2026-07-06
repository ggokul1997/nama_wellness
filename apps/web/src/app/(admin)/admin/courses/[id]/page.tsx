'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import type { Course, CourseModule, CoursePricing } from '@nama/shared';
import Link from 'next/link';
import { getErrorMessage } from '@/lib/error';

export default function AdminReviewCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [course, setCourse] = useState<(Course & { modules?: CourseModule[], pricings?: CoursePricing[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [reviewStatus, setReviewStatus] = useState<'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED'>('APPROVED');
  const [rejectionReason, setRejectionReason] = useState('');
  const [finalPrice, setFinalPrice] = useState<number | ''>('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await coursesApi.adminGetCourse(id);
      const courseData = res.data?.course as Course & { modules?: CourseModule[], pricings?: CoursePricing[] };
      setCourse(courseData || null);
      if (courseData?.pricings?.[0]) {
        setFinalPrice(courseData.pricings[0].amount);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch course'));
    } finally {
      setLoading(false);
    }
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!confirm('Are you sure you want to submit this review?')) return;
    
    setSubmitting(true);
    try {
      await coursesApi.adminReviewCourse(id, {
        status: reviewStatus,
        rejectionReason: reviewStatus !== 'APPROVED' ? rejectionReason : undefined,
        finalPrice: reviewStatus === 'APPROVED' && finalPrice !== '' ? Number(finalPrice) : undefined,
      });
      
      alert('Review submitted successfully!');
      router.push('/admin/courses');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to submit review'));
    } finally {
      setSubmitting(false);
    }
  };

  const handlePublish = async () => {
    if (!confirm('Are you sure you want to publish this course? It will become publicly available.')) return;
    
    try {
      await coursesApi.adminPublishCourse(id);
      alert('Course published successfully!');
      router.push('/admin/courses');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to publish course'));
    }
  };

  if (loading) return <div className="page-content">Loading...</div>;
  if (error || !course) return <div className="page-content alert alert-error">{error || 'Course not found'}</div>;

  const currentPricing = course.pricings?.[0];

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

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href="/admin/courses" className="btn btn-ghost">← Back to Courses</Link>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Review Course</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{course.title}</p>
        </div>
        <div style={{ marginLeft: 'auto' }}>
           <span className={`badge ${getStatusBadgeClass(course.status)}`}>{course.status}</span>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
        {/* Left Column - Details */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Course Details</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Type:</strong>
                <p>{course.courseType}</p>
              </div>
              <div>
                <strong style={{ color: 'var(--text-secondary)' }}>Description:</strong>
                <p style={{ whiteSpace: 'pre-wrap' }}>{course.description}</p>
              </div>
            </div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Curriculum</h2>
            {!course.modules || course.modules.length === 0 ? (
              <p style={{ color: 'var(--text-muted)' }}>No modules added.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {course.modules.map((m, i) => (
                  <div key={m.id} style={{ padding: '1rem', background: 'rgba(255,255,255,0.02)', borderRadius: 'var(--radius-md)', border: '1px solid var(--surface-border)' }}>
                    <h3 style={{ fontWeight: 600 }}>{i + 1}. {m.title}</h3>
                    {m.description && <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{m.description}</p>}
                    
                    <div style={{ marginTop: '1rem', paddingLeft: '1rem', borderLeft: '2px solid var(--surface-border)' }}>
                      {!m.lessons || m.lessons.length === 0 ? (
                        <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>No lessons</p>
                      ) : (
                        m.lessons.map((l, j) => (
                          <div key={l.id} style={{ display: 'flex', justifyContent: 'space-between', padding: '0.5rem 0' }}>
                            <span style={{ fontSize: '0.875rem' }}>{i + 1}.{j + 1} {l.title}</span>
                            <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                              <span style={{ fontSize: '0.75rem', background: 'rgba(139, 92, 246, 0.1)', color: 'var(--brand-400)', padding: '0.1rem 0.4rem', borderRadius: '1rem' }}>{l.lessonType}</span>
                              {l.contentUrl && <a href={l.contentUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.75rem', color: 'var(--brand-400)' }}>View Content</a>}
                            </div>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Review Actions */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Pricing</h2>
            {currentPricing ? (
              <div style={{ padding: '1rem', background: 'rgba(52, 211, 153, 0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(52, 211, 153, 0.2)' }}>
                <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Proposed Price:</p>
                <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--success)' }}>
                  {currentPricing.currency} {currentPricing.amount}
                </p>
              </div>
            ) : (
              <p style={{ color: 'var(--error)' }}>No price proposed!</p>
            )}
          </div>

          <form onSubmit={handleReviewSubmit} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>Review Action</h2>
            
            <div>
              <label className="label">Decision</label>
              <select className="input" value={reviewStatus} onChange={e => setReviewStatus(e.target.value as 'APPROVED' | 'CHANGES_REQUESTED' | 'REJECTED')} required>
                <option value="APPROVED">Approve</option>
                <option value="CHANGES_REQUESTED">Request Changes</option>
                <option value="REJECTED">Reject</option>
              </select>
            </div>

            {reviewStatus === 'APPROVED' && (
              <div>
                <label className="label">Final Price ({currentPricing?.currency || 'INR'})</label>
                <input 
                  type="number" 
                  className="input" 
                  value={finalPrice} 
                  onChange={e => setFinalPrice(e.target.value === '' ? '' : Number(e.target.value))} 
                  required 
                  min="0"
                  step="0.01"
                />
                <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>You can adjust the teacher's proposed price before approving.</p>
              </div>
            )}

            {reviewStatus !== 'APPROVED' && (
              <div>
                <label className="label">Reason / Feedback</label>
                <textarea 
                  className="input" 
                  value={rejectionReason} 
                  onChange={e => setRejectionReason(e.target.value)} 
                  required 
                  rows={4}
                  placeholder="Explain what needs to be changed..."
                />
              </div>
            )}

            <button type="submit" className={`btn ${reviewStatus === 'APPROVED' ? 'btn-primary' : 'btn-secondary'}`} disabled={submitting}>
              {submitting ? 'Submitting...' : 'Submit Review'}
            </button>
          </form>

          {course.status === 'APPROVED' && (
            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Publish Course</h2>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                This course is approved. Ready to make it live for students?
              </p>
              <button onClick={handlePublish} className="btn btn-primary" style={{ width: '100%' }}>
                Publish Now
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
