import { db } from '../config/db';
import type {
  Wine,
  WineListItem,
  CreateWineInput,
  UpdateWineInput,
  BottleCountResult,
} from '../types/wine.types';

// Columns returned for list items (excludes heavy fields like tasting_notes)
const LIST_COLUMNS: (keyof WineListItem)[] = [
  'id', 'name', 'producer', 'vintage', 'varietal', 'region',
  'bottle_count', 'status', 'rating', 'date_added', 'date_updated',
];

export const winesRepo = {
  async create(userId: string, data: CreateWineInput): Promise<Wine> {
    const [wine] = await db<Wine>('wines')
      .insert({
        user_id: userId,
        name: data.name,
        producer: data.producer ?? null,
        vintage: data.vintage ?? null,
        varietal: data.varietal ?? null,
        region: data.region ?? null,
        bottle_count: data.bottle_count ?? 1,
        tasting_notes: data.tasting_notes ?? null,
        rating: data.rating ?? null,
      })
      .returning('*');
    return wine;
  },

  async findById(id: string, userId: string): Promise<Wine | undefined> {
    return db<Wine>('wines')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .first();
  },

  async findByIdAnyUser(id: string): Promise<Wine | undefined> {
    return db<Wine>('wines')
      .where({ id })
      .whereNull('deleted_at')
      .first();
  },

  async update(id: string, userId: string, data: UpdateWineInput): Promise<Wine | undefined> {
    const updatePayload: Record<string, unknown> = {
      date_updated: new Date(),
    };

    // Only include fields that are explicitly provided (not undefined)
    for (const [k, v] of Object.entries(data)) {
      if (v !== undefined) {
        updatePayload[k] = v;
      }
    }

    const [wine] = await db<Wine>('wines')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update(updatePayload)
      .returning('*');
    return wine;
  },

  async delete(id: string, userId: string): Promise<boolean> {
    const count = await db('wines')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .delete();
    return count > 0;
  },

  async updateBottleCount(
    id: string,
    userId: string,
    action: 'increment' | 'decrement'
  ): Promise<BottleCountResult | null> {
    const delta = action === 'increment' ? 1 : -1;
    const [result] = await db<Wine>('wines')
      .where({ id, user_id: userId })
      .whereNull('deleted_at')
      .update({
        bottle_count: db.raw('bottle_count + ?', [delta]),
        date_updated: new Date(),
      })
      .returning(['id', 'bottle_count', 'date_updated']);

    if (!result) return null;

    return {
      id: result.id,
      bottle_count: result.bottle_count,
      zero_bottle_flag: result.bottle_count === 0,
      date_updated: result.date_updated,
    };
  },

  // Expose LIST_COLUMNS for use in search service
  listColumns: LIST_COLUMNS,
};
