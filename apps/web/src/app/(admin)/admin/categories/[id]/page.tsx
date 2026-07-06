'use client';

import React, { useState, useEffect } from 'react';

import { categoriesApi } from '@/lib/api/categories';
import type { Category } from '@nama/shared';
import CategoryForm from '../_components/CategoryForm';
import { getErrorMessage } from '@/lib/error';

export default function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  
  const [category, setCategory] = useState<Category | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategory();
  }, [id]);

  const fetchCategory = async () => {
    try {
      const res = await categoriesApi.getById(id);
      setCategory(res.data?.category || null);
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch category'));
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading category...</div>;
  if (error) return <div className="alert alert-error">{error}</div>;
  if (!category) return <div className="alert alert-error">Category not found</div>;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Edit Category</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Update course category details.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <CategoryForm initialData={category} />
      </div>
    </div>
  );
}
