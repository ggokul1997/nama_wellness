'use client';

import { useState, Suspense } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { loginSchema, type LoginInput, ROUTES } from '@nama/shared';
import { authApi } from '@/lib/api/auth';
import { useAuth } from '@/lib/auth/session';
import { ApiError } from '@/lib/api/client';

function LoginContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirect = searchParams.get('redirect');
  const { refreshSession } = useAuth();
  const [apiError, setApiError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginInput>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (data: LoginInput) => {
    setApiError(null);
    try {
      const res = await authApi.login(data);
      await refreshSession();
      const user = res.data!.user;

      // Set role cookie for middleware — add Secure flag on HTTPS (production)
      const isSecure = window.location.protocol === 'https:';
      document.cookie = `nama_auth_role=${user.roles[0]?.role ?? ''}; path=/; max-age=${7 * 24 * 3600}; SameSite=Lax${isSecure ? '; Secure' : ''}`;

      // Redirect based on role
      const role = user.roles[0]?.role;
      const dest = redirect ??
        (role === 'ADMIN' ? ROUTES.ADMIN_DASHBOARD
          : role === 'TEACHER' ? ROUTES.TEACHER_DASHBOARD
          : ROUTES.STUDENT_DASHBOARD);

      router.push(dest);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Login failed. Please try again.');
    }
  };

  return (
    <div className="auth-layout">
      <div className="auth-card glass-card animate-fade-up">
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
          <div style={{
            width: 52, height: 52, borderRadius: '50%',
            background: 'var(--gradient-brand)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '1.5rem', margin: '0 auto 1rem',
            boxShadow: '0 0 24px rgba(139,92,246,0.4)',
          }}>🌿</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Welcome back
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Sign in to your Nama Wellness account
          </p>
        </div>

        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="login-email">Email address</label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              className={`input ${errors.email ? 'error' : ''}`}
              placeholder="you@example.com"
              {...register('email')}
            />
            {errors.email && (
              <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                {errors.email.message}
              </p>
            )}
          </div>

          <div style={{ marginBottom: '0.5rem' }}>
            <label className="label" htmlFor="login-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input
                id="login-password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                className={`input ${errors.password ? 'error' : ''}`}
                style={{ paddingRight: '2.5rem' }}
                placeholder="••••••••"
                {...register('password')}
              />
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
            {errors.password && (
              <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.375rem' }}>
                {errors.password.message}
              </p>
            )}
          </div>

          <div style={{ textAlign: 'right', marginBottom: '1.5rem' }}>
            <Link
              href={ROUTES.FORGOT_PASSWORD}
              style={{ fontSize: '0.875rem', color: 'var(--brand-400)', textDecoration: 'none' }}
            >
              Forgot password?
            </Link>
          </div>

          <button
            type="submit"
            id="btn-login"
            disabled={isSubmitting}
            className="btn btn-primary btn-full btn-lg"
          >
            {isSubmitting ? <span className="btn-spinner" /> : null}
            {isSubmitting ? 'Signing in…' : 'Sign in'}
          </button>
        </form>

        <div className="divider" style={{ margin: '1.5rem 0' }}>or</div>

        <p style={{ textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Don't have an account?{' '}
          <Link href={ROUTES.REGISTER} style={{ color: 'var(--brand-400)', fontWeight: 600, textDecoration: 'none' }}>
            Sign up free
          </Link>
        </p>

        <p style={{ textAlign: 'center', marginTop: '0.75rem', color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
          Joining a company?{' '}
          <Link href={ROUTES.REGISTER_CORPORATE} style={{ color: 'var(--brand-400)', fontWeight: 600, textDecoration: 'none' }}>
            Corporate register
          </Link>
        </p>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="auth-layout">
        <div className="auth-card glass-card animate-fade-up" style={{ textAlign: 'center', padding: '3rem' }}>
          <span className="btn-spinner" style={{ width: '2.5rem', height: '2.5rem', border: '3px solid rgba(139,92,246,0.3)', borderTopColor: 'var(--brand-500)' }} />
          <p style={{ marginTop: '1rem', color: 'var(--text-secondary)' }}>Loading login...</p>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  );
}
