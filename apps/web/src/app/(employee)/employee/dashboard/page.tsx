'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { enrollmentsApi } from '@/lib/api/enrollments';
import { getErrorMessage } from '@/lib/error';

export default function EmployeeDashboardPage() {
  const [courses, setCourses] = useState<any[]>([]);
  const [availableLicenses, setAvailableLicenses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [enrolling, setEnrolling] = useState<string | null>(null);

  const fetchDashboardData = async () => {
      try {
        const [coursesRes, licensesRes] = await Promise.all([
          enrollmentsApi.getMyCourses(),
          enrollmentsApi.getCompanyAvailableCourses()
        ]);
        setCourses(coursesRes.data?.enrollments || []);
        
        // Filter out licenses for courses the user is already enrolled in
        const enrolledCourseIds = new Set((coursesRes.data?.enrollments || []).map(e => e.enrollment.courseId));
        const available = (licensesRes.data?.licenses || []).filter(l => !enrolledCourseIds.has(l.courseId));
        
        setAvailableLicenses(available);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load your dashboard'));
      } finally {
        setLoading(false);
      }
    };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleEnroll = async (courseId: string) => {
    setEnrolling(courseId);
    setError(null);
    try {
      await enrollmentsApi.enrollViaCompany(courseId);
      await fetchDashboardData(); // Refresh the lists
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to enroll in the course'));
    } finally {
      setEnrolling(null);
    }
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading your courses...</div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Welcome to your Employee Portal</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Access courses assigned to you or browse available company licenses.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '1rem' }}>My Courses</h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {courses.map(({ enrollment, overallProgressPercent }) => (
          <div key={enrollment.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ position: 'relative', height: 160, background: 'var(--surface-active)' }}>
              {enrollment.course.coverImageUrl ? (
                <img src={enrollment.course.coverImageUrl} alt={enrollment.course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  📚
                </div>
              )}
              {overallProgressPercent === 100 && (
                <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--success)', color: 'white', padding: '0.25rem 0.75rem', borderRadius: '1rem', fontSize: '0.75rem', fontWeight: 600 }}>
                  Completed
                </div>
              )}
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {enrollment.course.title}
              </h3>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                  <span>Progress</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{overallProgressPercent}%</span>
                </div>
                <div style={{ width: '100%', height: 6, background: 'var(--surface-border)', borderRadius: 3, overflow: 'hidden', marginBottom: '1rem' }}>
                  <div style={{ height: '100%', background: 'var(--brand-500)', width: `${overallProgressPercent}%`, transition: 'width 0.3s ease' }} />
                </div>
                
                <Link href={`/employee/courses/${enrollment.course.slug}/learn`} className="btn btn-primary btn-full" style={{ textAlign: 'center', display: 'block' }}>
                  {overallProgressPercent === 0 ? 'Start Learning' : overallProgressPercent === 100 ? 'Review Course' : 'Continue Learning'}
                </Link>
              </div>
            </div>
          </div>
        ))}

        {courses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: '1rem', border: '1px dashed var(--surface-border)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🎓</div>
            <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>No courses yet</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem', maxWidth: 400, margin: '0.5rem auto 0' }}>
              You haven't enrolled in any courses. Check the available licenses below!
            </p>
          </div>
        )}
      </div>

      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)', marginTop: '2rem', borderTop: '1px solid var(--surface-border)', paddingTop: '2rem' }}>
        Available from Company
      </h2>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
        {availableLicenses.map((license) => (
          <div key={license.id} className="glass-card" style={{ display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
            <div style={{ height: 160, background: 'var(--surface-active)' }}>
              {license.course.coverImageUrl ? (
                <img src={license.course.coverImageUrl} alt={license.course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              ) : (
                <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                  📚
                </div>
              )}
            </div>
            
            <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                {license.course.title}
              </h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1rem' }}>
                Provided by {license.company.name}
              </p>
              
              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  <span>Remaining Seats</span>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{license.totalSeats - license.usedSeats} / {license.totalSeats}</span>
                </div>
                
                <button 
                  onClick={() => handleEnroll(license.courseId)}
                  disabled={enrolling === license.courseId}
                  className="btn btn-primary btn-full" 
                  style={{ width: '100%' }}
                >
                  {enrolling === license.courseId ? 'Enrolling...' : 'Claim Seat & Enroll'}
                </button>
              </div>
            </div>
          </div>
        ))}

        {availableLicenses.length === 0 && (
          <div style={{ gridColumn: '1 / -1', padding: '3rem', textAlign: 'center', background: 'var(--surface-hover)', borderRadius: '1rem', border: '1px dashed var(--surface-border)' }}>
            <p style={{ color: 'var(--text-secondary)' }}>
              No additional courses available from your company at this time.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
