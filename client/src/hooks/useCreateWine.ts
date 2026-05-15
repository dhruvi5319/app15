import { useMutation, useQueryClient } from '@tanstack/react-query';
import { winesApi } from '../api/wines.api';
import type { CreateWineInput } from '../types/wine.types';

export function useCreateWine() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateWineInput) => winesApi.create(data),
    onSuccess: () => {
      // Invalidate list queries so the new wine appears
      queryClient.invalidateQueries({ queryKey: ['wines'] });
    },
  });
}
