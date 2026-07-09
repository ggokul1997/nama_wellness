'use client';

import { useState, useEffect, use } from 'react';
import { enrollmentsApi } from '@/lib/api/enrollments';
import type { Enrollment, Lesson } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { LessonSidebar } from './_components/LessonSidebar';
import { LessonContentArea } from './_components/LessonContentArea';

export default function StudentCourseLearnPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = use(params);
  const [enrollment, setEnrollment] = useState<Enrollment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [activeLesson, setActiveLesson] = useState<Lesson | null>(null);
  const [updating, setUpdating] = useState(false);

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
    </div>
  );
}
