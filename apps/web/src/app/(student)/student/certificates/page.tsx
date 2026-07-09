'use client';

import { useState, useEffect } from 'react';
import { engagementApi } from '@/lib/api/engagement';
import type { Certificate } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { format } from 'date-fns';

export default function StudentCertificatesPage() {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const res = await engagementApi.getMyCertificates();
        setCertificates(res.data || []);
      } catch (err: unknown) {
        setError(getErrorMessage(err, 'Failed to load certificates'));
      } finally {
        setLoading(false);
      }
    };
    fetchCertificates();
  }, []);

  if (loading) {
    return <div className="page-content text-center color-text-secondary p-8">Loading certificates...</div>;
  }

  if (error) {
    return <div className="page-content alert alert-error">{error}</div>;
  }

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>My Certificates</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>View and download your earned course certificates.</p>
      </div>

      {certificates.length === 0 ? (
        <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
          <div style={{ color: 'var(--text-secondary)' }}>You haven't earned any certificates yet. Complete a course to earn one!</div>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1.5rem' }}>
          {certificates.map((cert) => (
            <div key={cert.id} className="glass-card" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', gap: '1rem', borderTop: '4px solid var(--brand-500)' }}>
              <div>
                <h3 style={{ fontSize: '1.125rem', fontWeight: 600, color: 'var(--text-primary)' }}>{cert.course?.title}</h3>
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>
                  Issued: {format(new Date(cert.issuedAt), 'MMMM d, yyyy')}
                </div>
              </div>

              <div style={{ padding: '1rem', background: 'var(--bg-card-hover)', borderRadius: 'var(--radius-md)', textAlign: 'center' }}>
                <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>🎓</div>
                <div style={{ fontSize: '0.875rem', fontWeight: 500 }}>Certificate of Completion</div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '1rem' }}>
                <button 
                  onClick={() => alert('PDF Generation would happen here in production.')}
                  className="btn btn-outline"
                  style={{ width: '100%' }}
                >
                  Download PDF
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
