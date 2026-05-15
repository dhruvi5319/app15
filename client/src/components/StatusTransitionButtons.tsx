import type { WineStatus } from '../types/wine.types';
import { useUpdateStatus } from '../hooks/useUpdateStatus';

interface StatusTransitionButtonsProps {
  wineId: string;
  currentStatus: WineStatus;
}

export function StatusTransitionButtons({ wineId, currentStatus }: StatusTransitionButtonsProps) {
  const mutation = useUpdateStatus(wineId);

  const btnBase: React.CSSProperties = {
    padding: '8px 16px',
    borderRadius: 6,
    border: 'none',
    cursor: 'pointer',
    fontWeight: 600,
    fontSize: 14,
  };

  const primaryBtn: React.CSSProperties = {
    ...btnBase,
    backgroundColor: '#7c3aed',
    color: '#fff',
  };

  const secondaryBtn: React.CSSProperties = {
    ...btnBase,
    backgroundColor: '#fff',
    border: '1px solid #d1d5db',
    color: '#374151',
  };

  const dangerBtn: React.CSSProperties = {
    ...btnBase,
    backgroundColor: '#fff',
    border: '1px solid #fca5a5',
    color: '#dc2626',
  };

  function handleTransition(newStatus: WineStatus) {
    mutation.mutate(newStatus);
  }

  return (
    <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
      <h2
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: '#6b7280',
          textTransform: 'uppercase',
          letterSpacing: '0.05em',
          marginBottom: 16,
        }}
      >
        Status Actions
      </h2>

      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {currentStatus === 'active' && (
          <>
            <button
              onClick={() => handleTransition('consumed')}
              disabled={mutation.isPending}
              style={{ ...primaryBtn, opacity: mutation.isPending ? 0.7 : 1 }}
              aria-label="Mark as consumed"
            >
              {mutation.isPending ? 'Updating…' : 'Mark as Consumed'}
            </button>
            <button
              onClick={() => handleTransition('removed')}
              disabled={mutation.isPending}
              style={{ ...dangerBtn, opacity: mutation.isPending ? 0.7 : 1 }}
              aria-label="Mark as removed"
            >
              Mark as Removed
            </button>
          </>
        )}

        {(currentStatus === 'consumed' || currentStatus === 'removed') && (
          <button
            onClick={() => handleTransition('active')}
            disabled={mutation.isPending}
            style={{ ...secondaryBtn, opacity: mutation.isPending ? 0.7 : 1 }}
            aria-label="Revert to active"
          >
            {mutation.isPending ? 'Updating…' : 'Revert to Active'}
          </button>
        )}
      </div>

      {mutation.isError && (
        <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginTop: 12 }}>
          Failed to update status. Please try again.
        </p>
      )}
    </div>
  );
}
