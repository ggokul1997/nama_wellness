'use client';

export default function AdminDashboard() {
  return (
    <div className="page-content">
      <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Platform Overview ⚙️
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          Nama Wellness — Admin Control Center
        </p>
      </div>

      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
        gap: '1rem', marginBottom: '2.5rem',
      }}>
        {[
          { label: 'Total Students', value: '—', icon: '🎓' },
          { label: 'Active Teachers', value: '—', icon: '🧑‍🏫' },
          { label: 'Published Courses', value: '—', icon: '📚' },
          { label: 'Revenue (₹)', value: '—', icon: '💰' },
          { label: 'Pending Applications', value: '—', icon: '📋' },
          { label: 'Corporate Clients', value: '—', icon: '🏢' },
        ].map((m, i) => (
          <div key={m.label} className={`metric-card animate-fade-up stagger-${i + 1}`}>
            <div style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>{m.icon}</div>
            <div className="metric-value">{m.value}</div>
            <div className="metric-label">{m.label}</div>
          </div>
        ))}
      </div>

      <div className="alert alert-success">
        ✅ Sprint A complete — Auth system, RBAC, and user management are live. Teacher approvals and course management arrive in Sprint B.
      </div>
    </div>
  );
}
