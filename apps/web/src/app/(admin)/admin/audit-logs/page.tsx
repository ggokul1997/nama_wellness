"use client";

import { useEffect, useState, useCallback } from 'react';
import { auditLogsApi } from '@/lib/api/audit-logs';
import type { AuditLogEntry, AuditLogEventType } from '@nama/shared';
import { 
  ChartBarIcon, 
  UserPlusIcon, 
  DocumentTextIcon, 
  BookOpenIcon, 
  CurrencyDollarIcon, 
  UserMinusIcon, 
  ComputerDesktopIcon 
} from '@heroicons/react/24/outline';

export default function AdminAuditLogsPage() {
  const [loading, setLoading] = useState(true);
  const [logs, setLogs] = useState<AuditLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [typeFilter, setTypeFilter] = useState('ALL');

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await auditLogsApi.getLogs({
        type: typeFilter !== 'ALL' ? typeFilter : undefined,
        limit: 50
      });
      if (res.success && res.data) {
        setLogs(res.data.events);
      }
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Failed to load audit logs';
      setError(msg);
    } finally {
      setLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const getIconForType = (type: AuditLogEventType) => {
    switch (type) {
      case 'USER_REGISTERED': return <UserPlusIcon style={{ color: 'var(--brand-400)', width: '1.5rem', height: '1.5rem' }} />;
      case 'TEACHER_APPLICATION': return <DocumentTextIcon style={{ color: 'var(--brand-400)', width: '1.5rem', height: '1.5rem' }} />;
      case 'COURSE_PUBLISHED': return <ComputerDesktopIcon style={{ color: 'var(--brand-400)', width: '1.5rem', height: '1.5rem' }} />;
      case 'ENROLLMENT': return <BookOpenIcon style={{ color: 'var(--success-400)', width: '1.5rem', height: '1.5rem' }} />;
      case 'PAYOUT_GENERATED': return <CurrencyDollarIcon style={{ color: 'var(--warning-500)', width: '1.5rem', height: '1.5rem' }} />;
      case 'SUSPENSION': return <UserMinusIcon style={{ color: 'var(--danger-400)', width: '1.5rem', height: '1.5rem' }} />;
      default: return <ChartBarIcon style={{ color: 'var(--text-muted)', width: '1.5rem', height: '1.5rem' }} />;
    }
  };

  const getRelativeTime = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    if (diffInSeconds < 60) return `${diffInSeconds}s ago`;
    if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
    if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
    return `${Math.floor(diffInSeconds / 86400)}d ago`;
  };

  return (
    <div className="page-content">
      <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Audit Logs 📋
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          Platform-wide activity timeline.
        </p>
      </div>

      <div className="glass-card animate-fade-up stagger-1" style={{ padding: '1rem', marginBottom: '2rem', display: 'flex', gap: '0.5rem', overflowX: 'auto', whiteSpace: 'nowrap' }}>
        {['ALL', 'USER_REGISTERED', 'TEACHER_APPLICATION', 'COURSE_PUBLISHED', 'ENROLLMENT', 'PAYOUT_GENERATED', 'SUSPENSION'].map(type => (
          <button
            key={type}
            className={`btn-${typeFilter === type ? 'primary' : 'outline'}`}
            onClick={() => setTypeFilter(type)}
            style={{ padding: '0.5rem 1rem', borderRadius: '20px', fontSize: '0.875rem' }}
          >
            {type.replace('_', ' ')}
          </button>
        ))}
      </div>

      {error ? (
        <div className="glass-card" style={{ padding: '2rem', textAlign: 'center', color: 'var(--danger-400)' }}>
          {error}
        </div>
      ) : loading ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          Loading activity timeline...
        </div>
      ) : logs.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center', color: 'var(--text-secondary)' }}>
          No activity found for this filter.
        </div>
      ) : (
        <div className="animate-fade-up stagger-2" style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {logs.map((log) => (
            <div key={log.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
              
              <div style={{ 
                minWidth: '3rem', height: '3rem', borderRadius: '50%', 
                background: 'var(--bg-card-hover)', 
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1.25rem'
              }}>
                {getIconForType(log.type)}
              </div>
              
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: '1rem', color: 'var(--text-primary)', fontWeight: 500, marginBottom: '0.25rem' }}>
                  {log.description}
                </div>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                  <span style={{ fontWeight: 600 }}>{log.actorName}</span>
                  {log.targetName && (
                    <>
                      <span>→</span>
                      <span style={{ color: 'var(--text-muted)' }}>{log.targetName}</span>
                    </>
                  )}
                </div>
                {log.metadata && (
                  <div style={{ marginTop: '0.5rem', fontSize: '0.75rem', color: 'var(--text-muted)', background: 'var(--bg-card-hover)', padding: '0.5rem', borderRadius: '4px', display: 'inline-block' }}>
                    {JSON.stringify(log.metadata)}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', minWidth: '100px' }}>
                <div style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                  {getRelativeTime(log.timestamp)}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>

            </div>
          ))}
        </div>
      )}
    </div>
  );
}
