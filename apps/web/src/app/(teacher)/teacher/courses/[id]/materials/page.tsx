'use client';

import React, { useState, useEffect, use } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import { useRouter } from 'next/navigation';
import { studyMaterialsApi } from '@/lib/api/study-materials';
import type { StudyMaterial } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function StudyMaterialsPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params as Promise<{ id: string }>);
  const router = useRouter();
  const dialog = useDialog();
  const [materials, setMaterials] = useState<StudyMaterial[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const [title, setTitle] = useState('');

  useEffect(() => {
    fetchMaterials();
  }, [id]);

  const fetchMaterials = async () => {
    try {
      const res = await studyMaterialsApi.getCourseMaterials(id);
      setMaterials(res.data!.materials);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to load materials'));
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (!title.trim()) {
      await dialog.alert({ title: 'Notification', message: 'Please enter a title for the material first.' });
      e.target.value = '';
      return;
    }

    if (file.size > 50 * 1024 * 1024) {
      await dialog.alert({ title: 'Notification', message: 'File size exceeds 50MB limit' });
      e.target.value = '';
      return;
    }

    try {
      setUploading(true);
      setError('');
      setUploadProgress(10);

      // 1. Get presigned URL
      const { data } = await studyMaterialsApi.getUploadUrl(id, file.type, file.size);
      const url = data!.url;
      const fileUrl = data!.fileUrl;
      
      setUploadProgress(30);

      // 2. Upload directly to S3
      const uploadRes = await fetch(url, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type }
      });

      if (!uploadRes.ok) throw new Error('Failed to upload file to S3');
      setUploadProgress(80);

      // 3. Save to DB
      await studyMaterialsApi.create(id, {
        title,
        fileName: file.name,
        fileUrl,
        mimeType: file.type,
        fileSizeBytes: file.size
      });

      setUploadProgress(100);
      setTitle('');
      await fetchMaterials();
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Upload failed'));
    } finally {
      setUploading(false);
      setUploadProgress(0);
      e.target.value = ''; // Reset input
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
        <div>
          <button onClick={() => router.push(`/teacher/courses/${id}/edit`)} className="btn btn-ghost" style={{ padding: 0, marginBottom: '0.5rem' }}>
            ← Back to Course Edit
          </button>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 600 }}>Study Materials</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Upload supplemental documents for your students (PDF, DOCX). Materials require admin approval.</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.125rem', fontWeight: 600, marginBottom: '1rem' }}>Upload New Material</h3>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end' }}>
          <div style={{ flex: 1 }}>
            <label className="label">Title</label>
            <input 
              type="text" 
              className="input" 
              placeholder="e.g. Week 1 Reading Guide"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              disabled={uploading}
            />
          </div>
          <div>
            <label className="btn btn-primary" style={{ cursor: uploading ? 'not-allowed' : 'pointer', opacity: uploading ? 0.7 : 1 }}>
              {uploading ? `Uploading ${uploadProgress}%...` : 'Select & Upload File'}
              <input 
                type="file" 
                onChange={handleFileChange} 
                style={{ display: 'none' }} 
                disabled={uploading}
                accept=".pdf,.doc,.docx,.ppt,.pptx"
              />
            </label>
          </div>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '1rem' }}>
        {materials.length === 0 ? (
          <p style={{ textAlign: 'center', color: 'var(--text-secondary)', padding: '2rem' }}>No study materials uploaded yet.</p>
        ) : (
          <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid var(--surface-border)' }}>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Title</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>File Name</th>
                <th style={{ padding: '1rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Status</th>
              </tr>
            </thead>
            <tbody>
              {materials.map(mat => (
                <tr key={mat.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem', fontWeight: 500 }}>{mat.title}</td>
                  <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{mat.fileName}</td>
                  <td style={{ padding: '1rem' }}>
                    <span className="badge" style={{
                      background: mat.approvalStatus === 'APPROVED' ? 'rgba(16,185,129,0.1)' : 
                                 mat.approvalStatus === 'REJECTED' ? 'rgba(239,68,68,0.1)' : 'rgba(245,158,11,0.1)',
                      color: mat.approvalStatus === 'APPROVED' ? '#10b981' : 
                             mat.approvalStatus === 'REJECTED' ? '#ef4444' : '#f59e0b',
                      padding: '0.25rem 0.5rem',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                      fontWeight: 600
                    }}>
                      {mat.approvalStatus}
                    </span>
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
