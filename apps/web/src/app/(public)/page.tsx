'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@nama/shared';
import { categoriesApi } from '@/lib/api/categories';
import type { Category } from '@nama/shared';
import { useAuth } from '@/lib/auth/session';



const STATS = [
  { value: '500+', label: 'Expert Teachers' },
  { value: '12K+', label: 'Students Enrolled' },
  { value: '200+', label: 'Live Courses' },
  { value: '50+', label: 'Organizations' },
];

export default function LandingPage() {
  const { user } = useAuth();
  const isAuthenticated = !!user;
  const getActiveRole = () => user?.roles[0]?.role || null;
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);

  const getDashboardRoute = () => {
    switch (getActiveRole()) {
      case 'ADMIN': return ROUTES.ADMIN_DASHBOARD;
      case 'TEACHER': return ROUTES.TEACHER_DASHBOARD;
      case 'COMPANY_ADMIN': return ROUTES.COMPANY_ADMIN_DASHBOARD;
      case 'EMPLOYEE': return ROUTES.EMPLOYEE_DASHBOARD;
      default: return ROUTES.STUDENT_DASHBOARD;
    }
  };
  
  useEffect(() => {
    categoriesApi.getAll().then(res => {
      setCategories(res.data?.categories || []);
    }).catch(console.error).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', overflow: 'hidden' }}>


      {/* Hero */}
      <section className="hero-section" style={{ textAlign: 'center', position: 'relative' }}>
        <div style={{
          position: 'absolute', inset: 0,
          background: 'var(--gradient-hero)', pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 800, margin: '0 auto', position: 'relative' }}>
          <div style={{
            display: 'inline-flex', alignItems: 'center', gap: '0.5rem',
            padding: '0.375rem 1rem', borderRadius: 'var(--radius-full)',
            background: 'rgba(139,92,246,0.12)', border: '1px solid rgba(139,92,246,0.3)',
            fontSize: '0.875rem', color: 'var(--brand-300)', marginBottom: '1.5rem',
          }}>
            <span>✨</span> India's wellness learning platform
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 6vw, 4.5rem)',
            fontWeight: 800, lineHeight: 1.1,
            color: 'var(--text-primary)', marginBottom: '1.5rem',
          }}>
            Learn. Teach.{' '}
            <span className="text-gradient">Thrive.</span>
          </h1>

          <p style={{
            fontSize: 'clamp(1rem, 2vw, 1.25rem)',
            color: 'var(--text-secondary)', lineHeight: 1.7,
            marginBottom: '2.5rem', maxWidth: 600, margin: '0 auto 2.5rem',
          }}>
            A wellness and skill-learning marketplace connecting students with expert teachers
            through live and recorded experiences — yoga, meditation, music, arts, and more.
          </p>

          <div style={{ marginTop: '3rem' }}>
            {isAuthenticated ? (
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <Link href={getDashboardRoute()} className="btn btn-primary btn-lg" style={{ padding: '1rem 3rem' }}>
                  Go to Dashboard
                </Link>
              </div>
            ) : (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem', justifyContent: 'center', textAlign: 'left' }}>
                
                {/* EDPRO Section */}
                <div data-theme="teacher" style={{ background: 'var(--surface-raised)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--brand-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🌟</div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>EDPRO Platform</h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>For individual learners and educators</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <Link href={ROUTES.REGISTER} className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ fontSize: '2rem' }}>🎓</div>
                      <div>
                        <h3 style={{ color: 'var(--text-primary)', fontSize: '1.125rem', marginBottom: '0.125rem' }}>Student</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Login to start learning</p>
                      </div>
                    </Link>
                    <Link href={ROUTES.LOGIN} className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ fontSize: '2rem' }}>🧑‍🏫</div>
                      <div>
                        <h3 style={{ color: 'var(--brand-300)', fontSize: '1.125rem', marginBottom: '0.125rem' }}>Teacher</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Share your knowledge</p>
                      </div>
                    </Link>
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                    <Link href={ROUTES.REGISTER} className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Create EDPRO Account
                    </Link>
                  </div>
                </div>

                {/* Corporate Wellness Section */}
                <div data-theme="company_admin" style={{ background: 'var(--surface-raised)', borderRadius: 'var(--radius-xl)', padding: '2rem', border: '1px solid var(--surface-border)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                    <div style={{ width: '40px', height: '40px', borderRadius: 'var(--radius-md)', background: 'var(--brand-900)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.25rem' }}>🏢</div>
                    <div>
                      <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--text-primary)' }}>Corporate Wellness</h2>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>B2B learning for organizations</p>
                    </div>
                  </div>
                  <div style={{ display: 'grid', gap: '1rem' }}>
                    <Link href={ROUTES.LOGIN} className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ fontSize: '2rem' }}>🛡️</div>
                      <div>
                        <h3 style={{ color: 'var(--brand-500)', fontSize: '1.125rem', marginBottom: '0.125rem' }}>Corporate Admin</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Manage your team</p>
                      </div>
                    </Link>
                    <Link href={ROUTES.LOGIN} className="glass-card" style={{ padding: '1.25rem', textDecoration: 'none', transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', alignItems: 'center', gap: '1rem' }} onMouseEnter={(e) => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-glow)'; }} onMouseLeave={(e) => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}>
                      <div style={{ fontSize: '2rem' }}>💼</div>
                      <div>
                        <h3 style={{ color: 'var(--brand-300)', fontSize: '1.125rem', marginBottom: '0.125rem' }}>Employee</h3>
                        <p style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Access company courses</p>
                      </div>
                    </Link>
                  </div>
                  <div style={{ marginTop: '1.5rem' }}>
                    <Link href="/register/corporate" className="btn btn-primary" style={{ width: '100%', justifyContent: 'center' }}>
                      Create Corporate Account
                    </Link>
                  </div>
                </div>

              </div>
            )}
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '3rem 1.5rem', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)' }}>
        <div className="responsive-grid-4" style={{
          maxWidth: 1280, margin: '0 auto',
          textAlign: 'center',
        }}>
          {STATS.map((s) => (
            <div key={s.label}>
              <div style={{ fontSize: '2.25rem', fontWeight: 800 }} className="text-gradient">
                {s.value}
              </div>
              <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
                {s.label}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Categories */}
      <section style={{ padding: '5rem 1.5rem' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto' }}>
          <h2 style={{
            fontSize: '2rem', fontWeight: 700, textAlign: 'center',
            color: 'var(--text-primary)', marginBottom: '0.75rem',
          }}>
            Explore Categories
          </h2>
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', marginBottom: '3rem' }}>
            Discover courses across wellness, music, arts, and creative learning
          </p>
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
          }}>
            {loading ? (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1', padding: '2rem' }}>
                Loading categories...
              </div>
            ) : categories.length > 0 ? categories.map((cat) => (
              <div
                key={cat.id}
                className="glass-card"
                style={{
                  padding: '1.5rem 1rem', textAlign: 'center', cursor: 'pointer',
                  transition: 'all 0.25s ease',
                }}
              >
                {cat.iconUrl ? (
                  <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '0.5rem' }}>
                    <img 
                      src={cat.iconUrl} 
                      alt={cat.name} 
                      style={{ height: '2rem', width: '2rem', objectFit: 'contain' }}
                      onError={(e) => {
                        e.currentTarget.onerror = null;
                        e.currentTarget.style.display = 'none';
                        const parent = e.currentTarget.parentElement;
                        if (parent) {
                          const fallback = document.createElement('div');
                          fallback.style.fontSize = '2rem';
                          fallback.style.lineHeight = '1';
                          fallback.innerText = '✨';
                          parent.appendChild(fallback);
                        }
                      }}
                    />
                  </div>
                ) : (
                  <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✨</div>
                )}
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.9375rem' }}>
                  {cat.name}
                </div>
              </div>
            )) : (
              <div style={{ textAlign: 'center', color: 'var(--text-muted)', gridColumn: '1 / -1', padding: '2rem' }}>
                No categories available.
              </div>
            )}
          </div>
        </div>
      </section>

      {/* CTA Banner */}
      {!isAuthenticated && (
        <section style={{ padding: '4rem 1.5rem' }}>
          <div style={{
            maxWidth: 900, margin: '0 auto', textAlign: 'center',
            padding: '3rem', borderRadius: 'var(--radius-xl)',
            background: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(99,102,241,0.08))',
            border: '1px solid var(--surface-border-strong)',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <h2 style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '1rem' }}>
              Ready to start your wellness journey?
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
              Join thousands of students and teachers on Nama Wellness.
            </p>
            <Link href={ROUTES.REGISTER} className="btn btn-primary btn-lg">
              Create Free Account
            </Link>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer style={{
        padding: '2rem 1.5rem',
        borderTop: '1px solid var(--surface-border)',
        textAlign: 'center',
        color: 'var(--text-muted)', fontSize: '0.875rem',
      }}>
        © 2026 Nama Wellness. All rights reserved.
      </footer>
    </div>
  );
}
