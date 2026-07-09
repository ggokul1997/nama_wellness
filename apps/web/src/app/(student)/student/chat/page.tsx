export default function StudentChatPage() {
  return (
    <div className="page-content" style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
      <div>
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, color: 'var(--text-primary)' }}>Chat</h1>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.25rem' }}>Communicate with your teachers and peers.</p>
      </div>

      <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, color: 'var(--text-primary)' }}>Coming Soon!</h2>
        <p style={{ color: 'var(--text-secondary)', marginTop: '0.5rem' }}>
          In-app messaging will be available in an upcoming update.
        </p>
      </div>
    </div>
  );
}
