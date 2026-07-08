'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { registerSchema, type RegisterInput, ROUTES } from '@nama/shared';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function RegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterInput>({
    resolver: zodResolver(registerSchema),
    defaultValues: { role: 'STUDENT' },
  });

  const selectedRole = watch('role');

  const onSubmit = async (data: RegisterInput) => {
    setApiError(null);
    try {
      await authApi.register(data);
      setSuccessEmail(data.email);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
    }
  };

  if (successEmail) {
    return (
      <div className="auth-layout">
        <div className="auth-card glass-card animate-fade-up" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>📧</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Check your email
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            We sent a 6-digit verification code to <strong style={{ color: 'var(--text-primary)' }}>{successEmail}</strong>.
            Check your Ethereal inbox at{' '}
            <a href="https://ethereal.email/messages" target="_blank" rel="noreferrer"
              style={{ color: 'var(--brand-400)' }}>
              ethereal.email/messages
            </a>
          </p>
          <button
            onClick={() => router.push(`${ROUTES.VERIFY_EMAIL}?email=${encodeURIComponent(successEmail)}`)}
            className="btn btn-primary btn-full"
          >
            Enter verification code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card glass-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', margin: '0 auto 1rem',
            boxShadow: '0 0 24px rgba(139,92,246,0.4)',
          }}>🌿</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Create your account
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Join Nama Wellness today
          </p>
        </div>

        {/* Role selector */}
        <div style={{
          display: 'grid', gridTemplateColumns: '1fr 1fr',
          gap: '0.75rem', marginBottom: '1.5rem',
        }}>
          {(['STUDENT', 'TEACHER'] as const).map((role) => (
            <label
              key={role}
              style={{
                padding: '0.875rem',
                borderRadius: 'var(--radius-md)',
                border: `2px solid ${selectedRole === role ? 'var(--brand-500)' : 'var(--surface-border)'}`,
                background: selectedRole === role ? 'rgba(139,92,246,0.1)' : 'transparent',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all 0.2s ease',
              }}
            >
              <input type="radio" value={role} {...register('role')} style={{ display: 'none' }} />
              <div style={{ fontSize: '1.25rem', marginBottom: '0.25rem' }}>
                {role === 'STUDENT' ? '🎓' : '🧑‍🏫'}
              </div>
              <div style={{
                fontWeight: 600, fontSize: '0.9rem',
                color: selectedRole === role ? 'var(--brand-300)' : 'var(--text-secondary)',
              }}>
                {role === 'STUDENT' ? 'I want to learn' : 'I want to teach'}
              </div>
            </label>
          ))}
        </div>

        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label className="label" htmlFor="reg-firstName">First name</label>
              <input id="reg-firstName" className={`input ${errors.firstName ? 'error' : ''}`}
                placeholder="First" {...register('firstName')} />
              {errors.firstName && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="reg-lastName">Last name</label>
              <input id="reg-lastName" className={`input ${errors.lastName ? 'error' : ''}`}
                placeholder="Last" {...register('lastName')} />
              {errors.lastName && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="reg-email">Email address</label>
            <input id="reg-email" type="email" autoComplete="email"
              className={`input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com" {...register('email')} />
            {errors.email && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                className={`input ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: '2.5rem' }}
                placeholder="Min 8 chars, 1 uppercase, 1 digit" {...register('password')} />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
                aria-label={showPassword ? "Hide password" : "Show password"}
                title={showPassword ? "Hide password" : "Show password"}
              >
                {showPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            {errors.password && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.password.message}</p>}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="label" htmlFor="reg-confirm-password">Confirm Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
                className={`input ${errors.confirmPassword ? 'error' : ''}`}
                style={{ paddingRight: '2.5rem' }}
                placeholder="Confirm your password" {...register('confirmPassword')} />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute', right: '0.75rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 0
                }}
                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                title={showConfirmPassword ? "Hide password" : "Show password"}
              >
                {showConfirmPassword ? '👁️‍🗨️' : '👁️'}
              </button>
            </div>
            {errors.confirmPassword && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" id="btn-register" disabled={isSubmitting}
            className="btn btn-primary btn-full btn-lg">
            {isSubmitting ? <span className="btn-spinner" /> : null}
            {isSubmitting ? 'Creating account…' : 'Create Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Already have an account?{' '}
          <Link href={ROUTES.LOGIN} style={{ color: 'var(--brand-400)', fontWeight: 600, textDecoration: 'none' }}>
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
