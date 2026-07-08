'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/lib/auth/session';
import { teacherApplicationsApi } from '@/lib/api/teacher-applications';
import type { TeacherApplication, TeacherDocument, DocumentType } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { FileUpload } from '@/components/ui/FileUpload';

export default function TeacherApplyPage() {
  const { user } = useAuth();
  const [application, setApplication] = useState<TeacherApplication | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [firstName, setFirstName] = useState(user?.profile?.firstName || '');
  const [lastName, setLastName] = useState(user?.profile?.lastName || '');
  const [teachingSubject, setTeachingSubject] = useState('');
  
  const [isReplacingGovId, setIsReplacingGovId] = useState(false);
  const [isReplacingCert, setIsReplacingCert] = useState(false);

  useEffect(() => {
    fetchApplication();
  }, []);

  const fetchApplication = async () => {
    try {
      const res = await teacherApplicationsApi.getMyApplication();
      if (res.data?.application) {
        const app = res.data.application;
        setApplication(app);
        if (app.teachingSubject) {
          setTeachingSubject(prev => prev || app.teachingSubject!);
        }
        if (app.user?.profile?.firstName) {
          setFirstName(prev => prev || app.user!.profile!.firstName!);
        }
        if (app.user?.profile?.lastName) {
          setLastName(prev => prev || app.user!.profile!.lastName!);
        }
      } else {
        const startRes = await teacherApplicationsApi.startApplication();
        setApplication(startRes.data?.application ?? null);
      }
    } catch (err: any) {
      if (err?.status === 401) {
        window.location.href = '/login';
        return;
      }
      setError(getErrorMessage(err, 'Failed to fetch application'));
    } finally {
      setLoading(false);
    }
  };

  const handleCustomUpload = (docType: DocumentType) => async (file: File) => {
    // 1. Get presigned URL
    const { data } = await teacherApplicationsApi.getPresignedUrl({
      applicationId: application!.id,
      documentType: docType,
      mimeType: file.type,
      fileSizeBytes: file.size,
    });

    if (!data) throw new Error('Failed to get upload URL');

    // 2. Upload directly to S3 (LocalStack in dev)
    const uploadRes = await fetch(data.uploadUrl, {
      method: 'PUT',
      body: file,
      headers: {
        'Content-Type': file.type,
      },
    });

    if (!uploadRes.ok) {
      throw new Error('Failed to upload file to S3');
    }

    // Refresh application to show new document
    await fetchApplication();

    return { fileUrl: data.fileUrl };
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !teachingSubject) {
      alert('Please fill out your First Name, Last Name, and Teaching Subject.');
      return;
    }
    
    const govIdDoc = application?.documents?.find((d: TeacherDocument) => d.documentType === 'GOVERNMENT_ID');
    const certDoc = application?.documents?.find((d: TeacherDocument) => d.documentType === 'CERTIFICATION');
    
    if (!govIdDoc || !certDoc) {
      alert('You must upload both a Government ID and a Certification to submit your application.');
      return;
    }

    if (!confirm('Are you ready to submit your application for review?')) return;
    
    try {
      const res = await teacherApplicationsApi.submitApplication(application!.id, {
        firstName,
        lastName,
        teachingSubject,
      });
      setApplication(res.data?.application ?? null);
      alert('Application submitted successfully!');
    } catch (err: unknown) {
      alert(getErrorMessage(err, 'Failed to submit application'));
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your application...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!application) return <div className="alert alert-error">Application not found</div>;

  const isDraft = application?.status === 'DRAFT';
  const govIdDoc = application?.documents?.find((d: TeacherDocument) => d.documentType === 'GOVERNMENT_ID');
  const certDoc = application?.documents?.find((d: TeacherDocument) => d.documentType === 'CERTIFICATION');
  const canSubmit = !!govIdDoc && !!certDoc && !!firstName && !!lastName && !!teachingSubject;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Become a Teacher</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Submit your credentials for review.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '1rem' }}>
          Application Status: <span style={{ color: 'var(--success)' }}>{application.status}</span>
        </h2>
        
        {application.rejectionReason && (
          <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>
            <strong>Reason for rejection:</strong> {application.rejectionReason}
          </div>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
          <div>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>Personal Details</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Tell us about yourself and what you'll teach.</p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1rem' }}>
              <div>
                <label className="label">First Name <span style={{ color: 'var(--error)' }}>*</span></label>
                <input 
                  type="text" 
                  className="input" 
                  value={firstName} 
                  onChange={(e) => setFirstName(e.target.value)} 
                  disabled={!isDraft}
                  placeholder="E.g. Jane"
                />
              </div>
              <div>
                <label className="label">Last Name <span style={{ color: 'var(--error)' }}>*</span></label>
                <input 
                  type="text" 
                  className="input" 
                  value={lastName} 
                  onChange={(e) => setLastName(e.target.value)} 
                  disabled={!isDraft}
                  placeholder="E.g. Doe"
                />
              </div>
            </div>
            <div>
              <label className="label">What will you teach? <span style={{ color: 'var(--error)' }}>*</span></label>
              <input 
                type="text" 
                className="input" 
                value={teachingSubject} 
                onChange={(e) => setTeachingSubject(e.target.value)} 
                disabled={!isDraft}
                placeholder="E.g. Vinyasa Yoga, Acoustic Guitar, Oil Painting"
              />
            </div>
          </div>

          <div style={{ marginTop: '1rem' }}>
            <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>Upload Documents</h3>
            <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
              Upload exactly one Government ID and one Certification. Max 5MB each.
            </p>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Government ID */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>Government ID</h3>
              {govIdDoc && !isReplacingGovId ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(52,211,153,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(52,211,153,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>🪪</div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>Government ID</div>
                      <a href={govIdDoc.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: 'var(--brand-400)', textDecoration: 'none', transition: 'color 0.2s' }}>View document ↗</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>✅</span> Uploaded
                    </div>
                    {isDraft && (
                      <button 
                        onClick={() => setIsReplacingGovId(true)} 
                        className="btn btn-sm" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}
                      >
                        Replace
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <FileUpload
                    label="Government ID (Passport, Driver's License)"
                    accept="image/jpeg,image/png,application/pdf"
                    maxSizeMB={5}
                    customUploadFn={async (file) => {
                      const res = await handleCustomUpload('GOVERNMENT_ID')(file);
                      setIsReplacingGovId(false);
                      return res;
                    }}
                    onUploadSuccess={() => {}}
                  />
                  {govIdDoc && isReplacingGovId && (
                    <button 
                      onClick={() => setIsReplacingGovId(false)} 
                      className="btn btn-sm" 
                      style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.35rem 0.75rem', fontSize: '0.8125rem', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', zIndex: 10 }}
                    >
                      Cancel Replace
                    </button>
                  )}
                </div>
              )}
            </div>
            
            {/* Certification */}
            <div>
              <h3 style={{ fontSize: '1.125rem', fontWeight: 500, color: 'var(--text-primary)' }}>Teaching Certification</h3>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>Upload your teaching certificate or relevant degree.</p>
              
              {certDoc && !isReplacingCert ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '1rem', background: 'rgba(139,92,246,0.1)', borderRadius: 'var(--radius-md)', border: '1px solid rgba(139,92,246,0.2)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ fontSize: '1.5rem' }}>🎓</div>
                    <div>
                      <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{certDoc.fileName || 'Certification Document'}</div>
                      <a href={certDoc.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.875rem', color: 'var(--brand-400)', textDecoration: 'none', transition: 'color 0.2s' }}>View document ↗</a>
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <div style={{ color: 'var(--success)', fontWeight: 500, display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                      <span>✅</span> Uploaded
                    </div>
                    {isDraft && (
                      <button 
                        onClick={() => setIsReplacingCert(true)} 
                        className="btn btn-sm" 
                        style={{ padding: '0.35rem 0.75rem', fontSize: '0.8125rem', background: 'rgba(255,255,255,0.05)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)' }}
                      >
                        Replace
                      </button>
                    )}
                  </div>
                </div>
              ) : (
                <div style={{ position: 'relative' }}>
                  <FileUpload
                    label="Certification Document"
                    accept="image/jpeg,image/png,application/pdf"
                    maxSizeMB={5}
                    customUploadFn={async (file) => {
                      const res = await handleCustomUpload('CERTIFICATION')(file);
                      setIsReplacingCert(false);
                      return res;
                    }}
                    onUploadSuccess={() => {}}
                  />
                  {certDoc && isReplacingCert && (
                    <button 
                      onClick={() => setIsReplacingCert(false)} 
                      className="btn btn-sm" 
                      style={{ position: 'absolute', top: '1rem', right: '1rem', padding: '0.35rem 0.75rem', fontSize: '0.8125rem', background: 'var(--surface-bg)', border: '1px solid var(--surface-border)', color: 'var(--text-secondary)', zIndex: 10 }}
                    >
                      Cancel Replace
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Submit Action */}
            {isDraft && (
              <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'flex-start' }}>
                {!canSubmit && (
                  <div className="alert alert-warning" style={{ fontSize: '0.875rem', padding: '0.75rem', width: '100%' }}>
                    <strong>⚠️ Incomplete Application:</strong> Please complete the following required fields:
                    <ul style={{ margin: '0.5rem 0 0 1.5rem', padding: 0 }}>
                      {!firstName && <li>First Name</li>}
                      {!lastName && <li>Last Name</li>}
                      {!teachingSubject && <li>Teaching Subject</li>}
                      {!govIdDoc && <li>Government ID (Upload)</li>}
                      {!certDoc && <li>Certification (Upload)</li>}
                    </ul>
                  </div>
                )}
                <button 
                  onClick={handleSubmit} 
                  className="btn btn-primary" 
                  disabled={!canSubmit}
                  style={{ background: 'var(--brand-600)' }}
                >
                  Submit Application
                </button>
              </div>
            )}
        </div>
      </div>
    </div>
  );
}
