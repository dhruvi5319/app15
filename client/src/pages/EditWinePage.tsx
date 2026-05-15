import { useParams } from 'react-router-dom';

export function EditWinePage() {
  const { id } = useParams<{ id: string }>();
  return (
    <main>
      <h1>Edit Wine</h1>
      <p>Editing wine ID: {id}</p>
    </main>
  );
}
