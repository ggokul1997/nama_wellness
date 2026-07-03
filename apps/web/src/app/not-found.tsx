import Link from 'next/link';
import { ROUTES } from '@nama/shared';

export default function NotFound() {
  return (
    <div
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: '2rem',
        background: 'var(--surface-bg)',
      }}
    >
      <div style={{ fontSize: '6rem', fontWeight: 800, color: 'var(--brand-500)', lineHeight: 1 }}>
        404
      </div>
      <h1 style={{ fontSize: '1.5rem', fontWeight: 600, margin: '1rem 0 0.5rem', color: 'var(--text-primary)' }}>
        Page not found
      </h1>
      <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem' }}>
        The page you're looking for doesn't exist or has been moved.
      </p>
      <Link href={ROUTES.HOME} className="btn btn-primary">
        Back to Home
      </Link>
    </div>
  );
}
