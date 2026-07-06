'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import { categoriesApi } from '@/lib/api/categories';
import type { Category, Course } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';

export default function EditCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [courseType, setCourseType] = useState('RECORDED');
  const [categoryId, setCategoryId] = useState('');
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [currentCoverUrl, setCurrentCoverUrl] = useState<string | null>(null);

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
          if (!uploadRes.ok) alert('Course saved, but cover image upload failed.');
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Course</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Update your course details below.</p>
        </div>
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <button onClick={() => router.push(`/teacher/courses/${id}/materials`)} className="btn btn-ghost" style={{ border: '1px solid var(--surface-border)' }}>
            Study Materials
          </button>
          <button onClick={() => router.push(`/teacher/courses/${id}/curriculum`)} className="btn btn-secondary">
            Manage Curriculum
          </button>
          <button onClick={() => router.push(`/teacher/courses/${id}/publish`)} className="btn btn-primary" style={{ background: 'var(--brand-600)' }}>
            Publish Course →
          </button>
        </div>
      </div>

      {error && <div className="alert alert-error" style={{ marginBottom: '1.5rem' }}>{error}</div>}

      <form onSubmit={handleSubmit} className="glass-card" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', padding: '2rem' }}>

        <div>
          <label className="label">Course Title</label>
          <input type="text" className="input" value={title} onChange={e => setTitle(e.target.value)}
            placeholder="E.g. Advanced Vinyasa Flow" required minLength={5} />
        </div>

        <div>
          <label className="label">Description</label>
          <textarea className="input" value={description} onChange={e => setDescription(e.target.value)}
            placeholder="Detailed description of what students will learn..." rows={5} required minLength={20} />
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
              {categories.map(cat => (
                <option key={cat.id} value={cat.id}>{cat.name}</option>
              ))}
            </select>
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

        <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--surface-border)', display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
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
