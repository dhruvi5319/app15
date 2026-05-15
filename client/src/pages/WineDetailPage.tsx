import { useParams } from 'react-router-dom';

export function WineDetailPage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main>
      <h1>Wine Detail</h1>
      <p>Wine ID: {id}</p>
    </main>
  );
}
