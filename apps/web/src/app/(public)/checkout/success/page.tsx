'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import Link from 'next/link';

export default function CheckoutSuccessPage() {
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('session_id');
  const [dots, setDots] = useState('');

  useEffect(() => {
    const interval = setInterval(() => {
      setDots(prev => prev.length >= 3 ? '' : prev + '.');
    }, 500);
    return () => clearInterval(interval);
  }, []);

  if (!sessionId) {
    return (
      <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px' }}>
          <h2 style={{ fontSize: '1.5rem', color: 'var(--error)', marginBottom: '1rem' }}>Invalid Request</h2>
          <p style={{ color: 'var(--text-secondary)' }}>No session ID was provided.</p>
          <Link href="/courses" className="btn btn-primary" style={{ marginTop: '2rem', display: 'inline-block' }}>Browse Courses</Link>
        </div>
      </div>
    );
  }

  return (
    <div style={{ minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="glass-card" style={{ padding: '4rem', textAlign: 'center', maxWidth: '500px' }}>
        <div style={{ fontSize: '4rem', marginBottom: '1rem', color: 'var(--success)' }}>✅</div>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '1rem', color: 'var(--text-primary)' }}>Payment Successful!</h1>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '2rem', fontSize: '1.125rem' }}>
          Thank you for your purchase. We are setting up your course access{dots}
        </p>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <Link href="/student/dashboard" className="btn btn-primary">
            Go to My Dashboard
          </Link>
          <Link href="/student/orders" className="btn" style={{ background: 'var(--surface-border)', color: 'var(--text-secondary)' }}>
            View Order Receipt
          </Link>
        </div>
      </div>
    </div>
  );
}
