export type WineStatus = 'active' | 'consumed' | 'removed';

// Full wine record as stored in DB (all columns)
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
  status_changed_at: Date | null;
  date_added: Date;
  date_updated: Date;
  deleted_at: Date | null;
}

// Subset returned in list responses (at-a-glance fields)
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
  date_added: Date;
  date_updated: Date;
}

// Pagination envelope
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

// Query options for GET /wines
export interface QueryOptions {
  page: number;
  per_page: number;
  sort: 'name' | 'vintage' | 'producer' | 'date_added';
  direction: 'asc' | 'desc';
  status: WineStatus | 'all';
  q?: string;
  varietal?: string;
  region?: string;
  producer?: string;
  vintage?: number;
  vintage_from?: number;
  vintage_to?: number;
}

// Response shape for bottle-count endpoint
export interface BottleCountResult {
  id: string;
  bottle_count: number;
  zero_bottle_flag: boolean;
  date_updated: Date;
}

// Input types for create / update
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
