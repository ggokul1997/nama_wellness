'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { coursesApi } from '@/lib/api/courses';
import { categoriesApi } from '@/lib/api/categories';
import type { Course, Category } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function PublicCoursesPage() {
  const [courses, setCourses] = useState<Course[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      const [coursesRes, categoriesRes] = await Promise.all([
        coursesApi.getPublicCourses(),
        categoriesApi.getAll(),
      ]);
      setCourses(coursesRes.data?.courses || []);
      setCategories(categoriesRes.data?.categories || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load courses'));
    } finally {
      setLoading(false);
    }
  };

  const filteredCourses = selectedCategory === 'ALL'
    ? courses
    : courses.filter(c => c.categoryId === selectedCategory);

  return (
    <div className="page-content" style={{ minHeight: '100vh' }}>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Hero Section */}
        <div style={{ textAlign: 'center', marginBottom: '4rem' }}>
          <h1 style={{ fontSize: '3rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(90deg, var(--brand-400), var(--brand-600))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Discover Your Next Skill
          </h1>
          <p style={{ fontSize: '1.25rem', color: 'var(--text-secondary)', maxWidth: '600px', margin: '0 auto' }}>
            Explore our curated selection of premium courses taught by industry experts.
          </p>
        </div>

        {/* Filters */}
        <div style={{ display: 'flex', gap: '1rem', marginBottom: '3rem', overflowX: 'auto', paddingBottom: '1rem' }}>
          <button
            onClick={() => setSelectedCategory('ALL')}
            className={`btn ${selectedCategory === 'ALL' ? 'btn-primary' : 'btn-ghost'}`}
            style={{ borderRadius: '2rem', padding: '0.5rem 1.5rem', whiteSpace: 'nowrap' }}
          >
            All Courses
          </button>
          {categories.map(category => (
            <button
              key={category.id}
              onClick={() => setSelectedCategory(category.id)}
              className={`btn ${selectedCategory === category.id ? 'btn-primary' : 'btn-ghost'}`}
              style={{ borderRadius: '2rem', padding: '0.5rem 1.5rem', whiteSpace: 'nowrap' }}
            >
              {category.name}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ textAlign: 'center', padding: '4rem', color: 'var(--text-secondary)' }}>
            Loading amazing courses...
          </div>
        ) : error ? (
          <div className="alert alert-error">{error}</div>
        ) : filteredCourses.length === 0 ? (
          <div className="glass-card" style={{ padding: '6rem 2rem', textAlign: 'center' }}>
            <div style={{ fontSize: '4rem', marginBottom: '1rem' }}>🔍</div>
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: 'var(--text-primary)' }}>No courses found</h3>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>We couldn't find any courses in this category right now.</p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(100%, 260px), 1fr))', gap: '2rem' }}>
            {filteredCourses.map(course => (
              <Link href={`/courses/${course.slug}`} key={course.id} style={{ textDecoration: 'none' }}>
                <div className="glass-card" style={{ height: '100%', display: 'flex', flexDirection: 'column', overflow: 'hidden', cursor: 'pointer', transition: 'transform var(--transition-normal), box-shadow var(--transition-normal)' }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'translateY(-4px)';
                    e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.2)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'translateY(0)';
                    e.currentTarget.style.boxShadow = 'var(--shadow-md)';
                  }}
                >
                  <div style={{ 
                    height: '200px', 
                    background: course.coverImageUrl ? `url(${course.coverImageUrl}) center/cover` : 'linear-gradient(135deg, var(--surface-hover), var(--surface-border))',
                    borderBottom: '1px solid var(--surface-border)',
                  }} />
                  <div style={{ padding: '1.5rem', flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
                      <span className="badge" style={{ background: 'var(--brand-500)', color: 'white', fontSize: '0.75rem' }}>
                        {course.courseType === 'HYBRID' ? 'Hybrid' : 'Pre-Recorded'}
                      </span>
                      {course.category && (
                        <span style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
                          {course.category.name}
                        </span>
                      )}
                    </div>
                    
                    <h3 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.5rem', lineHeight: 1.4 }}>
                      {course.title}
                    </h3>
                    
                    {course.teacher?.profile && (
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                        by {course.teacher.profile.firstName} {course.teacher.profile.lastName}
                      </p>
                    )}

                    <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '1.5rem', display: '-webkit-box', WebkitLineClamp: 3, WebkitBoxOrient: 'vertical', overflow: 'hidden', flex: 1 }}>
                      {course.description}
                    </p>

                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
                      <span style={{ fontSize: '1.25rem', fontWeight: 800, color: 'var(--text-primary)' }}>
                        {course.pricings?.[0] ? `${course.pricings[0].currency} ${course.pricings[0].amount}` : 'Free'}
                      </span>
                      <span className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--brand-400)' }}>
                        View Details →
                      </span>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
