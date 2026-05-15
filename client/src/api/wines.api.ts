import { apiClient } from './client';
import type {
  Wine,
  WineListResponse,
  WineQueryParams,
  CreateWineInput,
  UpdateWineInput,
  BottleCountResult,
  WineStatus,
} from '../types/wine.types';

export const winesApi = {
  // GET /api/v1/wines — paginated, filterable, sortable list
  getAll: (params: WineQueryParams = {}): Promise<WineListResponse> =>
    apiClient
      .get<WineListResponse>('/api/v1/wines', { params })
      .then((r) => r.data),

  // GET /api/v1/wines/:id — full wine record
  getById: (id: string): Promise<Wine> =>
    apiClient.get<Wine>(`/api/v1/wines/${id}`).then((r) => r.data),

  // POST /api/v1/wines — create wine (name required, rest optional)
  create: (data: CreateWineInput): Promise<Wine> =>
    apiClient.post<Wine>('/api/v1/wines', data).then((r) => r.data),

  // PATCH /api/v1/wines/:id — partial update
  update: (id: string, data: UpdateWineInput): Promise<Wine> =>
    apiClient.patch<Wine>(`/api/v1/wines/${id}`, data).then((r) => r.data),

  // DELETE /api/v1/wines/:id — hard delete, returns 204
  remove: (id: string): Promise<void> =>
    apiClient.delete(`/api/v1/wines/${id}`).then(() => undefined),

  // PATCH /api/v1/wines/:id/bottle-count — increment or decrement
  updateBottleCount: (
    id: string,
    action: 'increment' | 'decrement'
  ): Promise<BottleCountResult> =>
    apiClient
      .patch<BottleCountResult>(`/api/v1/wines/${id}/bottle-count`, { action })
      .then((r) => r.data),

  // PATCH /api/v1/wines/:id/status — status transition (active↔consumed/removed)
  updateStatus: (id: string, status: WineStatus): Promise<Wine> =>
    apiClient
      .patch<Wine>(`/api/v1/wines/${id}/status`, { status })
      .then((r) => r.data),
};
