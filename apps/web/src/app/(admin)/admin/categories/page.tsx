'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api/categories';
import type { Category } from '@nama/shared';

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      const res = await categoriesApi.getAll();
      setCategories(res.data?.categories || []);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch categories');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this category?')) return;
    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: any) {
      alert(err.message || 'Failed to delete category');
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading categories...</div>;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Categories</h1>
          <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Manage course categories for the platform.</p>
        </div>
        <Link 
          href="/admin/categories/new" 
          className="btn btn-primary"
        >
          Add Category
        </Link>
      </div>

      {error && (
        <div className="alert alert-error">
          {error}
        </div>
      )}

      <div className="glass-card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', textTransform: 'uppercase', fontSize: '0.75rem' }}>
            <tr>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Order</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Name</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Slug</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500 }}>Status</th>
              <th style={{ padding: '1rem 1.5rem', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {categories.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
                  No categories found.
                </td>
              </tr>
            ) : (
              categories.map((category) => (
                <tr key={category.id} style={{ borderBottom: '1px solid var(--surface-border)' }}>
                  <td style={{ padding: '1rem 1.5rem' }}>{category.sortOrder}</td>
                  <td style={{ padding: '1rem 1.5rem', fontWeight: 500, color: 'var(--text-primary)' }}>{category.name}</td>
                  <td style={{ padding: '1rem 1.5rem', fontFamily: 'monospace', fontSize: '0.75rem' }}>{category.slug}</td>
                  <td style={{ padding: '1rem 1.5rem' }}>
                    <span className={category.isActive ? 'badge badge-success' : 'badge badge-neutral'}>
                      {category.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td style={{ padding: '1rem 1.5rem', textAlign: 'right', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <Link 
                      href={`/admin/categories/${category.id}`}
                      style={{ color: 'var(--brand-400)', textDecoration: 'none' }}
                    >
                      Edit
                    </Link>
                    <button 
                      onClick={() => handleDelete(category.id)}
                      style={{ color: 'var(--error)', background: 'transparent', border: 'none', cursor: 'pointer' }}
                    >
                      Delete
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
