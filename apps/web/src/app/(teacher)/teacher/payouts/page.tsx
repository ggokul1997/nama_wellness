'use client';

import { useState, useEffect } from 'react';
import { payoutsApi } from '@/lib/api/payouts';
import type { Payout } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function TeacherPayoutsPage() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');

  useEffect(() => {
    fetchPayouts();
  }, [statusFilter]);

  const fetchPayouts = async () => {
    try {
      setLoading(true);
      const res = await payoutsApi.myPayouts(1, statusFilter);
      setPayouts(res.data?.payouts || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load payouts'));
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return <span className="badge badge-warning">Pending</span>;
      case 'PROCESSING':
        return <span className="badge badge-info">Processing</span>;
      case 'PAID':
        return <span className="badge badge-success">Paid</span>;
      case 'FAILED':
        return <span className="badge badge-error">Failed</span>;
      default:
        return <span className="badge badge-ghost">{status}</span>;
    }
  };

  const totalPaid = payouts
    .filter(p => p.status === 'PAID')
    .reduce((sum, p) => sum + Number(p.amount), 0);
  
  const totalPending = payouts
    .filter(p => p.status === 'PENDING' || p.status === 'PROCESSING')
    .reduce((sum, p) => sum + Number(p.amount), 0);

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Payouts</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Track your bank transfers and payout history.</p>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.5rem' }}>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--success-500)', background: 'var(--surface-hover)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Total Paid</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            ₹ {totalPaid.toFixed(2)}
          </p>
        </div>
        <div className="glass-card" style={{ padding: '1.5rem', borderLeft: '4px solid var(--warning)', background: 'var(--surface-hover)' }}>
          <h3 style={{ color: 'var(--text-secondary)', fontSize: '0.875rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Pending Transfers</h3>
          <p style={{ fontSize: '2.5rem', fontWeight: 800, color: 'var(--text-primary)', marginTop: '0.5rem' }}>
            ₹ {totalPending.toFixed(2)}
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', background: 'rgba(59, 130, 246, 0.05)', border: '1px solid rgba(59, 130, 246, 0.2)' }}>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-start' }}>
          <div style={{ fontSize: '1.5rem' }}>🏦</div>
          <div>
            <h4 style={{ fontWeight: 600, color: 'var(--brand-400)', marginBottom: '0.25rem' }}>Payout Settings</h4>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Make sure your banking details are up to date in your Profile settings to avoid delays in your transfers. 
              Payouts are usually processed on the 1st and 15th of every month.
            </p>
          </div>
        </div>
      </div>

      <div className="glass-card">
        <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Payout History</h2>
          <select 
            className="input" 
            value={statusFilter} 
            onChange={(e) => setStatusFilter(e.target.value)}
            style={{ width: 'clamp(140px, 30vw, 180px)', padding: '0.5rem' }}
          >
            <option value="ALL">All Statuses</option>
            <option value="PENDING">Pending</option>
            <option value="PROCESSING">Processing</option>
            <option value="PAID">Paid</option>
            <option value="FAILED">Failed</option>
          </select>
        </div>
        
        {error && <div className="alert alert-error" style={{ margin: '1.5rem' }}>{error}</div>}

        <div style={{ padding: '1.5rem' }}>
          {loading ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>Loading payouts...</div>
          ) : payouts.length === 0 ? (
            <div style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '3rem', background: 'var(--surface-hover)', borderRadius: 'var(--radius-lg)' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '1rem' }}>💸</div>
              <p style={{ fontWeight: 500, color: 'var(--text-primary)' }}>No payouts found.</p>
              <p style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>Keep teaching and your payouts will appear here!</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {payouts.map((payout) => (
                <div key={payout.id} style={{ display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1.5rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-base)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                        <h4 style={{ fontWeight: 700, fontSize: '1.125rem', color: 'var(--text-primary)' }}>
                          {payout.currency} {Number(payout.amount).toFixed(2)}
                        </h4>
                        {getStatusBadge(payout.status)}
                      </div>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                        Period: {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
                      </p>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)' }}>
                        {payout.txCount} transaction{payout.txCount !== 1 ? 's' : ''} included
                      </p>
                    </div>
                  </div>
                  
                  {payout.status === 'PAID' && payout.processedAt && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--success)', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <span>✓</span> Processed on {new Date(payout.processedAt).toLocaleString()}
                    </div>
                  )}
                  {payout.notes && (
                    <div style={{ fontSize: '0.8125rem', color: 'var(--text-secondary)', borderTop: '1px solid var(--surface-border)', paddingTop: '0.75rem' }}>
                      <strong>Note:</strong> {payout.notes}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
