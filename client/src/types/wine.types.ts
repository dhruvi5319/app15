export type WineStatus = 'active' | 'consumed' | 'removed';

// Full wine record as returned by GET /wines/:id
export interface Wine {
  id: string;
  user_id: string;
  name: string;
  producer: string | null;
  vintage: number | null;
  varietal: string | null;
  region: string | null;
  bottle_count: number;
  status: WineStatus;
  tasting_notes: string | null;
  rating: number | null;
  status_changed_at: string | null;
  date_added: string;
  date_updated: string;
  deleted_at: string | null;
}

// Subset returned in list responses
export interface WineListItem {
  id: string;
  name: string;
  producer: string | null;
  vintage: number | null;
  varietal: string | null;
  region: string | null;
  bottle_count: number;
  status: WineStatus;
  rating: number | null;
  date_added: string;
  date_updated: string;
}

export interface PaginationMeta {
  total: number;
  page: number;
  per_page: number;
  total_pages: number;
}

export interface WineListResponse {
  results: WineListItem[];
  pagination: PaginationMeta;
}

export type SortField = 'name' | 'vintage' | 'producer' | 'date_added';
export type SortDirection = 'asc' | 'desc';
export type StatusFilter = WineStatus | 'all';

export interface WineQueryParams {
  page?: number;
  per_page?: number;
  sort?: SortField;
  direction?: SortDirection;
  status?: StatusFilter;
  q?: string;
  varietal?: string;
  region?: string;
  producer?: string;
  vintage?: number;
  vintage_from?: number;
  vintage_to?: number;
}

export interface CreateWineInput {
  name: string;
  producer?: string | null;
  vintage?: number | null;
  varietal?: string | null;
  region?: string | null;
  bottle_count?: number;
  tasting_notes?: string | null;
  rating?: number | null;
}

export interface UpdateWineInput {
  name?: string;
  producer?: string | null;
  vintage?: number | null;
  varietal?: string | null;
  region?: string | null;
  bottle_count?: number;
  tasting_notes?: string | null;
  rating?: number | null;
}

export interface BottleCountResult {
  id: string;
  bottle_count: number;
  zero_bottle_flag: boolean;
  date_updated: string;
}
