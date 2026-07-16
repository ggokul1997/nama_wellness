'use client';

import { useState, useEffect } from 'react';
import { paymentsApi, PopulatedTransaction } from '@/lib/api/payments';
import { getErrorMessage } from '@/lib/error';
import Link from 'next/link';

export default function OrdersPage() {
  const [transactions, setTransactions] = useState<PopulatedTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await paymentsApi.getMyTransactions();
      setTransactions(res.data?.transactions || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch orders'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem' }}>Loading orders...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Order History</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>View and manage your course purchases.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        {transactions.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '3rem 1rem', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>🛍️</div>
            <p>You haven't made any purchases yet.</p>
            <Link href="/courses" className="btn btn-primary" style={{ marginTop: '1rem', display: 'inline-block' }}>
              Browse Courses
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Course</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Date</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Amount</th>
                  <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map(tx => (
                  <tr key={tx.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                    <td style={{ padding: '1rem' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                        {tx.course ? (
                          <>
                            {tx.course.coverImageUrl ? (
                              <img src={tx.course.coverImageUrl} alt={tx.course.title} style={{ width: '60px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} />
                            ) : (
                              <div style={{ width: '60px', height: '40px', background: 'var(--surface-border)', borderRadius: '4px' }} />
                            )}
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{tx.course.title}</span>
                          </>
                        ) : tx.bookingId ? (
                          <>
                            <div style={{ width: '60px', height: '40px', background: 'var(--brand-500)', opacity: 0.8, borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem' }}>🧑‍🏫</div>
                            <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>1-on-1 Session</span>
                          </>
                        ) : (
                          <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Unknown Purchase</span>
                        )}
                      </div>
                    </td>
                    <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                      {new Date(tx.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--text-primary)' }}>
                      {tx.currency} {tx.amount.toString()}
                    </td>
                    <td style={{ padding: '1rem' }}>
                      <span className="badge" style={{ 
                        background: tx.status === 'SUCCESS' ? 'rgba(52,211,153,0.1)' : tx.status === 'PENDING' ? 'rgba(251,191,36,0.1)' : 'rgba(239,68,68,0.1)',
                        color: tx.status === 'SUCCESS' ? 'var(--success)' : tx.status === 'PENDING' ? 'var(--warning)' : 'var(--error)',
                        border: `1px solid ${tx.status === 'SUCCESS' ? 'rgba(52,211,153,0.2)' : tx.status === 'PENDING' ? 'rgba(251,191,36,0.2)' : 'rgba(239,68,68,0.2)'}`
                      }}>
                        {tx.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
