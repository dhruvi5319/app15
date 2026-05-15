import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useWines } from '../hooks/useWines';
import { WineCard } from '../components/WineCard';
import { EmptyState } from '../components/EmptyState';
import type { SortField, SortDirection, StatusFilter } from '../types/wine.types';

export function InventoryListPage() {
  const [sort, setSort] = useState<SortField>('date_added');
  const [direction, setDirection] = useState<SortDirection>('desc');
  const [status, setStatus] = useState<StatusFilter>('active');
  const [page, setPage] = useState(1);

  const { data, isLoading, isError, error } = useWines({
    sort,
    direction,
    status,
    page,
    per_page: 20,
  });

  function toggleDirection() {
    setDirection((d) => (d === 'asc' ? 'desc' : 'asc'));
    setPage(1);
  }

  function handleSortChange(newSort: SortField) {
    if (newSort === sort) {
      toggleDirection();
    } else {
      setSort(newSort);
      setDirection('asc');
      setPage(1);
    }
  }

  const sortOptions: { value: SortField; label: string }[] = [
    { value: 'date_added', label: 'Date Added' },
    { value: 'name', label: 'Name' },
    { value: 'producer', label: 'Producer' },
    { value: 'vintage', label: 'Vintage' },
  ];

  const statusOptions: { value: StatusFilter; label: string }[] = [
    { value: 'active', label: 'Active' },
    { value: 'consumed', label: 'Consumed' },
    { value: 'removed', label: 'Removed' },
    { value: 'all', label: 'All' },
  ];

  return (
    <main style={{ maxWidth: 800, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700 }}>My Wine Cellar</h1>
        <Link
          to="/wines/add"
          style={{
            padding: '8px 16px',
            backgroundColor: '#7c3aed',
            color: '#fff',
            borderRadius: 6,
            textDecoration: 'none',
            fontWeight: 600,
            fontSize: 14,
          }}
        >
          + Add Wine
        </Link>
      </div>

      {/* Controls: status filter + sort */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 16, flexWrap: 'wrap', alignItems: 'center' }}>
        <div style={{ display: 'flex', gap: 4 }}>
          {statusOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => { setStatus(opt.value); setPage(1); }}
              style={{
                padding: '4px 10px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: status === opt.value ? '#7c3aed' : '#fff',
                color: status === opt.value ? '#fff' : '#374151',
                fontWeight: status === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center', marginLeft: 'auto' }}>
          <span style={{ fontSize: 13, color: '#6b7280' }}>Sort:</span>
          {sortOptions.map((opt) => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              style={{
                padding: '4px 10px', borderRadius: 4, fontSize: 13, cursor: 'pointer',
                border: '1px solid #d1d5db',
                backgroundColor: sort === opt.value ? '#ede9fe' : '#fff',
                color: sort === opt.value ? '#7c3aed' : '#374151',
                fontWeight: sort === opt.value ? 600 : 400,
              }}
            >
              {opt.label}
              {sort === opt.value && (direction === 'asc' ? ' ↑' : ' ↓')}
            </button>
          ))}
        </div>
      </div>

      {/* Content */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading…</div>
      )}

      {isError && (
        <div role="alert" style={{ color: '#dc2626', padding: 16, border: '1px solid #fca5a5', borderRadius: 6 }}>
          Failed to load wines: {(error as Error)?.message ?? 'Unknown error'}
        </div>
      )}

      {data && data.results.length === 0 && <EmptyState />}

      {data && data.results.length > 0 && (
        <>
          <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, overflow: 'hidden' }}>
            {data.results.map((wine) => (
              <WineCard key={wine.id} wine={wine} />
            ))}
          </div>

          {/* Pagination */}
          {data.pagination.total_pages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 16 }}>
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #d1d5db', cursor: page === 1 ? 'default' : 'pointer' }}
              >
                ← Prev
              </button>
              <span style={{ padding: '6px 12px', fontSize: 14, color: '#6b7280' }}>
                Page {data.pagination.page} of {data.pagination.total_pages}
              </span>
              <button
                onClick={() => setPage((p) => Math.min(data.pagination.total_pages, p + 1))}
                disabled={page === data.pagination.total_pages}
                style={{ padding: '6px 12px', borderRadius: 4, border: '1px solid #d1d5db', cursor: page === data.pagination.total_pages ? 'default' : 'pointer' }}
              >
                Next →
              </button>
            </div>
          )}

          <p style={{ textAlign: 'center', color: '#9ca3af', fontSize: 13, marginTop: 8 }}>
            {data.pagination.total} wine{data.pagination.total !== 1 ? 's' : ''} total
          </p>
        </>
      )}
    </main>
  );
}
