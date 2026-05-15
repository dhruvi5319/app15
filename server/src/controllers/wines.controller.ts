import { Request, Response, NextFunction } from 'express';
import { winesService } from '../services/wines.service';
import type { QueryOptions } from '../types/wine.types';

// Parse and coerce list query params
function parseListQuery(query: Record<string, unknown>): QueryOptions {
  const page = Math.max(1, parseInt(String(query.page ?? '1'), 10) || 1);
  const per_page = Math.min(100, Math.max(1, parseInt(String(query.per_page ?? '20'), 10) || 20));
  const sort = (['name', 'vintage', 'producer', 'date_added'] as const).includes(
    query.sort as QueryOptions['sort']
  )
    ? (query.sort as QueryOptions['sort'])
    : 'date_added';
  const direction = query.direction === 'asc' ? 'asc' : 'desc';
  const status = (['active', 'consumed', 'removed', 'all'] as const).includes(
    query.status as QueryOptions['status']
  )
    ? (query.status as QueryOptions['status'])
    : 'active';

  const opts: QueryOptions = { page, per_page, sort, direction, status };

  if (query.q) opts.q = String(query.q);
  if (query.varietal) opts.varietal = String(query.varietal);
  if (query.region) opts.region = String(query.region);
  if (query.producer) opts.producer = String(query.producer);
  if (query.vintage) opts.vintage = parseInt(String(query.vintage), 10);
  if (query.vintage_from) opts.vintage_from = parseInt(String(query.vintage_from), 10);
  if (query.vintage_to) opts.vintage_to = parseInt(String(query.vintage_to), 10);

  return opts;
}

// Validate wine_id is UUID
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function requireUuid(id: string | undefined, res: Response): id is string {
  if (!id || !UUID_RE.test(id)) {
    res.status(400).json({ error: { code: 'INVALID_ID', message: 'wine_id must be a valid UUID' } });
    return false;
  }
  return true;
}

export const winesController = {
  async list(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const opts = parseListQuery(req.query as Record<string, unknown>);
      const result = await winesService.list(req.user!.id, opts);
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async create(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const wine = await winesService.create(req.user!.id, req.body);
      res.status(201).json(wine);
    } catch (err) {
      next(err);
    }
  },

  async getById(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!requireUuid(req.params.wine_id, res)) return;
      const wine = await winesService.getById(req.params.wine_id, req.user!.id);
      res.json(wine);
    } catch (err) {
      next(err);
    }
  },

  async update(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!requireUuid(req.params.wine_id, res)) return;
      const wine = await winesService.update(req.params.wine_id, req.user!.id, req.body);
      res.json(wine);
    } catch (err) {
      next(err);
    }
  },

  async delete(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!requireUuid(req.params.wine_id, res)) return;
      await winesService.delete(req.params.wine_id, req.user!.id);
      res.status(204).end();
    } catch (err) {
      next(err);
    }
  },

  async updateBottleCount(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!requireUuid(req.params.wine_id, res)) return;
      const result = await winesService.updateBottleCount(
        req.params.wine_id,
        req.user!.id,
        req.body.action
      );
      res.json(result);
    } catch (err) {
      next(err);
    }
  },

  async updateStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      if (!requireUuid(req.params.wine_id, res)) return;
      const wine = await winesService.updateStatus(
        req.params.wine_id,
        req.user!.id,
        req.body.status
      );
      res.json(wine);
    } catch (err) {
      next(err);
    }
  },
};
