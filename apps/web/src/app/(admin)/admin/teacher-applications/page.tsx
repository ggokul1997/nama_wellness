'use client';

import { useState, useEffect } from 'react';
import { teacherApplicationsApi } from '@/lib/api/teacher-applications';
import type { TeacherApplication, TeacherDocument } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { useDialog } from '@/components/providers/DialogProvider';

export default function TeacherApplicationsPage() {
  const [applications, setApplications] = useState<TeacherApplication[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const dialog = useDialog();

  useEffect(() => {
    fetchApplications();
  }, []);

  const fetchApplications = async () => {
    try {
      const res = await teacherApplicationsApi.getPending();
      setApplications(res.data?.applications || []);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch applications'));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, approve: boolean) => {
    const confirmed = await dialog.confirm({ title: 'Confirm', message: `Are you sure you want to ${approve ? 'approve' : 'reject'} this application?` });
    if (!confirmed) return;
    
    let rejectionReason;
    if (!approve) {
      const reason = await dialog.prompt({ 
        title: 'Rejection Reason', 
        message: 'Enter a reason for rejection (optional):',
        placeholder: 'e.g. Incomplete documentation'
      });
      rejectionReason = reason || undefined;
    }

    try {
      await teacherApplicationsApi.reviewApplication(id, { approve, rejectionReason: rejectionReason || undefined });
      setApplications(applications.filter(a => a.id !== id));
    } catch (err: unknown) {
      await dialog.alert({ title: 'Notification', message: getErrorMessage(err, 'Failed to review application') });
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

      {applications.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No pending applications.
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Cards */}
          <div className="hide-desktop" style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {applications.map((app) => (
              <div key={app.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.0625rem' }}>
                      {app.user?.profile?.firstName} {app.user?.profile?.lastName}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                      {app.user?.email}
                    </div>
                  </div>
                  <span className="badge badge-warning" style={{ flexShrink: 0 }}>
                    {app.status}
                  </span>
                </div>
                
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Subject: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{app.teachingSubject || '—'}</span>
                </div>

                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Documents: 
                  <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginTop: '0.25rem' }}>
                    {app.documents?.map((doc: TeacherDocument) => (
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
                    {(!app.documents || app.documents.length === 0) && '—'}
                  </div>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <button 
                    onClick={() => handleReview(app.id, true)}
                    className="btn btn-outline"
                    style={{ flex: 1, textAlign: 'center', justifyContent: 'center', borderColor: 'var(--success)', color: 'var(--success)' }}
                  >
                    Approve
                  </button>
                  <button 
                    onClick={() => handleReview(app.id, false)}
                    className="btn btn-danger"
                    style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Table */}
          <div className="glass-card table-responsive hide-mobile" style={{ flexDirection: 'column' }}>
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
                {applications.map((app) => (
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
                        {app.documents?.map((doc: TeacherDocument) => (
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
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderColor: 'var(--success)', color: 'var(--success)' }}
                      >
                        Approve
                      </button>
                      <button 
                        onClick={() => handleReview(app.id, false)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Reject
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
