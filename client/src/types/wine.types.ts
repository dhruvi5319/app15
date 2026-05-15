export type WineStatus = 'active' | 'consumed' | 'removed';

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
  date_added: string;
  date_updated: string;
  deleted_at: string | null;
}
