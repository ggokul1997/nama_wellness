'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { verifyEmailSchema, type VerifyEmailInput, ROUTES } from '@nama/shared';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

function VerifyEmailContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';
  const [apiError, setApiError] = useState<string | null>(null);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [verifySuccess, setVerifySuccess] = useState(false);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<VerifyEmailInput>({
    resolver: zodResolver(verifyEmailSchema),
    defaultValues: { email: emailParam },
  });

  const onSubmit = async (data: VerifyEmailInput) => {
    setApiError(null);
    try {
      await authApi.verifyEmail(data);
      setVerifySuccess(true);
      setTimeout(() => {
        router.push(`${ROUTES.LOGIN}?verified=1`);
      }, 2000);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Verification failed. Try again.');
    }
  };

  const handleResend = async () => {
    try {
      await authApi.resendVerification(emailParam);
      setResendSuccess(true);
      setTimeout(() => setResendSuccess(false), 5000);
    } catch {}
  };

  return (
    <div className="auth-layout">
      <div className="auth-card glass-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '0.75rem' }}>📬</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Verify your email
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
            Enter the 6-digit code sent to{' '}
            <strong style={{ color: 'var(--text-secondary)' }}>{emailParam || 'your email'}</strong>.
            <br />
            <a href="https://ethereal.email/messages" target="_blank" rel="noreferrer"
              style={{ color: 'var(--brand-400)', fontSize: '0.85rem' }}>
              Open Ethereal inbox ↗
            </a>
          </p>
        </div>

        {apiError && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>⚠️ {apiError}</div>}
        {resendSuccess && <div className="alert alert-success" style={{ marginBottom: '1.25rem' }}>✅ New code sent! Check Ethereal.</div>}

        {verifySuccess ? (
          <div style={{ textAlign: 'center', padding: '2rem 0' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem', color: 'var(--success)' }}>✅</div>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '0.5rem' }}>
              Verified Successfully!
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
              Redirecting you to login...
            </p>
            <span className="btn-spinner" style={{ width: '1.5rem', height: '1.5rem', border: '2px solid rgba(139,92,246,0.3)', borderTopColor: 'var(--brand-500)' }} />
          </div>
        ) : (
          <form onSubmit={handleSubmit(onSubmit)} noValidate>
            <div style={{ marginBottom: '1rem' }}>
              <label className="label" htmlFor="verify-email">Email address</label>
              <input id="verify-email" type="email" autoComplete="email"
                className={`input ${errors.email ? 'error' : ''}`}
                placeholder="you@example.com"
                {...register('email')} />
              {errors.email && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.email.message}</p>}
            </div>
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="label" htmlFor="verify-code">Verification code</label>
              <input
                id="verify-code"
                type="text"
                inputMode="numeric"
                maxLength={6}
                className={`input ${errors.code ? 'error' : ''}`}
                placeholder="000000"
                style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
                {...register('code')}
              />
              {errors.code && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem', textAlign: 'center' }}>{errors.code.message}</p>}
            </div>

            <button type="submit" id="btn-verify" disabled={isSubmitting} className="btn btn-primary btn-full btn-lg">
              {isSubmitting ? <span className="btn-spinner" /> : null}
              {isSubmitting ? 'Verifying…' : 'Verify Email'}
            </button>
          </form>
        )}

        <p style={{ textAlign: 'center', marginTop: '1.5rem', color: 'var(--text-secondary)', fontSize: '0.875rem' }}>
          Didn't receive the code?{' '}
          <button onClick={handleResend} style={{ color: 'var(--brand-400)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
            Resend
          </button>
        </p>
        <p style={{ textAlign: 'center', marginTop: '0.5rem', fontSize: '0.875rem' }}>
          <Link href={ROUTES.LOGIN} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="auth-layout">
        <div className="auth-card glass-card animate-fade-up" style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="btn-spinner" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: 'var(--brand-500)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading verification...</p>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}
