import { useQuery } from '@tanstack/react-query';
import { winesApi } from '../api/wines.api';

export function useWine(id: string | undefined) {
  return useQuery({
    queryKey: ['wine', id],
    queryFn: () => winesApi.getById(id!),
    enabled: Boolean(id),
    staleTime: 30_000,
  });
}
