'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { forgotPasswordSchema, type ForgotPasswordInput, ROUTES } from '@nama/shared';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [submitted, setSubmitted] = useState<string | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ForgotPasswordInput>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (data: ForgotPasswordInput) => {
    setApiError(null);
    try {
      await authApi.forgotPassword(data);
      setSubmitted(data.email);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Something went wrong.');
    }
  };

  if (submitted) {
    return (
      <div className="auth-layout">
        <div className="auth-card glass-card animate-fade-up" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Check your email
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            If <strong>{submitted}</strong> is registered, a reset code was sent.{' '}
            <a href="https://ethereal.email/messages" target="_blank" rel="noreferrer" style={{ color: 'var(--brand-400)' }}>
              Open Ethereal ↗
            </a>
          </p>
          <button
            onClick={() => router.push(`${ROUTES.RESET_PASSWORD}?email=${encodeURIComponent(submitted)}`)}
            className="btn btn-primary btn-full"
          >
            Enter reset code
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-layout">
      <div className="auth-card glass-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔑</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Forgot password?</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
            Enter your email and we'll send a reset code.
          </p>
        </div>

        {apiError && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>⚠️ {apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="forgot-email">Email address</label>
            <input id="forgot-email" type="email" autoComplete="email"
              className={`input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com" {...register('email')} />
            {errors.email && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.email.message}</p>}
          </div>
          <button type="submit" id="btn-forgot" disabled={isSubmitting} className="btn btn-primary btn-full btn-lg">
            {isSubmitting ? <span className="btn-spinner" /> : null}
            {isSubmitting ? 'Sending…' : 'Send Reset Code'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <Link href={ROUTES.LOGIN} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}
