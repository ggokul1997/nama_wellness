'use client';

import { useState, useEffect } from 'react';
import { companiesApi } from '@/lib/api/companies';
import { coursesApi } from '@/lib/api/courses';
import { useRouter } from 'next/navigation';
import { getErrorMessage } from '@/lib/error';
import type { CompanyLicense, Course } from '@nama/shared';

export default function CompanyLicensesPage() {
  const [licenses, setLicenses] = useState<CompanyLicense[]>([]);
  const [availableCourses, setAvailableCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [licensesRes, coursesRes] = await Promise.all([
        companiesApi.getLicenses(),
        coursesApi.getCorporateCourses()
      ]);
      setLicenses(licensesRes.data?.licenses || []);
      setAvailableCourses(coursesRes.data?.courses || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load data'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);
  const router = useRouter();

  const handlePurchase = (courseId: string) => {
    router.push(`/company-admin/checkout/${courseId}`);
  };

  if (loading) {
    return (
      <div className="page-content" style={{ display: 'flex', justifyContent: 'center', padding: '4rem' }}>
        <div style={{ color: 'var(--text-secondary)' }}>Loading licenses...</div>
      </div>
    );
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Licenses</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
          Manage and purchase bulk course licenses for your team.
        </p>
      </div>

      {error && <div className="alert alert-error">{error}</div>}

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Active Licenses</h2>
        
        {licenses.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)', padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', border: '1px dashed var(--surface-border)', textAlign: 'center' }}>
            No licenses purchased yet. Browse available courses below to get started!
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {licenses.map(license => (
              <div key={license.id} style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem',
                padding: '1.5rem', background: 'var(--surface-hover)', borderRadius: '0.5rem',
                border: '1px solid var(--surface-border)'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  {license.course?.coverImageUrl ? (
                    <img src={license.course.coverImageUrl} alt={license.course.title} style={{ width: 64, height: 64, borderRadius: '0.25rem', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: 64, height: 64, borderRadius: '0.25rem', background: 'var(--surface-active)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.5rem' }}>
                      📚
                    </div>
                  )}
                  <div>
                    <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{license.course?.title || 'Unknown Course'}</h3>
                    <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                      Last updated: {new Date(license.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>

                <div style={{ textAlign: 'right', display: 'flex', alignItems: 'center', gap: '2rem' }}>
                  <div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Seats Used</div>
                    <div style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      <span style={{ color: license.usedSeats >= license.totalSeats ? 'var(--error)' : 'inherit' }}>
                        {license.usedSeats}
                      </span>
                      <span style={{ color: 'var(--text-secondary)', fontWeight: 400 }}> / {license.totalSeats}</span>
                    </div>
                  </div>
                  <button onClick={() => handlePurchase(license.courseId)} className="btn btn-secondary btn-sm">
                    Add Seats
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1.5rem' }}>Available Courses</h2>
        
        {availableCourses.length === 0 ? (
          <p style={{ color: 'var(--text-secondary)' }}>No courses available for purchase right now.</p>
        ) : (
          <div className="responsive-grid-3">
            {availableCourses.map(course => (
              <div key={course.id} style={{ display: 'flex', flexDirection: 'column', background: 'var(--surface-hover)', borderRadius: '0.75rem', border: '1px solid var(--surface-border)', overflow: 'hidden' }}>
                <div style={{ height: 160, background: 'var(--surface-active)', position: 'relative' }}>
                  {course.coverImageUrl ? (
                    <img src={course.coverImageUrl} alt={course.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  ) : (
                    <div style={{ width: '100%', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '3rem' }}>
                      🎓
                    </div>
                  )}
                  {course.corporatePrice !== undefined && course.corporatePrice !== null && (
                    <div style={{ position: 'absolute', top: '1rem', right: '1rem', background: 'var(--surface-card)', padding: '0.25rem 0.5rem', borderRadius: '0.25rem', fontSize: '0.875rem', fontWeight: 600 }}>
                      ${course.corporatePrice} / seat
                    </div>
                  )}
                </div>
                
                <div style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', flex: 1 }}>
                  <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.title}
                  </h3>
                  <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {course.description || 'No description available.'}
                  </p>
                  
                  <button 
                    onClick={() => handlePurchase(course.id)} 
                    className="btn btn-primary" 
                    style={{ width: '100%', marginTop: 'auto' }}
                  >
                    Purchase Licenses
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      </div>
  );
}
