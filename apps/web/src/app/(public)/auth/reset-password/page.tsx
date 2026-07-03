'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { resetPasswordSchema, type ResetPasswordInput, ROUTES } from '@nama/shared';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const emailParam = searchParams.get('email') ?? '';
  const [apiError, setApiError] = useState<string | null>(null);

  const { register, handleSubmit, formState: { errors, isSubmitting } } = useForm<ResetPasswordInput>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { email: emailParam },
  });

  const onSubmit = async (data: ResetPasswordInput) => {
    setApiError(null);
    try {
      await authApi.resetPassword(data);
      router.push(`${ROUTES.LOGIN}?reset=1`);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Reset failed. Try again.');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card glass-card animate-fade-up">
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>🔐</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>Set new password</h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.375rem' }}>
            Enter the code from your email and your new password.
          </p>
        </div>

        {apiError && <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>⚠️ {apiError}</div>}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <input type="hidden" {...register('email')} />

          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="reset-code">Reset code</label>
            <input id="reset-code" type="text" inputMode="numeric" maxLength={6}
              className={`input ${errors.code ? 'error' : ''}`}
              placeholder="000000"
              style={{ fontSize: '1.5rem', letterSpacing: '0.5rem', textAlign: 'center' }}
              {...register('code')} />
            {errors.code && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem', textAlign: 'center' }}>{errors.code.message}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="reset-password">New password</label>
            <input id="reset-password" type="password" autoComplete="new-password"
              className={`input ${errors.newPassword ? 'error' : ''}`}
              placeholder="Min 8 chars, 1 uppercase, 1 digit"
              {...register('newPassword')} />
            {errors.newPassword && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.newPassword.message}</p>}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="label" htmlFor="reset-confirm-password">Confirm new password</label>
            <input id="reset-confirm-password" type="password" autoComplete="new-password"
              className={`input ${errors.confirmPassword ? 'error' : ''}`}
              placeholder="Confirm new password"
              {...register('confirmPassword')} />
            {errors.confirmPassword && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" id="btn-reset" disabled={isSubmitting} className="btn btn-primary btn-full btn-lg">
            {isSubmitting ? <span className="btn-spinner" /> : null}
            {isSubmitting ? 'Resetting…' : 'Reset Password'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.875rem' }}>
          <Link href={ROUTES.LOGIN} style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>← Back to login</Link>
        </p>
      </div>
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="auth-layout">
        <div className="auth-card glass-card animate-fade-up" style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="btn-spinner" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: 'var(--brand-500)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading password reset...</p>
        </div>
      </div>
    }>
      <ResetPasswordContent />
    </Suspense>
  );
}
