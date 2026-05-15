import { useNavigate, Link } from 'react-router-dom';
import { useCreateWine } from '../hooks/useCreateWine';
import { WineForm } from '../components/WineForm';
import type { CreateWineInput, UpdateWineInput } from '../types/wine.types';

export function AddWinePage() {
  const navigate = useNavigate();
  const createMutation = useCreateWine();

  async function handleSubmit(data: CreateWineInput | UpdateWineInput) {
    try {
      // On the Add page, the form always provides a name (required), so cast is safe
      const wine = await createMutation.mutateAsync(data as CreateWineInput);
      // Navigate to the new wine's detail page
      navigate(`/wines/${wine.id}`, { replace: true });
    } catch {
      // error is shown via mutation.error
    }
  }

  const errorMessage = createMutation.error
    ? (createMutation.error as Error).message || 'Failed to create wine. Please try again.'
    : null;

  return (
    <main style={{ maxWidth: 600, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <Link to="/" style={{ color: '#6b7280', fontSize: 14, textDecoration: 'none' }}>
          ← Back to inventory
        </Link>
      </div>

      <h1 style={{ fontSize: 24, fontWeight: 700, marginBottom: 24 }}>Add Wine</h1>

      <div style={{ border: '1px solid #e5e7eb', borderRadius: 8, padding: 24 }}>
        <WineForm
          onSubmit={handleSubmit}
          isLoading={createMutation.isPending}
          error={errorMessage}
          submitLabel="Add Wine"
          onCancel={() => navigate('/')}
        />
      </div>
    </main>
  );
}
