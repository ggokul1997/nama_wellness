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
        
        <div style={{ overflowX: 'auto' }}>
          <table className="table" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)', background: 'var(--surface-hover)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Course</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Student</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Price Paid</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 600, fontSize: '0.875rem' }}>Your Cut (70%)</th>
              </tr>
            </thead>
            <tbody>
              {data.recentTransactions.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                    No successful transactions found.
                  </td>
                </tr>
              ) : (
                data.recentTransactions.map((tx) => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)', fontWeight: 500 }}>
                      {tx.courseTitle}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {tx.studentName || tx.studentEmail || 'Anonymous'}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-primary)' }}>
                      {tx.currency} {tx.amount.toFixed(2)}
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--success-500)', fontWeight: 600 }}>
                      + {tx.currency} {tx.teacherCut.toFixed(2)}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
