'use client';

import { useState, useEffect } from 'react';
import { studyMaterialsApi } from '@/lib/api/study-materials';
import type { StudyMaterial } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { useDialog } from '@/components/providers/DialogProvider';

// Extend the base type to include relations that our API returns for pending materials
type PendingMaterial = StudyMaterial & {
  course: { title: string };
  uploader: { profile: { firstName: string; lastName: string } };
};

export default function AdminStudyMaterialsPage() {
  const [materials, setMaterials] = useState<PendingMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [processing, setProcessing] = useState<string | null>(null);
  const dialog = useDialog();

  useEffect(() => {
    fetchPending();
  }, []);

  const fetchPending = async () => {
    try {
      const res = await studyMaterialsApi.getPending();
      setMaterials(res.data!.materials as PendingMaterial[]);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load materials'));
    } finally {
      setLoading(false);
    }
  };

  const handleReview = async (id: string, status: 'APPROVED' | 'REJECTED') => {
    try {
      setProcessing(id);
      await studyMaterialsApi.review(id, { status });
      await fetchPending();
    } catch (err: unknown) {
      await dialog.alert({ title: 'Notification', message: getErrorMessage(err, 'Failed to review material') });
    } finally {
      setProcessing(null);
    }
  };

  const handleDownload = async (id: string) => {
    try {
      const res = await studyMaterialsApi.getDownloadUrl(id);
      window.open(res.data!.url, '_blank');
    } catch (err: unknown) {
      await dialog.alert({ title: 'Notification', message: getErrorMessage(err, 'Failed to get download link') });
    }
  };

  if (loading) return <div>Loading pending materials...</div>;

  return (
    <div className="page-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Study Materials Review</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Review and approve supplemental materials uploaded by teachers.</p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div className="glass-card table-responsive" style={{ padding: '1rem' }}>
        {materials.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '3rem' }}>
            🎉 No pending study materials to review!
          </p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Material Title</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Course</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Teacher</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(mat => (
                <tr key={mat.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem' }}>
                    <div style={{ fontWeight: 500 }}>{mat.title}</div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-secondary)' }}>{mat.fileName} • {(mat.fileSizeBytes / 1024 / 1024).toFixed(2)} MB</div>
                  </td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{mat.course?.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                    {mat.uploader?.profile?.firstName} {mat.uploader?.profile?.lastName}
                  </td>
                  <td style={{ padding: '1rem', textAlign: 'right' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                      <button 
                        onClick={() => handleDownload(mat.id)}
                        className="btn btn-ghost"
                        style={{ padding: '0.5rem', border: '1px solid var(--surface-border)' }}
                        title="Download / View"
                      >
                        👁️
                      </button>
                      <button 
                        onClick={() => handleReview(mat.id, 'APPROVED')}
                        disabled={processing === mat.id}
                        className="btn btn-primary"
                        style={{ background: 'var(--brand-600)', padding: '0.5rem 1rem' }}
                      >
                        {processing === mat.id ? '...' : 'Approve'}
                      </button>
                      <button 
                        onClick={() => handleReview(mat.id, 'REJECTED')}
                        disabled={processing === mat.id}
                        className="btn btn-ghost"
                        style={{ color: '#ef4444', border: '1px solid rgba(239,68,68,0.2)', padding: '0.5rem 1rem' }}
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
