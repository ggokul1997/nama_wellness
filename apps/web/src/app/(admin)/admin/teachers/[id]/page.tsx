'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { adminTeachersApi } from '@/lib/api/admin-teachers';
import { useDialog } from '@/components/providers/DialogProvider';
import type { 
  AdminTeacherDetails, 
  AdminTeacherCourse,
  AdminTeacherStudent,
  AdminTeacherReview,
  AdminTeacherPayout 
} from '@nama/shared';
import Link from 'next/link';

export default function AdminTeacherDetailsPage() {
  const { id } = useParams() as { id: string };
  const router = useRouter();
  const dialog = useDialog();
  const [teacher, setTeacher] = useState<AdminTeacherDetails | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('Overview');

  const fetchDetails = useCallback(async () => {
    setIsLoading(true);
    try {
      const res = await adminTeachersApi.getDetails(id);
      if (res.success && res.data) {
        setTeacher(res.data);
      }
    } catch (err) {
      console.error('Failed to load teacher details', err);
    } finally {
      setIsLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  const handleStatusChange = async (newStatus: 'ACTIVE' | 'SUSPENDED') => {
    if (!teacher) return;
    
    const action = newStatus === 'ACTIVE' ? 'activate' : 'suspend';
    const confirmed = await dialog.confirm({
      title: `Confirm ${action}`,
      message: `Are you sure you want to ${action} ${teacher.firstName}?`,
      isDestructive: newStatus === 'SUSPENDED',
      confirmText: newStatus === 'ACTIVE' ? 'Activate' : 'Suspend'
    });

    if (!confirmed) return;

    try {
      const performanceStatus = newStatus === 'ACTIVE' ? 'GOOD_STANDING' : 'SUSPENSION';
      const res = await adminTeachersApi.updateStatus(id, { status: newStatus, performanceStatus });
      if (res.success) {
        await dialog.alert({ title: 'Success', message: `Teacher ${action}d successfully.` });
        fetchDetails();
      }
    } catch (err) {
      await dialog.alert({ title: 'Error', message: `Failed to ${action} teacher.` });
    }
  };

  if (isLoading) {
    return <div className="page-content" style={{ padding: '3rem', textAlign: 'center' }}>Loading teacher details...</div>;
  }

  if (!teacher) {
    return (
      <div className="page-content" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem' }}>Teacher Not Found</h2>
        <button className="btn btn-secondary" onClick={() => router.push('/admin/teachers')}>Back to Directory</button>
      </div>
    );
  }

  const tabs = ['Overview', 'Courses', 'Students', 'Reviews', 'Payouts'];

  return (
    <div className="page-content">
      {/* Back button */}
      <div style={{ marginBottom: '1.5rem' }}>
        <button 
          onClick={() => router.push('/admin/teachers')} 
          style={{ background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem' }}
        >
          ← Back to Teachers
        </button>
      </div>

      {/* Header Profile Card */}
      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem', display: 'flex', flexWrap: 'wrap', gap: '2rem', alignItems: 'center' }}>
        <div style={{ 
          width: '100px', height: '100px', borderRadius: '50%', 
          background: 'var(--surface-sunken)', display: 'flex', 
          alignItems: 'center', justifyContent: 'center', 
          fontSize: '2.5rem', fontWeight: 600, color: 'var(--brand-400)',
          overflow: 'hidden', flexShrink: 0
        }}>
          {teacher.avatarUrl ? (
            <img src={teacher.avatarUrl} alt={teacher.firstName} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            (teacher.firstName?.[0] || teacher.email?.[0] || '?').toUpperCase()
          )}
        </div>
        
        <div style={{ flex: 1, minWidth: '250px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '0.5rem' }}>
            <h1 style={{ margin: 0, fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
              {teacher.firstName} {teacher.lastName}
            </h1>
            <span style={{ 
              padding: '0.25rem 0.75rem', 
              borderRadius: '1rem', 
              fontSize: '0.875rem', 
              fontWeight: 600,
              backgroundColor: teacher.status === 'ACTIVE' ? 'rgba(34, 197, 94, 0.1)' : 'rgba(239, 68, 68, 0.1)',
              color: teacher.status === 'ACTIVE' ? '#4ade80' : '#ef4444'
            }}>
              {teacher.status === 'ACTIVE' ? 'Active' : 'Suspended'}
            </span>
          </div>
          <div style={{ color: 'var(--text-secondary)', fontSize: '1rem', marginBottom: '1rem' }}>
            {teacher.email} • Joined {new Date(teacher.joinedAt).toLocaleDateString()}
          </div>
          
          <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
            {teacher.status === 'ACTIVE' ? (
              <button className="btn btn-outline" style={{ color: '#ef4444', borderColor: '#ef4444' }} onClick={() => handleStatusChange('SUSPENDED')}>
                Suspend Teacher
              </button>
            ) : (
              <button className="btn btn-success" onClick={() => handleStatusChange('ACTIVE')}>
                Activate Teacher
              </button>
            )}
            <Link href={`mailto:${teacher.email}`} className="btn btn-secondary">
              Email Teacher
            </Link>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: '1rem', borderBottom: '1px solid var(--surface-border)', marginBottom: '2rem', flexWrap: 'wrap', paddingBottom: '0.5rem' }}>
        {tabs.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              background: 'none',
              border: 'none',
              padding: '0.5rem 1rem',
              fontSize: '1rem',
              fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? 'var(--brand-400)' : 'var(--text-secondary)',
              borderBottom: activeTab === tab ? '2px solid var(--brand-400)' : '2px solid transparent',
              cursor: 'pointer',
              whiteSpace: 'nowrap'
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-up">
        {activeTab === 'Overview' && (
          <div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem', marginBottom: '2rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Courses</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{teacher.coursesCount}</div>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Students</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)' }}>{teacher.studentsCount}</div>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Revenue</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--brand-500)' }}>₹{teacher.totalRevenue.toLocaleString()}</div>
              </div>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', textTransform: 'uppercase' }}>Earnings (70%)</div>
                <div style={{ fontSize: '2rem', fontWeight: 700, color: '#4ade80' }}>₹{teacher.totalEarnings.toLocaleString()}</div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '1.5rem', marginBottom: '2rem' }}>
              {teacher.bio && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Bio</h3>
                  <p style={{ color: 'var(--text-secondary)', lineHeight: 1.6 }}>{teacher.bio}</p>
                </div>
              )}

              {teacher.specialties.length > 0 && (
                <div className="glass-card" style={{ padding: '1.5rem' }}>
                  <h3 style={{ marginTop: 0, marginBottom: '1rem', color: 'var(--text-primary)' }}>Specialties</h3>
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                    {teacher.specialties.map(spec => (
                      <span key={spec} style={{ background: 'var(--surface)', padding: '0.5rem 1rem', borderRadius: '2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="glass-card" style={{ padding: '1.5rem' }}>
              <h3 style={{ marginTop: 0, marginBottom: '1.5rem', color: 'var(--text-primary)' }}>Recent Enrollments</h3>
              {teacher.recentEnrollments.length === 0 ? (
                <p style={{ color: 'var(--text-secondary)' }}>No recent enrollments found.</p>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                  {teacher.recentEnrollments.map(e => (
                    <div key={e.enrollmentId} style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', padding: '1rem', background: 'var(--surface-raised)', borderRadius: '0.75rem', border: '1px solid var(--surface-border)' }}>
                      <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{e.studentName}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Course: <span style={{ color: 'var(--text-primary)' }}>{e.courseTitle}</span></div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Enrolled: {new Date(e.enrolledAt).toLocaleDateString()}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'Courses' && <CoursesTab teacherId={teacher.userId} />}
        {activeTab === 'Students' && <StudentsTab teacherId={teacher.userId} />}
        {activeTab === 'Reviews' && <ReviewsTab teacherId={teacher.userId} />}
        {activeTab === 'Payouts' && <PayoutsTab teacherId={teacher.userId} />}
      </div>
    </div>
  );
}

// ----------------------------------------------------------------------
// Sub-components for Tabs
// ----------------------------------------------------------------------

function CoursesTab({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<AdminTeacherCourse[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminTeachersApi.getCourses(teacherId)
      .then(res => { if (res.success && res.data) setData(res.data); })
      .finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading courses...</div>;
  if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No courses found.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.5rem' }}>
      {data.map(course => (
        <div key={course.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <h3 style={{ margin: '0 0 0.5rem 0', color: 'var(--text-primary)' }}>{course.title}</h3>
            <span style={{ 
              padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
              background: course.status === 'PUBLISHED' ? 'var(--success-bg)' : 'var(--warning-bg)',
              color: course.status === 'PUBLISHED' ? 'var(--success)' : 'var(--warning)'
            }}>
              {course.status}
            </span>
          </div>
          
          <div style={{ display: 'flex', justifyContent: 'space-between', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Enrollments</div>
              <div style={{ fontWeight: 600 }}>{course.enrollmentsCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Rating</div>
              <div style={{ fontWeight: 600, color: 'var(--brand-400)' }}>★ {course.averageRating}</div>
            </div>
            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Revenue</div>
              <div style={{ fontWeight: 600, color: 'var(--success)' }}>₹{course.revenue.toLocaleString()}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function StudentsTab({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<AdminTeacherStudent[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminTeachersApi.getStudents(teacherId)
      .then(res => { if (res.success && res.data) setData(res.data); })
      .finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading students...</div>;
  if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No students found.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
      {data.map(student => (
        <div key={`${student.userId}-${student.courseTitle}`} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
            <div style={{ width: '3rem', height: '3rem', borderRadius: '50%', background: 'var(--surface-sunken)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem', color: 'var(--brand-400)' }}>
              {student.avatarUrl ? <img src={student.avatarUrl} alt="" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} /> : student.firstName?.[0] || '?'}
            </div>
            <div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600, fontSize: '1.125rem' }}>{student.firstName} {student.lastName}</div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{student.email}</div>
            </div>
          </div>
          
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Course</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)', fontWeight: 500, textAlign: 'right' }}>{student.courseTitle}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Enrolled</span>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>{new Date(student.enrolledAt).toLocaleDateString()}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Status</span>
              <span style={{ 
                padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
                background: student.status === 'COMPLETED' ? 'var(--success-bg)' : 'rgba(59, 130, 246, 0.12)',
                color: student.status === 'COMPLETED' ? 'var(--success)' : 'var(--brand-400)'
              }}>
                {student.status}
              </span>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function ReviewsTab({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<AdminTeacherReview[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminTeachersApi.getReviews(teacherId)
      .then(res => { if (res.success && res.data) setData(res.data); })
      .finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading reviews...</div>;
  if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No reviews found.</div>;

  return (
    <div style={{ display: 'grid', gap: '1rem' }}>
      {data.map(review => (
        <div key={review.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
              <span style={{ color: 'var(--brand-400)', fontSize: '1.25rem' }}>{'★'.repeat(review.rating)}{'☆'.repeat(5 - review.rating)}</span>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{review.studentName}</span>
            </div>
            <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{new Date(review.createdAt).toLocaleDateString()}</span>
          </div>
          <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Course: {review.courseTitle}</div>
          {review.comment && <div style={{ marginTop: '0.5rem', color: 'var(--text-primary)', lineHeight: 1.5 }}>"{review.comment}"</div>}
        </div>
      ))}
    </div>
  );
}

function PayoutsTab({ teacherId }: { teacherId: string }) {
  const [data, setData] = useState<AdminTeacherPayout[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    adminTeachersApi.getPayouts(teacherId)
      .then(res => { if (res.success && res.data) setData(res.data); })
      .finally(() => setLoading(false));
  }, [teacherId]);

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center' }}>Loading payouts...</div>;
  if (data.length === 0) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-secondary)' }}>No payouts found.</div>;

  return (
    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
      {data.map(payout => (
        <div key={payout.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div>
              <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Period</div>
              <div style={{ color: 'var(--text-primary)', fontWeight: 600 }}>
                {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
              </div>
            </div>
            <span style={{ 
              padding: '0.25rem 0.5rem', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 600,
              background: payout.status === 'PAID' ? 'var(--success-bg)' : 'var(--warning-bg)',
              color: payout.status === 'PAID' ? 'var(--success)' : 'var(--warning)'
            }}>
              {payout.status}
            </span>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', borderTop: '1px solid var(--surface-border)', paddingTop: '1rem' }}>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Gross Revenue</div>
              <div style={{ color: 'var(--text-primary)', fontSize: '1.125rem' }}>₹{payout.grossRevenue.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Teacher Payout</div>
              <div style={{ color: 'var(--success)', fontWeight: 600, fontSize: '1.125rem' }}>₹{payout.amount.toLocaleString()}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Transactions</div>
              <div style={{ color: 'var(--text-primary)' }}>{payout.txCount}</div>
            </div>
            <div>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>Processed</div>
              <div style={{ color: 'var(--text-primary)' }}>{payout.processedAt ? new Date(payout.processedAt).toLocaleDateString() : '-'}</div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
