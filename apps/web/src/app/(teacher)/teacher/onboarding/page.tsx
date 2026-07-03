'use client';

import { useState, useEffect } from 'react';
import { useAuthStore } from '@/stores/auth.store';
import { teacherApplicationsApi } from '@/lib/api/teacher-applications';

export default function TeacherApplyPage() {
  const { user } = useAuthStore();
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [uploading, setUploading] = useState(false);
  const [firstName, setFirstName] = useState(user?.profile?.firstName || '');
  const [lastName, setLastName] = useState(user?.profile?.lastName || '');
  const [teachingSubject, setTeachingSubject] = useState('');

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
          setTeachingSubject(app.teachingSubject);
        }
        // Pre-fill names from profile if available via the application's user data
        if (app.user?.profile?.firstName) setFirstName(app.user.profile.firstName);
        if (app.user?.profile?.lastName) setLastName(app.user.profile.lastName);
      } else {
        // Start a new draft if none exists
        const startRes = await teacherApplicationsApi.startApplication();
        setApplication(startRes.data?.application);
      }
    } catch (err: any) {
      setError(err.message || 'Failed to fetch application');
    } finally {
      setLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, docType: string) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB.');
      e.target.value = '';
      return;
    }

    setUploading(true);
    try {
      // 1. Get presigned URL
      const { data } = await teacherApplicationsApi.getPresignedUrl({
        applicationId: application.id,
        documentType: docType as any,
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
    } catch (err: any) {
      alert(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async () => {
    if (!firstName || !lastName || !teachingSubject) {
      alert('Please fill out your First Name, Last Name, and Teaching Subject.');
      return;
    }
    
    const govIdDoc = application?.documents?.find((d: any) => d.documentType === 'GOVERNMENT_ID');
    const certDoc = application?.documents?.find((d: any) => d.documentType === 'CERTIFICATION');
    
    if (!govIdDoc || !certDoc) {
      alert('You must upload both a Government ID and a Certification to submit your application.');
      return;
    }

    if (!confirm('Are you ready to submit your application for review?')) return;
    
    try {
      const res = await teacherApplicationsApi.submitApplication(application.id, {
        firstName,
        lastName,
        teachingSubject,
      });
      setApplication(res.data?.application);
      alert('Application submitted successfully!');
    } catch (err: any) {
      alert(err.message || 'Failed to submit application');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading your application...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;

  const isDraft = application?.status === 'DRAFT';
  const govIdDoc = application?.documents?.find((d: any) => d.documentType === 'GOVERNMENT_ID');
  const certDoc = application?.documents?.find((d: any) => d.documentType === 'CERTIFICATION');
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
              Upload exactly one Government ID and one Certification. Max 1MB each.
            </p>
          </div>

          {/* Upload Inputs — show upload or uploaded state per doc type */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
            {/* Government ID */}
            <div style={{ padding: '1rem', border: `1px ${govIdDoc ? 'solid' : 'dashed'} ${govIdDoc ? 'var(--success)' : 'var(--surface-border)'}`, borderRadius: 'var(--radius-lg)', background: govIdDoc ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)' }}>
              <label className="label">Government ID <span style={{ color: 'var(--error)' }}>*</span></label>
              {govIdDoc ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--success)', fontSize: '1.125rem' }}>✅</span>
                    <a href={govIdDoc.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--brand-400)', textDecoration: 'none' }}>
                      Uploaded — View File
                    </a>
                  </div>
                  {isDraft && (
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
                      Replace
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, 'GOVERNMENT_ID')}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <input 
                  type="file" 
                  onChange={(e) => handleFileUpload(e, 'GOVERNMENT_ID')}
                  disabled={!isDraft || uploading}
                  style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                />
              )}
            </div>
            
            {/* Certification */}
            <div style={{ padding: '1rem', border: `1px ${certDoc ? 'solid' : 'dashed'} ${certDoc ? 'var(--success)' : 'var(--surface-border)'}`, borderRadius: 'var(--radius-lg)', background: certDoc ? 'rgba(52,211,153,0.05)' : 'rgba(255,255,255,0.02)' }}>
              <label className="label">Certification / Proof <span style={{ color: 'var(--error)' }}>*</span></label>
              {certDoc ? (
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '0.5rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ color: 'var(--success)', fontSize: '1.125rem' }}>✅</span>
                    <a href={certDoc.fileUrl} target="_blank" rel="noreferrer" style={{ fontSize: '0.8125rem', color: 'var(--brand-400)', textDecoration: 'none' }}>
                      Uploaded — View File
                    </a>
                  </div>
                  {isDraft && (
                    <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', cursor: 'pointer', textDecoration: 'underline' }}>
                      Replace
                      <input 
                        type="file" 
                        onChange={(e) => handleFileUpload(e, 'CERTIFICATION')}
                        disabled={uploading}
                        style={{ display: 'none' }}
                      />
                    </label>
                  )}
                </div>
              ) : (
                <input 
                  type="file" 
                  onChange={(e) => handleFileUpload(e, 'CERTIFICATION')}
                  disabled={!isDraft || uploading}
                  style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
                />
              )}
            </div>
          </div>

          {uploading && <div style={{ fontSize: '0.875rem', color: 'var(--success)' }}>Uploading file...</div>}

          {/* Submit Action */}
          {isDraft && (
            <div style={{ paddingTop: '1.5rem', borderTop: '1px solid var(--surface-border)', display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: '0.75rem' }}>
              {!canSubmit && (
                <p style={{ fontSize: '0.8125rem', color: 'var(--warning)' }}>
                  ⚠️ Please fill out all personal details and upload both a Government ID and a Certification.
                </p>
              )}
              <button
                onClick={handleSubmit}
                disabled={!canSubmit}
                className="btn btn-primary"
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
