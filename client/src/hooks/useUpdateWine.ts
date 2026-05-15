import { useMutation, useQueryClient } from '@tanstack/react-query';
import { winesApi } from '../api/wines.api';
import type { UpdateWineInput } from '../types/wine.types';

export function useUpdateWine(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: UpdateWineInput) => winesApi.update(id, data),
    onSuccess: (updatedWine) => {
      // Update the specific wine in cache so detail page reflects change immediately
      queryClient.setQueryData(['wine', id], updatedWine);
      // Invalidate list so the row refreshes
      queryClient.invalidateQueries({ queryKey: ['wines'] });
    },
  });
}
