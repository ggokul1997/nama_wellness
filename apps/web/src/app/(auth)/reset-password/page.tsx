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
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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
          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="reset-email">Email address</label>
            <input id="reset-email" type="email" autoComplete="email"
              className={`input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              {...register('email')} />
            {errors.email && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.email.message}</p>}
          </div>

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
            <div style={{ position: 'relative' }}>
              <input id="reset-password" type={showPassword ? "text" : "password"} autoComplete="new-password"
                className={`input ${errors.newPassword ? 'error' : ''}`}
                style={{ paddingRight: '2.5rem' }}
                placeholder="Min 8 chars, 1 uppercase, 1 digit"
                {...register('newPassword')} />
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
            {errors.newPassword && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>{errors.newPassword.message}</p>}
          </div>

          <div style={{ marginBottom: '2rem' }}>
            <label className="label" htmlFor="reset-confirm-password">Confirm new password</label>
            <div style={{ position: 'relative' }}>
              <input id="reset-confirm-password" type={showConfirmPassword ? "text" : "password"} autoComplete="new-password"
                className={`input ${errors.confirmPassword ? 'error' : ''}`}
                style={{ paddingRight: '2.5rem' }}
                placeholder="Confirm new password"
                {...register('confirmPassword')} />
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
