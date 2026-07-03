'use client';

import { useState, useEffect, use } from 'react';
import { useRouter } from 'next/navigation';
import { coursesApi } from '@/lib/api/courses';
import type { Course, CoursePricing } from '@nama/shared';
import Link from 'next/link';

export default function PublishCoursePage({ params }: { params: Promise<{ id: string }> }) {
  const router = useRouter();
  const { id } = use(params);

  const [course, setCourse] = useState<(Course & { pricings?: CoursePricing[] }) | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  const [price, setPrice] = useState<number | ''>('');
  const [currency, setCurrency] = useState('INR');
  const [saving, setSaving] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [editingPrice, setEditingPrice] = useState(false);
  const [deletingPrice, setDeletingPrice] = useState(false);

  useEffect(() => {
    fetchCourse();
  }, [id]);

  const fetchCourse = async () => {
    try {
      const res = await coursesApi.getCourse(id);
      setCourse(res.data?.course || null);
      // We don't return pricing in getCourse by default right now, 
      // but if the course has a pricing, we would set it here.
      // For MVP, they have to set it before submitting.
    } catch (err: any) {
      setError(err.message || 'Failed to fetch course');
    } finally {
      setLoading(false);
    }
  };

  const handleProposePrice = async (e: React.FormEvent) => {
    e.preventDefault();
    if (price === '') return;
    setSaving(true);
    try {
      await coursesApi.proposePricing(id, { amount: Number(price), currency });
      alert('Pricing proposed successfully!');
      setEditingPrice(false);
      fetchCourse(); // Refresh course to get the new pricing
    } catch (err: any) {
      alert(err.message || 'Failed to propose pricing');
    } finally {
      setSaving(false);
    }
  };

  const handleDeletePrice = async () => {
    if (!confirm('Are you sure you want to delete the proposed price?')) return;
    setDeletingPrice(true);
    try {
      await coursesApi.deletePricing(id);
      setPrice('');
      setEditingPrice(false);
      fetchCourse(); // Refresh course
    } catch (err: any) {
      alert(err.message || 'Failed to delete pricing');
    } finally {
      setDeletingPrice(false);
    }
  };

  const handleSubmitReview = async () => {
    if (!confirm('Are you sure you want to submit this course for review? You will not be able to edit it while it is under review.')) {
      return;
    }
    setSubmitting(true);
    try {
      await coursesApi.submitForReview(id);
      alert('Course submitted for review!');
      router.push('/teacher/courses');
    } catch (err: any) {
      alert(err.message || 'Failed to submit course for review. Did you propose a price first?');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-content">Loading...</div>;
  if (error || !course) return <div className="page-content alert alert-error">{error || 'Course not found'}</div>;

  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case 'APPROVED':
      case 'PUBLISHED':
        return 'badge-success';
      case 'REJECTED':
        return 'badge-error';
      case 'CHANGES_REQUESTED':
      case 'PENDING_REVIEW':
        return 'badge-warning';
      default:
        return 'badge-ghost';
    }
  };

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem', maxWidth: '800px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
        <Link href={`/teacher/courses/${id}/curriculum`} className="btn btn-ghost">← Back to Curriculum</Link>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Publish Course</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{course.title}</p>
        </div>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>1. Set Course Pricing</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Propose a price for your course. Our admins will review and finalize the pricing before publishing.
        </p>

        {course.pricings && course.pricings.length > 0 && !editingPrice ? (
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            padding: '1.5rem', 
            background: 'rgba(52, 211, 153, 0.05)', 
            border: '1px solid rgba(52, 211, 153, 0.2)', 
            borderRadius: 'var(--radius-lg)' 
          }}>
            <div>
              <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '0.25rem' }}>Saved Price</p>
              <p style={{ fontSize: '2rem', fontWeight: 700, color: 'var(--success)' }}>
                {course.pricings?.[0]?.currency} {course.pricings?.[0]?.amount}
              </p>
            </div>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <button 
                onClick={() => {
                  setPrice(course.pricings?.[0]?.amount || '');
                  setCurrency(course.pricings?.[0]?.currency || 'INR');
                  setEditingPrice(true);
                }} 
                className="btn btn-secondary"
                disabled={course.status !== 'DRAFT' && course.status !== 'CHANGES_REQUESTED'}
              >
                Edit
              </button>
              <button 
                onClick={handleDeletePrice} 
                className="btn btn-ghost" 
                style={{ color: 'var(--error)' }}
                disabled={(course.status !== 'DRAFT' && course.status !== 'CHANGES_REQUESTED') || deletingPrice}
              >
                {deletingPrice ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleProposePrice} style={{ 
            display: 'flex', 
            flexDirection: 'column', 
            gap: '1.5rem', 
            padding: '1.5rem', 
            background: 'var(--surface-hover)', 
            borderRadius: 'var(--radius-lg)', 
            border: '1px solid var(--surface-border)' 
          }}>
            <div className="form-group" style={{ margin: 0 }}>
              <label className="label">Course Price</label>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <select 
                  className="input" 
                  style={{ width: '120px', fontSize: '1.1rem', padding: '0.75rem' }}
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  disabled={course.status !== 'DRAFT' && course.status !== 'CHANGES_REQUESTED'}
                >
                  <option value="INR">₹ INR</option>
                  <option value="USD">$ USD</option>
                </select>
                <input
                  type="number"
                  className="input"
                  style={{ flex: 1, fontSize: '1.1rem', padding: '0.75rem' }}
                  min="0"
                  step="0.01"
                  placeholder="e.g. 499"
                  value={price}
                  onChange={(e) => setPrice(e.target.value ? Number(e.target.value) : '')}
                  required
                  disabled={course.status !== 'DRAFT' && course.status !== 'CHANGES_REQUESTED'}
                />
              </div>
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
              {editingPrice && (
                <button 
                  type="button" 
                  onClick={() => setEditingPrice(false)} 
                  className="btn btn-ghost"
                >
                  Cancel
                </button>
              )}
              <button 
                type="submit" 
                className="btn btn-primary" 
                disabled={saving || (course.status !== 'DRAFT' && course.status !== 'CHANGES_REQUESTED')}
              >
                {saving ? 'Saving...' : 'Save Price'}
              </button>
            </div>
          </form>
        )}
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>2. Submit for Review</h2>
        <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem' }}>
          Once you have added all your modules, lessons, and proposed a price, you can submit your course for admin review.
        </p>

        <div style={{ padding: '1rem', background: 'var(--surface-hover)', borderRadius: '0.5rem', marginBottom: '1.5rem' }}>
          <strong>Current Status:</strong> <span className={`badge ${getStatusBadgeClass(course.status)}`}>{course.status}</span>
        </div>

        <button 
          onClick={handleSubmitReview}
          className="btn btn-primary"
          style={{ width: '100%', padding: '1rem' }}
          disabled={submitting || (course.status !== 'DRAFT' && course.status !== 'CHANGES_REQUESTED')}
        >
          {submitting ? 'Submitting...' : 'Submit Course for Review'}
        </button>
      </div>
    </div>
  );
}
