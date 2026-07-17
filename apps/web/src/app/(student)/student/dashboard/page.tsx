'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { enrollmentsApi } from '@/lib/api/enrollments';
import type { MyCourseResponse } from '@nama/shared';

export default function StudentDashboardPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<MyCourseResponse[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    enrollmentsApi.getMyCourses()
      .then(res => setCourses(res.data?.enrollments || []))
      .catch(err => setError(err.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div>Loading your courses...</div>;

  return (
    <div className="page-content">
      <h1 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '2rem' }}>My Learning Dashboard</h1>
      
      {error && <div className="alert alert-error" style={{ marginBottom: '2rem' }}>{error}</div>}

      {courses.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '0.5rem' }}>You haven't enrolled in any courses yet.</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>Explore our catalog and start learning today!</p>
          <button onClick={() => router.push('/courses')} className="btn btn-primary" style={{ background: 'var(--brand-600)' }}>
            Browse Courses
          </button>
        </div>
      ) : (
        <div className="responsive-grid-3">
          {courses.map(({ enrollment, overallProgressPercent, completedLessons, totalLessons }) => {
            const course = enrollment.course!;
            return (
              <div key={enrollment.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
                {course.coverImageUrl ? (
                  <img src={course.coverImageUrl} alt={course.title} style={{ width: '100%', height: '160px', objectFit: 'cover' }} />
                ) : (
                  <div style={{ width: '100%', height: '160px', background: 'rgba(255,255,255,0.05)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span style={{ fontSize: '3rem', opacity: 0.5 }}>📚</span>
                  </div>
                )}
                
                <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '0.25rem' }}>{course.title}</h3>
                  <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    {course.courseType.replace('_', ' ')}
                  </p>

                  <div style={{ marginTop: 'auto' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>
                      <span>{overallProgressPercent}% Complete</span>
                      <span>{completedLessons} / {totalLessons} Lessons</span>
                    </div>
                    <div style={{ width: '100%', height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden', marginBottom: '1.5rem' }}>
                      <div style={{ width: `${overallProgressPercent}%`, height: '100%', background: 'var(--brand-500)', transition: 'width 0.3s ease' }}></div>
                    </div>

                    <button 
                      onClick={() => router.push(`/student/courses/${course.slug}/learn`)} 
                      className="btn btn-primary" 
                      style={{ width: '100%', background: 'var(--brand-600)' }}
                    >
                      {overallProgressPercent === 0 ? 'Start Learning' : 'Continue Learning'}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
