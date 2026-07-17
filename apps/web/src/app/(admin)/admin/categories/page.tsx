'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { categoriesApi } from '@/lib/api/categories';
import type { Category } from '@nama/shared';
import { getErrorMessage } from '@/lib/error';
import { useDialog } from '@/components/providers/DialogProvider';

export default function CategoriesPage() {
  const dialog = useDialog();
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
    } catch (err: unknown) {
      setError(getErrorMessage(err, 'Failed to fetch categories'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    const confirmed = await dialog.confirm({ 
      title: 'Delete Category', 
      message: 'Are you sure you want to delete this category?', 
      isDestructive: true, 
      confirmText: 'Delete' 
    });
    if (!confirmed) return;
    
    try {
      await categoriesApi.delete(id);
      setCategories(categories.filter(c => c.id !== id));
    } catch (err: unknown) {
      await dialog.alert({ title: 'Error', message: getErrorMessage(err, 'Failed to delete category') });
    }
  };

  if (loading) return <div style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>Loading categories...</div>;

  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
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

      {categories.length === 0 ? (
        <div className="glass-card" style={{ padding: '2rem 1.5rem', textAlign: 'center', color: 'var(--text-muted)' }}>
          No categories found.
        </div>
      ) : (
        <>
          {/* MOBILE VIEW: Cards */}
          <div className="hide-desktop" style={{ flexDirection: 'column', gap: '1rem', width: '100%' }}>
            {categories.map((category) => (
              <div key={category.id} className="glass-card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.875rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div>
                    <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '1.0625rem' }}>{category.name}</div>
                    <div style={{ fontFamily: 'monospace', fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '0.25rem' }}>{category.slug}</div>
                  </div>
                  <span className={category.isActive ? 'badge badge-success' : 'badge badge-neutral'} style={{ flexShrink: 0 }}>
                    {category.isActive ? 'Active' : 'Inactive'}
                  </span>
                </div>
                
                <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                  Order: <span style={{ color: 'var(--text-primary)', fontWeight: 500 }}>{category.sortOrder}</span>
                </div>

                <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.25rem' }}>
                  <Link 
                    href={`/admin/categories/${category.id}`}
                    className="btn btn-outline"
                    style={{ flex: 1, textAlign: 'center', justifyContent: 'center', borderColor: 'var(--brand-500)', color: 'var(--brand-400)' }}
                  >
                    Edit
                  </Link>
                  <button 
                    onClick={() => handleDelete(category.id)}
                    className="btn btn-danger"
                    style={{ flex: 1, textAlign: 'center', justifyContent: 'center' }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* DESKTOP VIEW: Table */}
          <div className="glass-card table-responsive hide-mobile" style={{ flexDirection: 'column' }}>
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
                {categories.map((category) => (
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
                        className="btn btn-outline"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem', borderColor: 'var(--brand-500)', color: 'var(--brand-400)' }}
                      >
                        Edit
                      </Link>
                      <button 
                        onClick={() => handleDelete(category.id)}
                        className="btn btn-danger"
                        style={{ padding: '0.4rem 0.75rem', fontSize: '0.8rem' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  );
}
