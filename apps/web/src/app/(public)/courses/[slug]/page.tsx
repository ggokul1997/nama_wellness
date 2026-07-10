'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import type { Course, CourseModule, Lesson } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { useAuth } from '@/lib/auth/session';
import { enrollmentsApi } from '@/lib/api/enrollments';

export default function PublicCourseDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = React.use(params);
  const router = useRouter();
  const { user, isLoading: authLoading } = useAuth();

  const [course, setCourse] = useState<Course | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [expandedModule, setExpandedModule] = useState<string | null>(null);
  const [isEnrolled, setIsEnrolled] = useState(false);

  useEffect(() => {
    if (slug) fetchCourse();
  }, [slug]);

  // Check enrollment status when user or course changes
  useEffect(() => {
    console.log(`[DEBUG] checkEnrollment effect triggered`, { courseId: course?.id, user: user?.id, authLoading });
    const checkEnrollment = async () => {
      if (course && user) {
        try {
          console.log(`[DEBUG] calling getCourseProgress for course ${course.id}`);
          const res = await enrollmentsApi.getCourseProgress(course.id);
          if (res.data?.enrollment) {
            console.log(`[DEBUG] getCourseProgress success`);
            setIsEnrolled(true);
          } else {
            console.log(`[DEBUG] getCourseProgress returned null`);
            setIsEnrolled(false);
          }
        } catch (e) {
          console.log(`[DEBUG] getCourseProgress failed`, e);
          setIsEnrolled(false);
        }
      } else {
        console.log(`[DEBUG] not checking enrollment, missing course or user`);
        setIsEnrolled(false);
      }
    };
    if (!authLoading) {
      checkEnrollment();
    }
  }, [course, user, authLoading]);

  const fetchCourse = async () => {
    try {
      const res = await coursesApi.getPublicCourseBySlug(slug);
      const fetchedCourse = res.data?.course as Course || null;
      setCourse(fetchedCourse);
      if (fetchedCourse?.modules?.[0]) {
        setExpandedModule(fetchedCourse.modules[0].id);
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load course details'));
    } finally {
      setLoading(false);
    }
  };

  const handleEnroll = () => {
    if (course) {
      if (isEnrolled) {
        router.push(`/student/courses/${course.slug}/learn`);
      } else {
        router.push(`/checkout/${course.id}`);
      }
    }
  };

  if (loading) {
    return <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)' }}>Loading course...</div>;
  }

  if (error || !course) {
    return (
      <div style={{ minHeight: '100vh', padding: '4rem 2rem', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', maxWidth: '600px', width: '100%' }}>
          <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>😞</div>
          <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>Course not found</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>{error || "The course you're looking for doesn't exist or isn't published yet."}</p>
          <button onClick={() => router.push('/courses')} className="btn btn-primary">Browse Catalog</button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <div style={{ 
        position: 'relative',
        padding: '6rem 2rem',
        background: course.coverImageUrl ? `linear-gradient(to bottom, rgba(10,10,10,0.8), var(--bg-default)), url(${course.coverImageUrl}) center/cover` : 'linear-gradient(to bottom, var(--surface-default), var(--bg-default))',
        borderBottom: '1px solid var(--surface-border)'
      }}>
        <div style={{ maxWidth: '1200px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '1.5rem', position: 'relative', zIndex: 10 }}>
          <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
            <span className="badge" style={{ background: 'var(--brand-500)', color: 'white', padding: '0.5rem 1rem', fontSize: '0.875rem' }}>
              {course.courseType}
            </span>
            {course.category && (
              <span style={{ color: 'var(--text-secondary)', fontSize: '1rem', fontWeight: 500 }}>
                {course.category.name}
              </span>
            )}
          </div>
          
          <h1 style={{ fontSize: 'clamp(2.5rem, 5vw, 4rem)', fontWeight: 800, color: 'white', lineHeight: 1.1, maxWidth: '800px' }}>
            {course.title}
          </h1>
          
          <p style={{ fontSize: '1.25rem', color: 'rgba(255,255,255,0.8)', maxWidth: '700px', lineHeight: 1.6 }}>
            {course.description}
          </p>
          
          {course.teacher?.profile && (
            <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', marginTop: '1rem' }}>
              <div style={{ width: '48px', height: '48px', borderRadius: '50%', background: 'var(--brand-500)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', fontWeight: 700, color: 'white' }}>
                {course.teacher.profile.firstName[0]}
              </div>
              <div>
                <p style={{ color: 'white', fontWeight: 600, fontSize: '1.1rem' }}>{course.teacher.profile.firstName} {course.teacher.profile.lastName}</p>
                <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: '0.875rem' }}>Instructor</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Content & Sidebar Layout */}
      <div style={{ maxWidth: '1200px', margin: '0 auto', padding: '4rem 2rem', display: 'grid', gridTemplateColumns: '1fr 350px', gap: '4rem', alignItems: 'start' }}>
        
        {/* Left Column: Curriculum */}
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem', color: 'var(--text-primary)' }}>Curriculum</h2>
          
          {!course.modules || course.modules.length === 0 ? (
            <p style={{ color: 'var(--text-secondary)' }}>Curriculum details are coming soon.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {course.modules.map((module: CourseModule, idx: number) => {
                const isExpanded = expandedModule === module.id;
                return (
                  <div key={module.id} className="glass-card" style={{ overflow: 'hidden' }}>
                    <button 
                      onClick={() => setExpandedModule(isExpanded ? null : module.id)}
                      style={{ 
                        width: '100%', 
                        display: 'flex', 
                        justifyContent: 'space-between', 
                        alignItems: 'center', 
                        padding: '1.5rem', 
                        background: isExpanded ? 'var(--surface-hover)' : 'transparent',
                        border: 'none',
                        color: 'var(--text-primary)',
                        cursor: 'pointer',
                        textAlign: 'left'
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '0.875rem', color: 'var(--brand-400)', fontWeight: 600, marginBottom: '0.25rem' }}>Module {idx + 1}</p>
                        <h3 style={{ fontSize: '1.125rem', fontWeight: 600 }}>{module.title}</h3>
                      </div>
                      <span style={{ fontSize: '1.5rem', color: 'var(--text-muted)', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)', transition: 'transform 0.2s' }}>
                        ↓
                      </span>
                    </button>
                    
                    {isExpanded && (
                      <div style={{ padding: '0 1.5rem 1.5rem 1.5rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
                        {module.description && (
                          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>{module.description}</p>
                        )}
                        
                        {!module.lessons || module.lessons.length === 0 ? (
                          <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem', fontStyle: 'italic' }}>No lessons in this module yet.</p>
                        ) : (
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                            {module.lessons.map((lesson: Lesson, lIdx: number) => (
                              <div key={lesson.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '1rem', padding: '1rem', background: 'var(--surface-default)', borderRadius: 'var(--radius-md)' }}>
                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: 'var(--surface-border)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', color: 'var(--text-secondary)', flexShrink: 0 }}>
                                  {lIdx + 1}
                                </div>
                                <div>
                                  <h4 style={{ color: 'var(--text-primary)', fontWeight: 500, fontSize: '1rem', marginBottom: '0.25rem' }}>{lesson.title}</h4>
                                  <p style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
                                    {lesson.lessonType === 'VIDEO' ? '🎥 Video Lesson' : lesson.lessonType === 'DOCUMENT' ? '📄 Document' : '📝 Text Lesson'}
                                  </p>
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Right Column: Sticky Action Card */}
        <div style={{ position: 'sticky', top: '2rem' }}>
          <div className="glass-card" style={{ padding: '2rem', display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Price</p>
              <h2 style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                {course.pricings?.[0] ? `${course.pricings[0].currency} ${course.pricings[0].amount}` : 'Free'}
              </h2>
            </div>
            
            {(!user || !user.roles.some(r => r.role === 'ADMIN' || r.role === 'TEACHER')) && (
              <button 
                onClick={handleEnroll}
                className="btn btn-primary" 
                style={{ width: '100%', padding: '1rem', fontSize: '1.125rem', fontWeight: 600, display: 'flex', justifyContent: 'center' }}
              >
                {isEnrolled ? 'Start Learning' : 'Enroll Now'}
              </button>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>Format</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{course.courseType}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                <span>Access</span>
                <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>Lifetime</span>
              </div>
            </div>
          </div>
        </div>
        
      </div>
    </div>
  );
}
