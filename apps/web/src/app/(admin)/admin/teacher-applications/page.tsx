'use client';

import { useState, useEffect } from 'react';
import { teacherApplicationsApi } from '@/lib/api/teacher-applications';

export default function TeacherApplicationsPage() {
  const [applications, setApplications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await teacherApplicationsApi.getPending();
      setApplications(res.data?.applications || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch applications');
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, approve: boolean) => {
    if (!confirm(`Are you sure you want to ${approve ? 'approve' : 'reject'} this application?`)) return;
    
    let rejectionReason;
    if (!approve) {
      rejectionReason = prompt('Reason for rejection (optional):');
    }

    try {
      await teacherApplicationsApi.reviewApplication(id, { approve, rejectionReason: rejectionReason || undefined });
      setApplications(applications.filter(a => a.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to review application');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading applications...</div>;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Teacher Applications</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Review pending applications to teach on the platform.</p>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Applicant</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Subject</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Documents</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {applications.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No pending applications.
                </td>
              </tr>
            ) : (
              applications.map((app: any) => (
                <tr key={app.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                      {app.user?.profile?.firstName} {app.user?.profile?.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      {app.user?.email}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', color: 'var(--text-secondary)' }}>
                    {app.teachingSubject || '—'}
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className="badge badge-warning">
                      {app.status}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      {app.documents?.map((doc: any) => (
                        <a 
                          key={doc.id} 
                          href={doc.fileUrl} 
                          target="_blank" 
                          rel="noreferrer"
                          style={{ fontSize: '0.75rem', color: 'var(--info)', textDecoration: 'none' }}
                        >
                          [{doc.documentType}]
                        </a>
                      ))}
                    </div>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button 
                      onClick={() => handleReview(app.id, true)}
                      style={{ color: 'var(--success)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Approve
                    </button>
                    <button 
                      onClick={() => handleReview(app.id, false)}
                      style={{ color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer', fontWeight: 500 }}
                    >
                      Reject
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
