'use client';

import { useState, useEffect } from 'react';
import { analyticsApi } from '@/lib/api/analytics';
import type { AdminTransaction } from '@nama/shared';

export default function AdminPayments() {
  const [transactions, setTransactions] = useState<AdminTransaction[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [isLoading, setIsLoading] = useState(true);

  const fetchTransactions = async (pageNum: number, status: string) => {
    setIsLoading(true);
    try {
      const response = await analyticsApi.getTransactions(pageNum, status);
      if (response.success && response.data) {
        setTransactions(response.data.transactions);
        setTotal(response.data.total);
      }
    } catch (err) {
      console.error('Failed to load transactions:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions(page, statusFilter);
  }, [page, statusFilter]);

  const totalPages = Math.ceil(total / 20);

  return (
    <div className="page-content">
      <div className="page-header">
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Platform Payments 💳</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>View all incoming transactions</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1rem', marginBottom: '1.5rem', display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
        {['ALL', 'PENDING', 'SUCCESS', 'FAILED', 'REFUNDED'].map(s => (
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
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>ID / Date</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>User</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Product</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Type</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Amount</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>Loading...</td></tr>
              ) : transactions.length === 0 ? (
                <tr><td colSpan={6} style={{ padding: '2rem', textAlign: 'center' }}>No transactions found.</td></tr>
              ) : (
                transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontFamily: 'monospace', fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                        {tx.id.substring(0, 8)}...
                      </div>
                      <div style={{ fontSize: '0.875rem', marginTop: '0.25rem' }}>
                        {new Date(tx.createdAt).toLocaleDateString()}
                      </div>
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ fontWeight: 500 }}>{tx.userName || '—'}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tx.userEmail}</div>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 500 }}>{tx.courseTitle || '—'}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '1rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: tx.type === 'B2B' ? 'rgba(139, 92, 246, 0.1)' : tx.type === 'BOOKING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                        color: tx.type === 'B2B' ? '#a78bfa' : tx.type === 'BOOKING' ? '#fbbf24' : '#38bdf8'
                      }}>
                        {tx.type}
                      </span>
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600 }}>{tx.currency} {tx.amount.toLocaleString()}</td>
                    <td style={{ padding: '1rem' }}>
                      <span style={{ 
                        padding: '0.25rem 0.5rem', 
                        borderRadius: '0.375rem', 
                        fontSize: '0.75rem', 
                        fontWeight: 600,
                        backgroundColor: tx.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.1)' : tx.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                        color: tx.status === 'SUCCESS' ? '#4ade80' : tx.status === 'PENDING' ? '#fbbf24' : '#f87171'
                      }}>
                        {tx.status}
                      </span>
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
          ) : transactions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>No transactions found.</div>
          ) : (
            transactions.map(tx => (
              <div key={tx.id} style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-raised)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                  <div>
                    <div style={{ fontWeight: 600 }}>{tx.userName || '—'}</div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tx.userEmail}</div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{ fontSize: '0.875rem' }}>{new Date(tx.createdAt).toLocaleDateString()}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {tx.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem', fontSize: '0.875rem' }}>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Product</div>
                    <div style={{ fontWeight: 500 }}>{tx.courseTitle || '—'}</div>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Type</div>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '1rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: tx.type === 'B2B' ? 'rgba(139, 92, 246, 0.1)' : tx.type === 'BOOKING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                      color: tx.type === 'B2B' ? '#a78bfa' : tx.type === 'BOOKING' ? '#fbbf24' : '#38bdf8'
                    }}>
                      {tx.type}
                    </span>
                  </div>
                  <div>
                    <div style={{ color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Status</div>
                    <span style={{ 
                      padding: '0.25rem 0.5rem', 
                      borderRadius: '0.375rem', 
                      fontSize: '0.75rem', 
                      fontWeight: 600,
                      backgroundColor: tx.status === 'SUCCESS' ? 'rgba(34, 197, 94, 0.1)' : tx.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(239, 68, 68, 0.1)',
                      color: tx.status === 'SUCCESS' ? '#4ade80' : tx.status === 'PENDING' ? '#fbbf24' : '#f87171'
                    }}>
                      {tx.status}
                    </span>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <div style={{ color: 'var(--text-secondary)' }}>Amount</div>
                    <div style={{ fontWeight: 600, fontSize: '1rem' }}>{tx.currency} {tx.amount.toLocaleString()}</div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Pagination */}
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
