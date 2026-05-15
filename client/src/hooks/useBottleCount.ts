import { useMutation, useQueryClient } from '@tanstack/react-query';
import { winesApi } from '../api/wines.api';
import type { Wine } from '../types/wine.types';

export function useBottleCount(wineId: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (action: 'increment' | 'decrement') =>
      winesApi.updateBottleCount(wineId, action),

    // Optimistic update: immediately change the count in cache
    onMutate: async (action) => {
      // Cancel any outgoing refetches for this wine
      await queryClient.cancelQueries({ queryKey: ['wine', wineId] });

      // Snapshot the previous value
      const previousWine = queryClient.getQueryData<Wine>(['wine', wineId]);

      // Optimistically update
      if (previousWine) {
        const delta = action === 'increment' ? 1 : -1;
        queryClient.setQueryData<Wine>(['wine', wineId], {
          ...previousWine,
          bottle_count: previousWine.bottle_count + delta,
        });
      }

      return { previousWine };
    },

    // On success: update cache with server response (authoritative)
    onSuccess: (result) => {
      queryClient.setQueryData<Partial<Wine>>(['wine', wineId], (old) =>
        old
          ? {
              ...old,
              bottle_count: result.bottle_count,
              date_updated: result.date_updated,
            }
          : old
      );
      // Invalidate list so bottle count in list row also updates
      queryClient.invalidateQueries({ queryKey: ['wines'] });
    },

    // On error: revert to snapshot
    onError: (_err, _action, context) => {
      if (context?.previousWine) {
        queryClient.setQueryData(['wine', wineId], context.previousWine);
      }
    },
  });
}
