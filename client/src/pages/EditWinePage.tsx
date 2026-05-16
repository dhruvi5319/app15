import { useNavigate, useParams, Link } from 'react-router-dom';
import { useWine } from '../hooks/useWine';
import { useUpdateWine } from '../hooks/useUpdateWine';
import { BottleCountControl } from '../components/BottleCountControl';
import { WineForm } from '../components/WineForm';
import type { UpdateWineInput, CreateWineInput } from '../types/wine.types';

export function EditWinePage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const { data: wine, isLoading: wineLoading, isError: wineError } = useWine(id);
  const updateMutation = useUpdateWine(id!);

  async function handleSubmit(data: CreateWineInput | UpdateWineInput) {
    try {
      await updateMutation.mutateAsync(data as UpdateWineInput);
      navigate(`/wines/${id}`, { replace: true });
    } catch {
      // error shown via mutation.error
    }
  }

  if (wineLoading) {
    return (
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        <div style={{ textAlign: 'center', padding: 48, color: '#6b7280' }}>Loading…</div>
      </main>
    );
  }

  if (wineError || !wine) {
    return (
      <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
        <div role="alert" style={{ color: '#dc2626', padding: 16, border: '1px solid #fca5a5', borderRadius: 6 }}>
          Wine not found.
        </div>
        <Link to="/" style={{ display: 'inline-block', marginTop: 16, color: '#7c3aed' }}>
          ← Back to inventory
        </Link>
      </main>
    );
  }

  const errorMessage = updateMutation.error
    ? (updateMutation.error as Error).message || 'Failed to update wine. Please try again.'
    : null;

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link to={`/wines/${id}`} style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Back to {wine.name}
        </Link>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Edit Wine</h1>

      {/* Bottle count control — separate from text fields */}
      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24, marginBottom: 24 }}>
        <BottleCountControl wineId={wine.id} currentCount={wine.bottle_count} />
      </div>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
        <WineForm
          initialValues={wine}
          onSubmit={handleSubmit}
          isLoading={updateMutation.isPending}
          error={errorMessage}
          submitLabel="Save Changes"
          onCancel={() => navigate(`/wines/${id}`)}
        />
      </div>
    </main>
  );
}
