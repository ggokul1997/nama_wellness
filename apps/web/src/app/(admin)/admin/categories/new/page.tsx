import CategoryForm from '../_components/CategoryForm';

export default function NewCategoryPage() {
  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Add Category</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Create a new course category.</p>
      </div>

      <div className="glass-card" style={{ padding: '2rem' }}>
        <CategoryForm />
      </div>
    </div>
  );
}
