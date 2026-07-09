'use client';

import { useState, useEffect, use } from 'react';
import { enrollmentsApi } from '@/lib/api/enrollments';
import { getErrorMessage } from '@/lib/error';
import type { Enrollment, Lesson } from '@nama/shared';
import { engagementApi } from '@/lib/api/engagement';
import { LessonSidebar } from './_components/LessonSidebar';
import { LessonContentArea } from './_components/LessonContentArea';

export default function StudentCourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [updating, setUpdating] = useState(false);
  // Review state
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');
  const [submittingReview, setSubmittingReview] = useState(false);
  const [reviewError, setReviewError] = useState<string | null>(null);
  const [claimingCert, setClaimingCert] = useState(false);

  useEffect(() => {
    fetchCourseProgress();
  }, [slug]);

  const fetchCourseProgress = async () => {
    try {
      setLoading(true);
      const res = await enrollmentsApi.getCourseProgress(slug);
      setEnrollment(res.data?.enrollment || null);
      
      // Auto-select first lesson if none active
      if (res.data?.enrollment?.course?.modules?.length) {
        const firstModule = res.data.enrollment.course.modules[0];
        if (firstModule && firstModule.lessons && firstModule.lessons.length > 0) {
          setActiveLesson(firstModule.lessons[0] || null);
        }
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleLessonComplete = async () => {
    if (!enrollment || !activeLesson || !enrollment.course) return;

    try {
      setUpdating(true);
      await enrollmentsApi.updateLessonProgress(enrollment.course.id, activeLesson.id, {
        status: 'COMPLETED',
        progressPercent: 100,
      });
      // Refresh to update progress checkmarks
      await fetchCourseProgress();
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to update progress'));
    } finally {
      setUpdating(false);
    }
  };

  const getLessonStatus = (lessonId: string) => {
    if (!enrollment?.progress) return 'NOT_STARTED';
    const progress = enrollment.progress.find(p => p.lessonId === lessonId);
    return progress?.status || 'NOT_STARTED';
  };

  const handleClaimCertificate = async () => {
    if (!enrollment?.course) return;
    try {
      setClaimingCert(true);
      await engagementApi.issueCertificate(enrollment.course.id);
      alert('Certificate claimed successfully! You can view it in your dashboard.');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to claim certificate. Maybe you already have one?'));
    } finally {
      setClaimingCert(false);
    }
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!enrollment?.course) return;
    try {
      setSubmittingReview(true);
      setReviewError(null);
      await engagementApi.createReview({
        courseId: enrollment.course.id,
        rating: reviewRating,
        comment: reviewComment
      });
      setShowReviewModal(false);
      alert('Review submitted successfully!');
    } catch (err: unknown) {
      setReviewError(getErrorMessage(err, 'Failed to submit review'));
    } finally {
      setSubmittingReview(false);
    }
  };



  if (loading) return <div style={{ padding: '2rem' }}>Loading learning environment...</div>;
  if (error || !enrollment || !enrollment.course) return <div className="alert alert-error">{error || 'Course not found'}</div>;

  const { course } = enrollment;

  return (
    <div style={{ display: 'flex', height: '100vh', width: '100vw', overflow: 'hidden', background: 'var(--bg-primary)' }}>
      <LessonSidebar 
        course={course}
        enrollment={enrollment}
        activeLesson={activeLesson}
        onSelectLesson={setActiveLesson}
        getLessonStatus={getLessonStatus}
        onClaimCertificate={handleClaimCertificate}
        onLeaveReview={() => setShowReviewModal(true)}
        claimingCert={claimingCert}
      />

      {/* Main Content Area */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {activeLesson ? (
          <LessonContentArea 
            activeLesson={activeLesson}
            updating={updating}
            onCompleteLesson={handleLessonComplete}
            getLessonStatus={getLessonStatus}
          />
        ) : (
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>
            Select a lesson from the sidebar to begin.
          </div>
        )}
      </main>

      {/* Review Modal */}
      {showReviewModal && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000 }}>
          <div className="glass-card" style={{ width: '100%', maxWidth: '400px', padding: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Leave a Review</h3>
            {reviewError && <div className="alert alert-error" style={{ marginBottom: '1rem' }}>{reviewError}</div>}
            <form onSubmit={handleSubmitReview} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label className="label">Rating (1-5)</label>
                <input type="number" min={1} max={5} value={reviewRating} onChange={e => setReviewRating(Number(e.target.value))} className="input" required />
              </div>
              <div>
                <label className="label">Comment (Optional)</label>
                <textarea rows={4} value={reviewComment} onChange={e => setReviewComment(e.target.value)} className="input" />
              </div>
              <div style={{ display: 'flex', gap: '1rem', marginTop: '1rem' }}>
                <button type="button" onClick={() => setShowReviewModal(false)} className="btn btn-secondary" style={{ flex: 1 }}>Cancel</button>
                <button type="submit" className="btn btn-primary" style={{ flex: 1 }} disabled={submittingReview}>
                  {submittingReview ? 'Submitting...' : 'Submit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
