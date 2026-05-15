import { Link } from 'react-router-dom';

export function EmptyState() {
  return (
    <div
      style={{
        textAlign: 'center',
        padding: '48px 24px',
        color: '#6b7280',
      }}
    >
      <div style={{ fontSize: 48, marginBottom: 16 }}>🍷</div>
      <h2 style={{ fontSize: 20, fontWeight: 600, color: '#111827', marginBottom: 8 }}>
        Your cellar is empty
      </h2>
      <p style={{ marginBottom: 24 }}>Add your first wine to get started.</p>
      <Link
        to="/wines/add"
        style={{
          display: 'inline-block',
          padding: '10px 20px',
          backgroundColor: '#7c3aed',
          color: '#fff',
          borderRadius: 6,
          textDecoration: 'none',
          fontWeight: 600,
        }}
      >
        Add a Wine
      </Link>
    </div>
  );
}
