import { useQuery } from '@tanstack/react-query';
import { winesApi } from '../api/wines.api';
import type { WineQueryParams } from '../types/wine.types';

export function useWines(params: WineQueryParams = {}) {
  return useQuery({
    queryKey: ['wines', params],
    queryFn: () => winesApi.getAll(params),
    staleTime: 30_000,
  });
}
