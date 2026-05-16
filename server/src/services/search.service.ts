import { db } from '../config/db';
import type { WineListItem, WineListResponse, QueryOptions } from '../types/wine.types';

// Map sort param to actual column name
const SORT_COLUMN_MAP: Record<QueryOptions['sort'], string> = {
  name: 'name',
  vintage: 'vintage',
  producer: 'producer',
  date_added: 'date_added',
};

export const searchService = {
  async findAll(userId: string, opts: QueryOptions): Promise<WineListResponse> {
    const {
      page,
      per_page,
      sort,
      direction,
      status,
      q,
      varietal,
      region,
      producer,
      vintage,
      vintage_from,
      vintage_to,
    } = opts;

    // Base query — always scope to user and not deleted
    let query = db('wines')
      .where('user_id', userId)
      .whereNull('deleted_at');

    // Status filter: 'all' skips status filtering, otherwise apply exact match
    if (status !== 'all') {
      query = query.where('status', status);
    }

    // Full-text search via tsvector generated column
    if (q && q.trim()) {
      query = query.whereRaw(
        `search_vector @@ plainto_tsquery('english', ?)`,
        [q.trim()]
      );
    }

    // Exact match filters
    if (varietal) query = query.where('varietal', 'ilike', `%${varietal}%`);
    if (region) query = query.where('region', 'ilike', `%${region}%`);
    if (producer) query = query.where('producer', 'ilike', `%${producer}%`);

    // Vintage filters: exact OR range
    if (vintage !== undefined) {
      query = query.where('vintage', vintage);
    } else {
      if (vintage_from !== undefined) query = query.where('vintage', '>=', vintage_from);
      if (vintage_to !== undefined) query = query.where('vintage', '<=', vintage_to);
    }

    // Count total matching rows (clone before pagination)
    const countQuery = query.clone().count<{ count: string }>('* as count').first();
    const countResult = await countQuery;
    const total = parseInt(countResult?.count ?? '0', 10);

    // Sort and paginate
    const sortColumn = SORT_COLUMN_MAP[sort];
    const offset = (page - 1) * per_page;

    const wines = await query
      .clone()
      .select<WineListItem[]>([
        'id', 'name', 'producer', 'vintage', 'varietal', 'region',
        'bottle_count', 'status', 'rating', 'date_added', 'date_updated',
      ])
      .orderBy(sortColumn, direction)
      .limit(per_page)
      .offset(offset);

    return {
      results: wines,
      pagination: {
        total,
        page,
        per_page,
        total_pages: Math.ceil(total / per_page),
      },
    };
  },
};
