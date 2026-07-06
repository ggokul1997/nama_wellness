'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { categoriesApi } from '@/lib/api/categories';
import type { Category, Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function CreateCoursePage() {
  const router = useRouter();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseType, setCourseType] = useState('RECORDED');
  const [categoryId, setCategoryId] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  
  const [categories, setCategories] = useState<Category[]>([]);
  const [loadingCats, setLoadingCats] = useState(true);
  
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    categoriesApi.getAll()
      .then(res => setCategories(res.data?.categories || []))
      .catch(err => console.error(err))
      .finally(() => setLoadingCats(false));
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      alert('File size must be less than 1MB.');
      e.target.value = '';
      setCoverFile(null);
      return;
    }
    setCoverFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (title.length < 5) return setError('Title must be at least 5 characters');
    if (description.length < 20) return setError('Description must be at least 20 characters');
    if (!categoryId) return setError('Please select a category');

    setSubmitting(true);
    try {
      // 1. Create the course draft
      const createRes = await coursesApi.createCourse({
        title,
        description,
        courseType: courseType as Course['courseType'],
        categoryId,
      });

      const newCourse = createRes.data?.course;
      if (!newCourse) throw new Error('Failed to create course record');

      // 2. Upload cover image if provided
      if (coverFile) {
        const { data: presigned } = await coursesApi.getPresignedCoverUrl(
          newCourse.id, 
          coverFile.type, 
          coverFile.size
        );
        
        if (presigned) {
          const uploadRes = await fetch(presigned.uploadUrl, {
            method: 'PUT',
            body: coverFile,
            headers: { 'Content-Type': coverFile.type },
          });
          
          if (!uploadRes.ok) {
            console.error('Failed to upload cover image to S3');
            alert('Course created, but cover image upload failed.');
          }
        }
      }

      // Success
      router.push('/teacher/courses');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'An error occurred while creating the course'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create New Course</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Start drafting your new course. You can add lessons and modules later.</p>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
        
        <div>
          <label className="label">Course Title</label>
          <input 
            type="text" 
            className="input" 
            value={title} 
            onChange={e => setTitle(e.target.value)} 
            placeholder="E.g. Advanced Vinyasa Flow"
            required
            minLength={5}
          />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea 
            className="input" 
            value={description} 
            onChange={e => setDescription(e.target.value)} 
            placeholder="Detailed description of what students will learn..."
            rows={5}
            required
            minLength={20}
          />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
          <div>
            <label className="label">Course Type</label>
            <select className="input" value={courseType} onChange={e => setCourseType(e.target.value)} required>
              <option value="RECORDED">Pre-recorded Video</option>
              <option value="LIVE">Live Interactive Classes</option>
              <option value="HYBRID">Hybrid (Live + Recorded)</option>
              <option value="INDIVIDUAL">1-on-1 Individual Sessions</option>
            </select>
          </div>

          <div>
            <label className="label">Category</label>
            <select className="input" value={categoryId} onChange={e => setCategoryId(e.target.value)} required>
              <option value="">-- Select a Category --</option>
              {!loadingCats && categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
            {loadingCats && <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>Loading categories...</div>}
          </div>
        </div>

        <div>
          <label className="label">Cover Image (Optional)</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Max file size: 1MB. Recommended ratio: 16:9</p>
          <div style={{ padding: '1rem', border: '1px dashed var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
            <input 
              type="file" 
              accept="image/*"
              onChange={handleFileChange}
              style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}
            />
          </div>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
          <button type="button" onClick={() => router.push('/teacher/courses')} className="btn btn-ghost" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Course Draft'}
          </button>
        </div>

      </form>
    </div>
  );
}
