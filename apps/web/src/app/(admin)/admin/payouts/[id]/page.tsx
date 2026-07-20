'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { payoutsApi } from '@/lib/api/payouts';
import { useDialog } from '@/components/providers/DialogProvider';
import type { Payout } from '@nama/shared';
import Link from 'next/link';

export default function PayoutDetails() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const dialog = useDialog();

  const [payout, setPayout] = useState<Payout | null>(null);
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    if (id) {
      fetchData();
    }
  }, [id]);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [payoutRes, txRes] = await Promise.all([
        payoutsApi.get(id),
        payoutsApi.getTransactions(id)
      ]);
      
      if (payoutRes.success && payoutRes.data) {
        setPayout(payoutRes.data);
      }
      if (txRes.success && txRes.data) {
        setTransactions(txRes.data);
      }
    } catch (err) {
      console.error('Failed to fetch payout details', err);
      dialog.alert({ title: 'Error', message: 'Failed to load payout details' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMarkPaid = async () => {
    const confirmed = await dialog.confirm({
      title: 'Mark as Paid',
      message: 'Have you completed the bank transfer for this payout?',
    });

    if (!confirmed) return;

    setIsUpdating(true);
    try {
      const res = await payoutsApi.update(id, { status: 'PAID' });
      if (res.success && res.data) {
        setPayout(res.data);
        dialog.alert({ title: 'Success', message: 'Payout marked as PAID.' });
      }
    } catch (err) {
      dialog.alert({ title: 'Error', message: 'Failed to update payout' });
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDownloadCSV = () => {
    if (transactions.length === 0) return;

    const headers = ['Date', 'Time', 'Student Name', 'Student Email', 'Item Type', 'Item Name', 'Gross Amount (INR)', 'Teacher Cut (INR)'];
    const rows = transactions.map(tx => {
      const date = new Date(tx.createdAt);
      const itemType = tx.course ? 'Course' : 'Booking';
      const itemName = tx.course?.title || `${tx.booking?.pricing?.durationMinutes || 0} min 1-on-1 Session`;
      const cut = Number(tx.amount) * 0.70; // 70% share

      return [
        date.toLocaleDateString(),
        date.toLocaleTimeString(),
        `"${tx.user?.profile?.firstName || ''} ${tx.user?.profile?.lastName || ''}"`,
        tx.user?.email || '',
        itemType,
        `"${itemName}"`,
        tx.amount,
        cut.toFixed(2) // formatting to 2 decimal places
      ];
    });

    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `payout_${id}_transactions.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (isLoading) {
    return <div className="page-content" style={{ padding: '2rem', textAlign: 'center' }}>Loading...</div>;
  }

  if (!payout) {
    return (
      <div className="page-content">
        <h2>Payout not found</h2>
        <button className="btn btn-outline" onClick={() => router.push('/admin/payouts')}>Back to Payouts</button>
      </div>
    );
  }

  return (
    <div className="page-content">
      <div style={{ display: 'flex', gap: '1rem', alignItems: 'center', marginBottom: '2rem', flexWrap: 'wrap' }}>
        <Link href="/admin/payouts" className="btn btn-ghost" style={{ padding: '0.5rem', color: 'var(--text-secondary)' }}>
          ← Back
        </Link>
        <div>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>Payout Details</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
            {new Date(payout.periodStart).toLocaleDateString()} - {new Date(payout.periodEnd).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.5rem' }}>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Teacher</div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginTop: '0.25rem' }}>
              {payout.teacher?.profile?.firstName} {payout.teacher?.profile?.lastName}
            </div>
            <div style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>{payout.teacher?.email}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Total Transactions</div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginTop: '0.25rem' }}>{payout.txCount}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Gross Revenue</div>
            <div style={{ fontWeight: 600, fontSize: '1.125rem', marginTop: '0.25rem' }}>{payout.currency} {payout.grossRevenue.toLocaleString()}</div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Payout Amount (70%)</div>
            <div style={{ fontWeight: 600, fontSize: '1.5rem', marginTop: '0.25rem', color: 'var(--brand-500)' }}>
              {payout.currency} {payout.amount.toLocaleString()}
            </div>
          </div>
          <div>
            <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Status</div>
            <div style={{ marginTop: '0.25rem' }}>
              <span style={{ 
                padding: '0.25rem 0.5rem', 
                borderRadius: '0.375rem', 
                fontSize: '0.75rem', 
                fontWeight: 600,
                backgroundColor: payout.status === 'PAID' ? 'rgba(34, 197, 94, 0.1)' : payout.status === 'PENDING' ? 'rgba(245, 158, 11, 0.1)' : 'rgba(14, 165, 233, 0.1)',
                color: payout.status === 'PAID' ? '#4ade80' : payout.status === 'PENDING' ? '#fbbf24' : '#38bdf8'
              }}>
                {payout.status}
              </span>
            </div>
          </div>
          {payout.status !== 'PAID' && (
            <div style={{ display: 'flex', alignItems: 'center' }}>
              <button className="btn btn-success" onClick={handleMarkPaid} disabled={isUpdating}>
                {isUpdating ? 'Updating...' : 'Mark as Paid'}
              </button>
            </div>
          )}
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '1rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Included Transactions</h2>
        <button className="btn btn-ghost" onClick={handleDownloadCSV} disabled={transactions.length === 0}>
          📥 Download CSV
        </button>
      </div>

      <div className="glass-card" style={{ padding: '1.5rem' }}>
        {/* Desktop Table Layout */}
        <div className="table-responsive hide-mobile-block">
          <table className="data-table" style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border-strong)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Date & Time</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Student</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Item</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Gross Amount</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)' }}>Teacher Cut (70%)</th>
              </tr>
            </thead>
            <tbody>
              {transactions.length === 0 ? (
                <tr><td colSpan={5} style={{ padding: '2rem', textAlign: 'center' }}>No transactions found.</td></tr>
              ) : (
                transactions.map(tx => {
                  const date = new Date(tx.createdAt);
                  const isCourse = !!tx.course;
                  const itemTitle = isCourse ? tx.course.title : `${tx.booking?.pricing?.durationMinutes || 0} min 1-on-1 Session`;
                  const teacherCut = Number(tx.amount) * 0.70;
                  
                  return (
                    <tr key={tx.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div>{date.toLocaleDateString()}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{date.toLocaleTimeString()}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 500 }}>
                          {tx.user?.profile?.firstName} {tx.user?.profile?.lastName}
                        </div>
                        <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tx.user?.email}</div>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 500 }}>{itemTitle}</div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-block', padding: '0.125rem 0.375rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.25rem' }}>
                          {isCourse ? 'Course' : 'Booking'}
                        </div>
                      </td>
                      <td style={{ padding: '1rem' }}>INR {Number(tx.amount).toLocaleString()}</td>
                      <td style={{ padding: '1rem', fontWeight: 600, color: 'var(--brand-400)' }}>
                        INR {teacherCut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Mobile Card Layout */}
        <div className="hide-desktop-block" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {transactions.length === 0 ? (
            <div style={{ padding: '2rem', textAlign: 'center' }}>No transactions found.</div>
          ) : (
            transactions.map(tx => {
              const date = new Date(tx.createdAt);
              const isCourse = !!tx.course;
              const itemTitle = isCourse ? tx.course.title : `${tx.booking?.pricing?.durationMinutes || 0} min 1-on-1 Session`;
              const teacherCut = Number(tx.amount) * 0.70;
              
              return (
                <div key={tx.id} style={{ padding: '1rem', marginBottom: '1rem', border: '1px solid var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'var(--surface-raised)' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ fontWeight: 600 }}>{tx.user?.profile?.firstName} {tx.user?.profile?.lastName}</div>
                      <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>{tx.user?.email}</div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <div style={{ fontSize: '0.875rem' }}>{date.toLocaleDateString()}</div>
                      <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{date.toLocaleTimeString()}</div>
                    </div>
                  </div>
                  
                  <div style={{ marginBottom: '1rem' }}>
                    <div style={{ color: 'var(--text-secondary)', fontSize: '0.875rem' }}>Item</div>
                    <div style={{ fontWeight: 500 }}>{itemTitle}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'inline-block', padding: '0.125rem 0.375rem', background: 'rgba(255,255,255,0.05)', borderRadius: '4px', marginTop: '0.25rem' }}>
                      {isCourse ? 'Course' : 'Booking'}
                    </div>
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', fontSize: '0.875rem' }}>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Gross Amount</div>
                      <div>INR {Number(tx.amount).toLocaleString()}</div>
                    </div>
                    <div>
                      <div style={{ color: 'var(--text-secondary)' }}>Teacher Cut (70%)</div>
                      <div style={{ fontWeight: 600, color: 'var(--brand-400)' }}>
                        INR {teacherCut.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
