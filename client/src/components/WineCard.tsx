import { Link } from 'react-router-dom';
import type { WineListItem } from '../types/wine.types';
import { StatusBadge } from './StatusBadge';
import { formatters } from '../utils/formatters';

interface WineCardProps {
  wine: WineListItem;
}

export function WineCard({ wine }: WineCardProps) {
  return (
    <Link
      to={`/wines/${wine.id}`}
      style={{
        display: 'block',
        padding: '12px 16px',
        borderBottom: '1px solid #e5e7eb',
        textDecoration: 'none',
        color: 'inherit',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 8 }}>
        <div style={{ minWidth: 0, flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
            <strong style={{ fontSize: 15 }}>{wine.name}</strong>
            {wine.vintage && (
              <span style={{ color: '#6b7280', fontSize: 13 }}>{formatters.vintage(wine.vintage)}</span>
            )}
            <StatusBadge status={wine.status} />
          </div>
          <div style={{ color: '#6b7280', fontSize: 13, marginTop: 2, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            {wine.producer && <span>{wine.producer}</span>}
            {wine.varietal && <span>{wine.varietal}</span>}
            {wine.region && <span>{wine.region}</span>}
          </div>
        </div>
        <div style={{ textAlign: 'right', flexShrink: 0 }}>
          <div style={{ fontSize: 14, fontWeight: 500 }}>{formatters.bottleCount(wine.bottle_count)}</div>
          {wine.rating && (
            <div style={{ fontSize: 12, color: '#d97706' }}>{formatters.rating(wine.rating)}</div>
          )}
        </div>
      </div>
    </Link>
  );
}
