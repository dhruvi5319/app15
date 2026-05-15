import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWines } from '../hooks/useWines';
import { WineCard } from '../components/WineCard';
import type { WineStatus } from '../types/wine.types';

type HistoryTab = Extract<WineStatus, 'consumed' | 'removed'>;

export function HistoryPage() {
  const [activeTab, setActiveTab] = useState<HistoryTab>('consumed');

  const { data, isLoading, isError } = useWines({ status: activeTab, per_page: 50 });

  const tabStyle = (tab: HistoryTab): React.CSSProperties => ({
    padding: '6px 16px',
    borderRadius: 4,
    fontSize: 14,
    cursor: 'pointer',
    border: '1px solid #d1d5db',
    backgroundColor: activeTab === tab ? '#7c3aed' : '#fff',
    color: activeTab === tab ? '#fff' : '#374151',
    fontWeight: activeTab === tab ? 600 : 400,
  });

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Back to inventory
        </Link>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 20 }}>Wine History</h1>

      {/* Tab buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
        <button onClick={() => setActiveTab('consumed')} style={tabStyle('consumed')}>
          Consumed
        </button>
        <button onClick={() => setActiveTab('removed')} style={tabStyle('removed')}>
          Removed
        </button>
      </div>

      {/* Content */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading…</div>
      )}

      {isError && (
        <div role="alert" style={{ color: '#dc2626', padding: 16, border: '1px solid #fca5a5', borderRadius: 6 }}>
          Failed to load history.
        </div>
      )}

      {data && data.results.length === 0 && (
        <div style={{ textAlign: 'center', padding: 48, color: '#9ca3af', fontSize: 15 }}>
          No {activeTab} wines yet.
          {activeTab === 'consumed' && (
            <p style={{ marginTop: 8, fontSize: 13 }}>
              Mark a wine as consumed from its{' '}
              <Link to="/" style={{ color: '#7c3aed' }}>detail page</Link>.
            </p>
          )}
        </div>
      )}

      {data && data.results.length > 0 && (
        <>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {data.results.map((wine) => (
              <WineCard key={wine.id} wine={wine} />
            ))}
          </div>
          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 8 }}>
            {data.pagination.total} {activeTab} wine{data.pagination.total !== 1 ? 's' : ''} — click a wine to view it and revert to active
          </p>
        </>
      )}
    </main>
  );
}
