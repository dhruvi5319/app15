import { useQuery } from '@tanstack/react-query';
import { winesApi } from '../api/wines.api';

export function useWines() {
  return useQuery({
    queryKey: ['wines'],
    queryFn: winesApi.getAll,
  });
}
