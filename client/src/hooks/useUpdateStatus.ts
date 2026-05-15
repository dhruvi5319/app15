import { useMutation, useQueryClient } from '@tanstack/react-query';
import { winesApi } from '../api/wines.api';
import type { WineStatus } from '../types/wine.types';

export function useUpdateStatus(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (status: WineStatus) => winesApi.updateStatus(id, status),
    onSuccess: (updatedWine) => {
      // Update the specific wine cache immediately — detail page shows new status without refetch
      queryClient.setQueryData(['wine', id], updatedWine);
      // Invalidate list queries so InventoryListPage and HistoryPage both refresh
      queryClient.invalidateQueries({ queryKey: ['wines'] });
    },
  });
}
