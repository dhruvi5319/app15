import { useBottleCount } from '../hooks/useBottleCount';

interface BottleCountControlProps {
  wineId: string;
  currentCount: number;
}

export function BottleCountControl({ wineId, currentCount }: BottleCountControlProps) {
  const mutation = useBottleCount(wineId);

  function handleAction(action: 'increment' | 'decrement') {
    mutation.mutate(action);
  }

  const btnStyle = (disabled: boolean): React.CSSProperties => ({
    width: 36,
    height: 36,
    borderRadius: 6,
    border: '1px solid #d1d5db',
    backgroundColor: disabled ? '#f9fafb' : '#fff',
    color: disabled ? '#9ca3af' : '#374151',
    cursor: disabled ? 'not-allowed' : 'pointer',
    fontSize: 20,
    fontWeight: 700,
    lineHeight: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  });

  return (
    <div>
      <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
        Bottle Count
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          aria-label="Decrease bottle count"
          onClick={() => handleAction('decrement')}
          disabled={currentCount === 0 || mutation.isPending}
          style={btnStyle(currentCount === 0 || mutation.isPending)}
        >
          −
        </button>
        <span
          aria-live="polite"
          aria-atomic="true"
          style={{ fontSize: 24, fontWeight: 700, minWidth: 40, textAlign: 'center' }}
        >
          {currentCount}
        </span>
        <button
          aria-label="Increase bottle count"
          onClick={() => handleAction('increment')}
          disabled={currentCount >= 9999 || mutation.isPending}
          style={btnStyle(currentCount >= 9999 || mutation.isPending)}
        >
          +
        </button>
      </div>
      {currentCount === 0 && (
        <p style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>No bottles left</p>
      )}
      {mutation.isError && (
        <p role="alert" style={{ color: '#dc2626', fontSize: 13, marginTop: 6 }}>
          Failed to update count. Please try again.
        </p>
      )}
    </div>
  );
}
