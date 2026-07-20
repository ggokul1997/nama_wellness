'use client';

import { useState, useEffect } from 'react';
import { payoutsApi } from '@/lib/api/payouts';
import { useDialog } from '@/components/providers/DialogProvider';
import type { Payout } from '@nama/shared';
import Link from 'next/link';

export default function AdminPayouts() {
  const [payouts, setPayouts] = useState<Payout[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);
  const [isGenerating, setIsGenerating] = useState(false);
  const dialog = useDialog();

  const fetchPayouts = async (pageNum: number, status: string) => {
    setIsLoading(true);
    try {
      const response = await payoutsApi.list(pageNum, status);
      if (response.success && response.data) {
        setPayouts(response.data.payouts);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('Failed to load payouts:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPayouts(page, statusFilter);
  }, [page, statusFilter]);

  const handleGenerate = async () => {
    const end = new Date();
    const start = new Date();
    start.setDate(1); // Beginning of current month

    const startStr = start.toISOString().split('T')[0] as string;
    const endStr = end.toISOString().split('T')[0] as string;

    const confirmed = await dialog.confirm({
      title: 'Generate Payouts',
      message: `Are you sure you want to generate payouts from ${startStr} to ${endStr}?`,
    });

    if (!confirmed) return;

    setIsGenerating(true);
    try {
      const res = await payoutsApi.generate({ periodStart: startStr, periodEnd: endStr });
      if (res.success) {
        await dialog.alert({ title: 'Success', message: `Generated ${res.data?.length || 0} new payouts.` });
        fetchPayouts(1, statusFilter);
      }
    } catch (err) {
      await dialog.alert({ title: 'Error', message: 'Failed to generate payouts' });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleMarkPaid = async (payoutId: string) => {
    const confirmed = await dialog.confirm({
      title: 'Mark as Paid',
      message: 'Have you completed the bank transfer for this payout?',
    });

    if (!confirmed) return;

    try {
      const res = await payoutsApi.update(payoutId, { status: 'PAID' });
      if (res.success) {
        setPayouts(payouts.map(p => p.id === payoutId ? { ...p, status: 'PAID' } : p));
      }
    } catch (err) {
      await dialog.alert({ title: 'Error', message: 'Failed to update payout' });
    }
  };

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Teacher Payouts 💸</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>Manage and process revenue share</p>
        </div>
        <button 
          className="btn btn-primary" 
          onClick={handleGenerate}
          disabled={isGenerating}
        >
          {isGenerating ? 'Generating...' : 'Generate New Payouts'}
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
        {['ALL', 'PENDING', 'PROCESSING', 'PAID', 'FAILED'].map(s => (
          <button 
            key={s} 
            className={`btn ${statusFilter === s ? 'btn-primary' : 'btn-ghost'}`}
            onClick={() => { setStatusFilter(s); setPage(1); }}
            style={{ padding: '0.5rem 1rem', fontSize: '0.875rem' }}
          >
            {s}
          </button>
        ))}
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {/* Desktop Table Layout */}
        <div className="table-responsive hide-mobile-block">
          <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border-strong)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Period</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Teacher</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Transactions</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Gross</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Payout (70%)</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
              ) : payouts.length === 0 ? (
                <tr><td colSpan={7} style={{ padding: '2rem', textAlign: 'center' }}>No payouts found.</td></tr>
              ) : (
                payouts.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                      {new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>
                        {p.teacher?.profile?.firstName} {p.teacher?.profile?.lastName}
                      </div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{p.teacher?.email}</div>
                    </td>
                    <td style={{ padding: '1rem' }}>{p.txCount}</td>
                    <td style={{ padding: '1rem' }}>{p.currency} {p.grossRevenue.toLocaleString()}</td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--brand-500)' }}>
                      {p.currency} {p.amount.toLocaleString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.375rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: p.status === 'PAID' ? 'rgba(34, 197, 94, 0.1)' : p.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                        color: p.status === 'PAID' ? '#4ade80' : p.status === 'PENDING' ? '#fbbf24' : '#38bdf8'
                      }}>
                        {p.status}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', display: 'flex', gap: '0.5rem', alignItems: 'center', flexWrap: 'wrap' }}>
                      <Link 
                        href={`/admin/payouts/${p.id}`}
                        className="btn btn-secondary"
                        style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                      >
                        Details
                      </Link>
                      {p.status !== 'PAID' && (
                        <button 
                          className="btn btn-success" 
                          style={{ padding: '0.25rem 0.5rem', fontSize: '0.75rem' }}
                          onClick={() => handleMarkPaid(p.id)}
                        >
                          Mark Paid
                        </button>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="hide-desktop-block" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {isLoading ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>
          ) : payouts.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>No payouts found.</div>
          ) : (
            payouts.map(p => (
              <div key={p.id} style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-raised)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{p.teacher?.profile?.firstName} {p.teacher?.profile?.lastName}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{p.teacher?.email}</div>
                  </div>
                  <span style={{ 
                    padding: '0.25rem 0.5rem', 
                    borderRadius: '0.375rem', 
                    fontSize: '0.75rem', 
                    fontWeight: 600,
                    backgroundColor: p.status === 'PAID' ? 'rgba(34, 197, 94, 0.1)' : p.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                    color: p.status === 'PAID' ? '#4ade80' : p.status === 'PENDING' ? '#fbbf24' : '#38bdf8'
                  }}>
                    {p.status}
                  </span>
                </div>
                
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Period</div>
                    <div>{new Date(p.periodStart).toLocaleDateString()} - {new Date(p.periodEnd).toLocaleDateString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Transactions</div>
                    <div>{p.txCount}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Gross</div>
                    <div>{p.currency} {p.grossRevenue.toLocaleString()}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)' }}>Payout (70%)</div>
                    <div style={{ fontWeight: 600, color: 'var(--brand-500)' }}>{p.currency} {p.amount.toLocaleString()}</div>
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                  <Link 
                    href={`/admin/payouts/${p.id}`}
                    className="btn btn-secondary"
                    style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
                  >
                    Details
                  </Link>
                  {p.status !== 'PAID' && (
                    <button 
                      className="btn btn-success" 
                      style={{ flex: 1, padding: '0.5rem', fontSize: '0.875rem' }}
                      onClick={() => handleMarkPaid(p.id)}
                    >
                      Mark Paid
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', marginTop: '1.5rem' }}>
            <button 
              className="btn btn-outline" 
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            <span style={{ display: 'flex', alignItems: 'center', color: 'var(--text-secondary)' }}>
              Page {page} of {totalPages}
            </span>
            <button 
              className="btn btn-outline" 
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
