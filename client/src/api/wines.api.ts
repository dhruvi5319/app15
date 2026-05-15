import { apiClient } from './client';
import type { Wine } from '../types/wine.types';

// Stubs — implemented fully in Phase 2 (plan 02-01)
export const winesApi = {
  getAll: (): Promise<Wine[]> =>
    apiClient.get('/api/v1/wines').then((r) => r.data),

  getById: (id: string): Promise<Wine> =>
    apiClient.get(`/api/v1/wines/${id}`).then((r) => r.data),

  create: (data: Partial<Wine>): Promise<Wine> =>
    apiClient.post('/api/v1/wines', data).then((r) => r.data),

  update: (id: string, data: Partial<Wine>): Promise<Wine> =>
    apiClient.patch(`/api/v1/wines/${id}`, data).then((r) => r.data),

  remove: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/wines/${id}`).then(() => undefined),
};
