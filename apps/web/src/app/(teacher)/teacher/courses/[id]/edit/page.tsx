'use client';

import { useState, useEffect, use } from 'react';
import { useDialog } from '@/components/providers/DialogProvider';
import { CustomSelect } from '@/components/ui/CustomSelect';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { categoriesApi } from '@/lib/api/categories';
import type { Category, Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);
  const dialog = useDialog();

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseType, setCourseType] = useState('RECORDED');
  const [categoryId, setCategoryId] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<{title?: string, description?: string, categoryId?: string}>({});

  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    Promise.all([
      coursesApi.getCourse(id),
      categoriesApi.getAll(),
    ]).then(([courseRes, catRes]) => {
      const course = courseRes.data?.course;
      if (course) {
        setTitle(course.title);
        setDescription(course.description);
        setCourseType(course.courseType);
        setCategoryId(course.categoryId);
        setCurrentCoverUrl(course.coverImageUrl || null);
      }
      setCategories(catRes.data?.categories || []);
    }).catch(err => {
      setError(err.message || 'Failed to load course');
    }).finally(() => setLoading(false));
  }, [id]);

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
      await coursesApi.updateCourse(id, {
        title,
        description,
        courseType: courseType as Course['courseType'],
        categoryId,
      });

      if (coverFile) {
        const { data: presigned } = await coursesApi.getPresignedCoverUrl(id, coverFile.type, coverFile.size);
        if (presigned) {
          const uploadRes = await fetch(presigned.uploadUrl, {
            method: 'PUT',
            body: coverFile,
            headers: { 'Content-Type': coverFile.type },
          });
          if (!uploadRes.ok) await dialog.alert({ title: 'Notification', message: 'Course saved, but cover image upload failed.' });
        }
      }

      router.push('/teacher/courses');
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'An error occurred while saving the course'));
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading course...</div>;

  return (
    <div className="page-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Course</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Update your course details below.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <button onClick={() => router.push(`/teacher/courses/${id}/curriculum`)} className="btn btn-secondary">
            Manage Curriculum
          </button>
          <button onClick={() => router.push(`/teacher/courses/${id}/publish`)} className="btn btn-primary" style={{ background: 'var(--brand-600)' }}>
            Publish Course →
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <form noValidate onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>

        <div>
          <label className="label">Course Title</label>
          <input type="text" className="input" value={title} onChange={e => { setTitle(e.target.value); setFieldErrors(p => ({ ...p, title: undefined })); }}
            placeholder="E.g. Advanced Vinyasa Flow" required minLength={5} style={fieldErrors.title ? { border: '1px solid var(--error)' } : undefined} />
          {fieldErrors.title && <div style={{ color: 'var(--error)', fontSize: '0.75rem', marginTop: '0.35rem' }}>{fieldErrors.title}</div>}
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input" value={description} onChange={e => { setDescription(e.target.value); setFieldErrors(p => ({ ...p, description: undefined })); }}
            placeholder="Detailed description of what students will learn..." rows={5} required minLength={20} style={fieldErrors.description ? { border: '1px solid var(--error)' } : undefined} />
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
          </div>
        </div>

        <div>
          <label className="label">Cover Image</label>
          <p style={{ fontSize: '0.75rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>Max file size: 1MB. Upload a new image to replace the current one.</p>
          {currentCoverUrl && (
            <div style={{ marginBottom: '0.75rem' }}>
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.25rem' }}>Current cover:</p>
              <img src={currentCoverUrl} alt="Current cover" style={{ height: 120, width: 'auto', borderRadius: 'var(--radius-md)', objectFit: 'cover', border: '1px solid var(--surface-border)' }} />
            </div>
          )}
          <div style={{ padding: '1rem', border: '1px dashed var(--surface-border)', borderRadius: 'var(--radius-md)', background: 'rgba(255,255,255,0.02)' }}>
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }} />
          </div>
        </div>

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem', flexWrap: 'wrap' }}>
          <button type="button" onClick={() => router.push('/teacher/courses')} className="btn btn-ghost" disabled={submitting}>
            Cancel
          </button>
          <button type="submit" className="btn btn-primary" disabled={submitting}>
            {submitting ? 'Saving...' : 'Save Changes'}
          </button>
        </div>

      </form>
    </div>
  );
}
