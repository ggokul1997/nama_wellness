'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { categoriesApi } from '@/lib/api/categories';
import type { Category } from '@nama/shared';

interface CategoryFormProps {
  initialData?: Category;
}

export default function CategoryForm({ initialData }: CategoryFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const [formData, setFormData] = useState({
    name: initialData?.name || '',
    description: initialData?.description || '',
    iconUrl: initialData?.iconUrl || '',
    sortOrder: initialData?.sortOrder ?? 0,
    isActive: initialData?.isActive ?? true,
  });

  const [uploading, setUploading] = useState(false);

  // Reset form when initialData changes (e.g., navigating from Edit to New)
  useEffect(() => {
    setFormData({
      name: initialData?.name || '',
      description: initialData?.description || '',
      iconUrl: initialData?.iconUrl || '',
      sortOrder: initialData?.sortOrder ?? 0,
      isActive: initialData?.isActive ?? true,
    });
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    if (type === 'checkbox') {
      const checked = (e.target as HTMLInputElement).checked;
      setFormData(prev => ({ ...prev, [name]: checked }));
    } else if (type === 'number') {
      setFormData(prev => ({ ...prev, [name]: parseInt(value, 10) || 0 }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      setError('File size must be under 1MB');
      return;
    }

    setUploading(true);
    setError('');
    
    try {
      // 1. Get presigned URL
      const res = await categoriesApi.getUploadUrl(file.type, file.size);
      if (!res.data) throw new Error('Failed to get upload URL');

      // 2. Upload directly to S3
      const uploadRes = await fetch(res.data.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: {
          'Content-Type': file.type,
        },
      });

      if (!uploadRes.ok) {
        throw new Error('Failed to upload file to S3');
      }

      // Update form with the new icon URL
      setFormData(prev => ({ ...prev, iconUrl: res.data!.fileUrl }));
    } catch (err: any) {
      setError(err.message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (initialData) {
        await categoriesApi.update(initialData.id, formData);
      } else {
        await categoriesApi.create(formData);
      }
      router.push('/admin/categories');
      router.refresh();
    } catch (err: any) {
      setError(err.message || 'An error occurred');
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div>
        <label className="label">Name</label>
        <input
          type="text"
          name="name"
          required
          value={formData.name}
          onChange={handleChange}
          className="input"
          placeholder="e.g. Yoga"
        />
      </div>

      <div>
        <label className="label">Description</label>
        <textarea
          name="description"
          rows={3}
          value={formData.description}
          onChange={handleChange}
          className="input"
          style={{ resize: 'vertical' }}
          placeholder="Brief description of the category..."
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
        <div>
          <label className="label">Icon (Upload or URL)</label>
          <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.5rem' }}>
            <input 
              type="file" 
              accept="image/png, image/jpeg, image/webp, image/svg+xml"
              onChange={handleFileUpload}
              disabled={uploading}
              style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
            />
          </div>
          {uploading && <div style={{ fontSize: '0.75rem', color: 'var(--brand-400)', marginBottom: '0.5rem' }}>Uploading...</div>}
          <input
            type="url"
            name="iconUrl"
            value={formData.iconUrl}
            onChange={handleChange}
            className="input"
            placeholder="https://... or upload above"
            title="Image URL"
          />
          {formData.iconUrl && (
             <div style={{ marginTop: '0.5rem' }}>
               <img 
                 src={formData.iconUrl} 
                 alt="Icon Preview" 
                 style={{ height: '40px', width: '40px', objectFit: 'contain', borderRadius: 'var(--radius-sm)', background: 'var(--surface-bg)' }} 
                 onError={(e) => {
                   // If URL is invalid, hide it or show broken image nicely
                   (e.target as HTMLImageElement).style.display = 'none';
                 }}
                 onLoad={(e) => {
                   (e.target as HTMLImageElement).style.display = 'block';
                 }}
               />
             </div>
          )}
        </div>
        <div>
          <label className="label">Sort Order</label>
          <input
            type="number"
            name="sortOrder"
            value={formData.sortOrder}
            onChange={handleChange}
            className="input"
          />
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', marginTop: '0.5rem' }}>
        <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', color: 'var(--text-primary)', fontWeight: 500 }}>
          <input
            type="checkbox"
            name="isActive"
            checked={formData.isActive}
            onChange={handleChange}
            style={{ width: '1rem', height: '1rem', accentColor: 'var(--brand-500)' }}
          />
          <span>Active (visible to public)</span>
        </label>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', paddingTop: '1rem', borderTop: '1px solid var(--surface-border)' }}>
        <button
          type="button"
          onClick={() => router.push('/admin/categories')}
          className="btn btn-secondary"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="btn btn-primary"
        >
          {loading ? 'Saving...' : initialData ? 'Update Category' : 'Create Category'}
        </button>
      </div>
    </form>
  );
}
