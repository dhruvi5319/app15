import type { WineStatus } from '../types/wine.types';

const STATUS_STYLES: Record<WineStatus, React.CSSProperties> = {
  active: { backgroundColor: '#d1fae5', color: '#065f46', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  consumed: { backgroundColor: '#e5e7eb', color: '#374151', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
  removed: { backgroundColor: '#fee2e2', color: '#991b1b', borderRadius: 4, padding: '2px 8px', fontSize: 12, fontWeight: 600 },
};

interface StatusBadgeProps {
  status: WineStatus;
}

export function StatusBadge({ status }: StatusBadgeProps) {
  return <span style={STATUS_STYLES[status]}>{status}</span>;
}
