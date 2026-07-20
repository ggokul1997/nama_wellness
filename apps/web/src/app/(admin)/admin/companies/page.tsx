export default function AdminCompaniesPlaceholder() {
  return (
    <div className="page-content">
      <div style={{ marginBottom: '2rem' }} className="animate-fade-up">
        <h1 style={{ fontSize: '1.75rem', fontWeight: 700, color: 'var(--text-primary)' }}>
          Corporate Clients 🏢
        </h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.375rem' }}>
          Detailed B2B license management is coming in the next sprint.
        </p>
      </div>

      <div className="glass-card animate-fade-up stagger-1" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ marginBottom: '1rem', color: 'var(--text-secondary)' }}>Under Construction</h2>
        <p style={{ color: 'var(--text-muted)' }}>
          This section will allow admins to onboard new corporate clients, manage B2B licenses, and view employee utilization.
        </p>
      </div>
    </div>
  );
}
