import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useWine } from '../hooks/useWine';
import { useDeleteWine } from '../hooks/useDeleteWine';
import { StatusBadge } from '../components/StatusBadge';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { formatters } from '../utils/formatters';

export function WineDetailPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);

  const { data: wine, isLoading, isError } = useWine(id);
  const deleteMutation = useDeleteWine();

  async function handleDelete() {
    if (!id) return;
    try {
      await deleteMutation.mutateAsync(id);
      navigate('/', { replace: true });
    } catch {
      // Error state shown via deleteMutation.isError below
    }
  }

  if (isLoading) {
    return (
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading…</div>
      </main>
    );
  }

  if (isError || !wine) {
    return (
      <main style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
        <div role="alert" style={{ color: '#dc2626', padding: 16, border: '1px solid #fca5a5', borderRadius: 6 }}>
          Wine not found or you do not have access.
        </div>
        <Link to="/" style={{ display: 'inline-block', marginTop: 16, color: '#7c3aed' }}>
          ← Back to inventory
        </Link>
      </main>
    );
  }

  const field = (label: string, value: string | null | undefined) => {
    if (!value) return null;
    return (
      <div style={{ marginBottom: 12 }}>
        <dt style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          {label}
        </dt>
        <dd style={{ fontSize: 15, color: '#111827', marginTop: 2 }}>{value}</dd>
      </div>
    );
  };

  return (
    <main style={{ maxWidth: 700, margin: '0 auto', padding: '24px 16px' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Back to inventory
        </Link>
      </div>

      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <h1 style={{ fontSize: 28, fontWeight: 700, marginBottom: 4 }}>{wine.name}</h1>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
            <StatusBadge status={wine.status} />
            {wine.vintage && (
              <span style={{ color: '#6b7280', fontSize: 14 }}>Vintage {wine.vintage}</span>
            )}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link
            to={`/wines/${wine.id}/edit`}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #d1d5db',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Edit
          </Link>
          <button
            onClick={() => setShowDeleteDialog(true)}
            style={{
              padding: '8px 16px',
              borderRadius: 6,
              border: '1px solid #fca5a5',
              backgroundColor: '#fff',
              color: '#dc2626',
              cursor: 'pointer',
              fontWeight: 500,
              fontSize: 14,
            }}
          >
            Delete
          </button>
        </div>
      </div>

      {/* Wine details */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <dl style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 16 }}>
          {field('Producer', wine.producer)}
          {field('Varietal', wine.varietal)}
          {field('Region', wine.region)}
          {field('Vintage', wine.vintage !== null ? String(wine.vintage) : null)}
          {field('Bottles', formatters.bottleCount(wine.bottle_count))}
          {field('Rating', wine.rating !== null ? formatters.rating(wine.rating) : null)}
          {field('Date Added', formatters.date(wine.date_added))}
          {field('Last Updated', formatters.date(wine.date_updated))}
        </dl>
      </div>

      {/* Tasting notes */}
      {wine.tasting_notes && (
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
          <h2 style={{ fontSize: 14, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            Tasting Notes
          </h2>
          <p style={{ fontSize: 15, color: '#111827', lineHeight: 1.6 }}>{wine.tasting_notes}</p>
        </div>
      )}

      {/* Delete mutation error */}
      {deleteMutation.isError && (
        <div role="alert" style={{ color: '#dc2626', padding: 12, border: '1px solid #fca5a5', borderRadius: 6, marginBottom: 16 }}>
          Failed to delete wine. Please try again.
        </div>
      )}

      <ConfirmDialog
        open={showDeleteDialog}
        title="Delete Wine"
        message={`Are you sure you want to delete "${wine.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        onConfirm={handleDelete}
        onCancel={() => setShowDeleteDialog(false)}
        loading={deleteMutation.isPending}
      />
    </main>
  );
}
