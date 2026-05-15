import { useMutation, useQueryClient } from '@tanstack/react-query';
import { winesApi } from '../api/wines.api';

export function useDeleteWine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => winesApi.remove(id),
    onSuccess: () => {
      // Invalidate list queries so the deleted wine disappears
      queryClient.invalidateQueries({ queryKey: ['wines'] });
    },
  });
}
