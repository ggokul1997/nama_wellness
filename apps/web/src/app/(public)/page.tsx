'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { ROUTES } from '@nama/shared';
import { categoriesApi } from '@/lib/api/categories';
import type { Category } from '@nama/shared';



const STATS = [
  { value: '500+', label: 'Expert Teachers' },
  { value: '12K+', label: 'Students Enrolled' },
  { value: '200+', label: 'Live Courses' },
  { value: '50+', label: 'Organizations' },
];

export default function LandingPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    categoriesApi.getAll().then(res => {
      setCategories(res.data?.categories || []);
    }).catch(console.error).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <div style={{ minHeight: '100vh', background: 'var(--surface-bg)', overflow: 'hidden' }}>
      {/* Nav */}
      <nav style={{
        position: 'sticky', top: 0, zIndex: 50,
        background: 'rgba(8,8,18,0.85)', backdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--surface-border)',
        padding: '0 1.5rem',
      }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto', height: 64,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: 36, height: 36, borderRadius: '50%',
              background: 'var(--gradient-brand)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '1.1rem', boxShadow: '0 0 16px rgba(139,92,246,0.4)',
            }}>🌿</div>
            <span style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
              Nama <span className="text-gradient">Wellness</span>
            </span>
          </div>
          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link href={ROUTES.LOGIN} className="btn btn-ghost btn-sm">
              Sign in
            </Link>
            <Link href={ROUTES.REGISTER} className="btn btn-primary btn-sm">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section style={{ padding: '6rem 1.5rem 4rem', textAlign: 'center', position: 'relative' }}>
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

          <div style={{ display: 'flex', gap: '1rem', justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href={ROUTES.REGISTER} className="btn btn-primary btn-lg">
              Start Learning Free
            </Link>
            <Link href={ROUTES.LOGIN} className="btn btn-secondary btn-lg">
              I'm a Teacher
            </Link>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section style={{ padding: '3rem 1.5rem', borderTop: '1px solid var(--surface-border)', borderBottom: '1px solid var(--surface-border)' }}>
        <div style={{
          maxWidth: 1280, margin: '0 auto',
          display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
          gap: '2rem', textAlign: 'center',
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
                    <img src={cat.iconUrl} alt={cat.name} style={{ height: '2rem', width: '2rem', objectFit: 'contain' }} />
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
