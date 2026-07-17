'use client';

import { useState, useEffect } from 'react';
import { earningsApi } from '@/lib/api/earnings';
import type { TeacherEarningsSummary } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function TeacherEarningsPage() {
  const [data, setData] = useState<TeacherEarningsSummary | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      setLoading(true);
      const res = await earningsApi.getTeacherEarnings();
      setData(res.data || null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load earnings data'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="p-8 text-center color-text-secondary">Loading earnings data...</div>;
  }

  if (error) {
    return <div className="alert alert-error">{error}</div>;
  }

  if (!data) {
    return <div className="alert alert-warning">No earnings data available yet.</div>;
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Earnings & Payouts</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track your revenue, sales, and transaction history.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--brand-500)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Your Earnings</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {data.currency} {data.totalEarnings.toFixed(2)}
          </p>
        </div>
        
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success-500)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Gross Revenue</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {data.currency} {data.grossRevenue.toFixed(2)}
          </p>
        </div>

        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--info-500)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Sales</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            {data.totalSalesCount}
          </p>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Transaction History</h2>
        </div>
        
        <div style={{ padding: '1.5rem' }}>
          {data.recentTransactions.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
              No successful transactions found.
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {data.recentTransactions.map((tx) => (
                <div key={tx.id} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', padding: '1rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-raised)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div>
                      <h4 style={{ fontWeight: 600, color: 'var(--text-primary)' }}>{tx.courseTitle}</h4>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>{tx.studentName || tx.studentEmail || 'Anonymous'}</p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontWeight: 700, color: 'var(--success-500)' }}>+ {tx.currency} {tx.teacherCut.toFixed(2)}</p>
                      <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Price Paid: {tx.currency} {tx.amount.toFixed(2)}</p>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', borderTop: '1px solid var(--surface-border)', paddingTop: '0.5rem' }}>
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
