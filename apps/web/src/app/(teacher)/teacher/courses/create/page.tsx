'use client';

import { useState, useEffect } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { categoriesApi } from '@/lib/api/categories';
import type { Category, Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import Link from 'next/link';

export default function CreateCoursePage() {
  const router = useRouter();
  const dialog = useDialog();
  
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseType, setCourseType] = useState('RECORDED');
  const [categoryId, setCategoryId] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{title?: string, description?: string, categoryId?: string}>({});
  
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

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.size > 1024 * 1024) {
      await dialog.alert({ title: 'Notification', message: 'File size must be less than 1MB.' });
      e.target.value = '';
      setCoverFile(null);
      return;
    }
    setCoverFile(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    let hasError = false;
    const newErrors: {title?: string, description?: string, categoryId?: string} = {};

    if (title.trim().length < 5) {
      newErrors.title = 'Title must be at least 5 characters.';
      hasError = true;
    }
    if (description.trim().length < 20) {
      newErrors.description = 'Description must be at least 20 characters.';
      hasError = true;
    }
    if (!categoryId) {
      newErrors.categoryId = 'Please select a category.';
      hasError = true;
    }

    if (hasError) {
      setFieldErrors(newErrors);
      return;
    }

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
            await dialog.alert({ title: 'Notification', message: 'Course created, but cover image upload failed.' });
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
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap', marginBottom: '2rem' }}>
        <Link href="/teacher/courses" className="btn btn-ghost">← Back to Courses</Link>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Create New Course</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Start drafting your new course. You can add lessons and modules later.</p>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <form noValidate onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>
        
        <div>
          <label className="label">Course Title</label>
          <input 
            type="text" 
            className="input" 
            value={title} 
            onChange={e => { setTitle(e.target.value); setFieldErrors(p => ({ ...p, title: undefined })); }} 
            placeholder="E.g. Advanced Vinyasa Flow"
            required
            minLength={5}
            style={fieldErrors.title ? { border: '1px solid var(--error)' } : undefined}
          />
          {fieldErrors.title && <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.35rem' }}>{fieldErrors.title}</div>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea 
            className="input" 
            value={description} 
            onChange={e => { setDescription(e.target.value); setFieldErrors(p => ({ ...p, description: undefined })); }} 
            placeholder="Detailed description of what students will learn..."
            rows={5}
            required
            minLength={20}
            style={fieldErrors.description ? { border: '1px solid var(--error)' } : undefined}
          />
          {fieldErrors.description && <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.35rem' }}>{fieldErrors.description}</div>}
        </div>

        <div className="form-row-2">
          <div>
            <label className="label">Course Type</label>
            <CustomSelect 
              value={courseType} 
              onChange={setCourseType}
              options={[
                { value: 'RECORDED', label: 'Pre-Recorded Video Course' },
                { value: 'HYBRID', label: 'Hybrid (Pre-Recorded + Live Group Sessions)' }
              ]}
              required
            />
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.5rem' }}>
              {courseType === 'HYBRID'
                ? '📺 Includes pre-recorded lessons AND scheduled live group sessions for enrolled students.'
                : '🎬 Video lessons that students can watch at their own pace.'}
            </p>
          </div>

          <div>
            <label className="label">Category</label>
            <CustomSelect 
              value={categoryId} 
              onChange={v => { setCategoryId(v); setFieldErrors(p => ({ ...p, categoryId: undefined })); }}
              options={[
                { value: '', label: '-- Select a Category --' },
                ...categories.map(cat => ({ value: cat.id, label: cat.name }))
              ]}
              required
              error={!!fieldErrors.categoryId}
            />
            {fieldErrors.categoryId && <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.35rem' }}>{fieldErrors.categoryId}</div>}
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

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
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
