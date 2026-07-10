'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { corporateRegisterSchema, type CorporateRegisterInput, ROUTES } from '@nama/shared';
import { authApi } from '@/lib/api/auth';
import { ApiError } from '@/lib/api/client';

export default function CorporateRegisterPage() {
  const router = useRouter();
  const [apiError, setApiError] = useState<string | null>(null);
  const [successEmail, setSuccessEmail] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<CorporateRegisterInput>({
    resolver: zodResolver(corporateRegisterSchema),
  });

  const onSubmit = async (data: CorporateRegisterInput) => {
    setApiError(null);
    try {
      await authApi.corporateRegister(data);
      setSuccessEmail(data.email);
    } catch (err) {
      setApiError(err instanceof ApiError ? err.message : 'Registration failed. Please try again.');
    }
  };

  if (successEmail) {
    return (
      <div className="auth-layout">
        <div className="auth-card glass-card animate-fade-up" style={{ textAlign: 'center' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🏢</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, marginBottom: '0.75rem', color: 'var(--text-primary)' }}>
            Company Account Created
          </h1>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
            We sent a 6-digit verification code to <strong style={{ color: 'var(--text-primary)' }}>{successEmail}</strong>.
            Please check your inbox (and spam folder) for the code.
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
          }}>🏢</div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--text-primary)' }}>
            Corporate Registration
          </h1>
          <p style={{ color: 'var(--text-muted)', fontSize: '0.9rem', marginTop: '0.25rem' }}>
            Create an account for your company
          </p>
        </div>

        {apiError && (
          <div className="alert alert-error" style={{ marginBottom: '1.25rem' }}>
            ⚠️ {apiError}
          </div>
        )}

        <form onSubmit={handleSubmit(onSubmit)} noValidate>
          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="reg-companyName">Company Name</label>
            <input id="reg-companyName" className={`input ${errors.companyName ? 'error' : ''}`}
              placeholder="Acme Corp" {...register('companyName')} />
            {errors.companyName && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.companyName.message}</p>}
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem', marginBottom: '1rem' }}>
            <div>
              <label className="label" htmlFor="reg-firstName">Admin First name</label>
              <input id="reg-firstName" className={`input ${errors.firstName ? 'error' : ''}`}
                placeholder="First" {...register('firstName')} />
              {errors.firstName && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.firstName.message}</p>}
            </div>
            <div>
              <label className="label" htmlFor="reg-lastName">Admin Last name</label>
              <input id="reg-lastName" className={`input ${errors.lastName ? 'error' : ''}`}
                placeholder="Last" {...register('lastName')} />
              {errors.lastName && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.lastName.message}</p>}
            </div>
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="reg-email">Work Email</label>
            <input id="reg-email" type="email" className={`input ${errors.email ? 'error' : ''}`}
              placeholder="admin@company.com" {...register('email')} />
            {errors.email && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.email.message}</p>}
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label className="label" htmlFor="reg-password">Password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-password" type={showPassword ? 'text' : 'password'}
                className={`input ${errors.password ? 'error' : ''}`} placeholder="Create a strong password" {...register('password')} />
              <button type="button" onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6,
                }}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.password && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.password.message}</p>}
          </div>

          <div style={{ marginBottom: '1.5rem' }}>
            <label className="label" htmlFor="reg-confirmPassword">Confirm password</label>
            <div style={{ position: 'relative' }}>
              <input id="reg-confirmPassword" type={showConfirmPassword ? 'text' : 'password'}
                className={`input ${errors.confirmPassword ? 'error' : ''}`} placeholder="Repeat password" {...register('confirmPassword')} />
              <button type="button" onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                style={{
                  position: 'absolute', right: '1rem', top: '50%', transform: 'translateY(-50%)',
                  background: 'none', border: 'none', cursor: 'pointer', opacity: 0.6,
                }}>
                {showConfirmPassword ? '👁️' : '👁️‍🗨️'}
              </button>
            </div>
            {errors.confirmPassword && <p style={{ color: 'var(--error)', fontSize: '0.8125rem', marginTop: '0.25rem' }}>{errors.confirmPassword.message}</p>}
          </div>

          <button type="submit" disabled={isSubmitting} className="btn btn-primary btn-full">
            {isSubmitting ? 'Creating Company...' : 'Create Company Account'}
          </button>
        </form>

        <p style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
          Looking for a personal account?{' '}
          <Link href={ROUTES.REGISTER} style={{ color: 'var(--brand-400)', fontWeight: 500, textDecoration: 'none' }}>
            Register here
          </Link>
        </p>
      </div>
    </div>
  );
}
