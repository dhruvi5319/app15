import { Router } from 'express';
import { z } from 'zod';
import { authenticate } from '../middleware/auth';
import { validate } from '../middleware/validate';
import { winesController } from '../controllers/wines.controller';

export const winesRouter = Router();

// All wine routes require authentication
winesRouter.use(authenticate);

const MAX_STRING = 255;
const CURRENT_YEAR = new Date().getFullYear();

const createWineSchema = z.object({
  name: z
    .string()
    .min(1, 'name is required')
    .max(MAX_STRING)
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'name cannot be whitespace only'),
  producer: z.string().max(MAX_STRING).nullish(),
  vintage: z
    .number()
    .int()
    .min(1800)
    .max(CURRENT_YEAR + 5)
    .nullish(),
  varietal: z.string().max(MAX_STRING).nullish(),
  region: z.string().max(MAX_STRING).nullish(),
  bottle_count: z.number().int().min(1).max(9999).default(1),
  tasting_notes: z.string().nullish(),
  rating: z.number().int().min(1).max(5).nullish(),
});

const updateWineSchema = z.object({
  name: z
    .string()
    .min(1)
    .max(MAX_STRING)
    .transform((s) => s.trim())
    .refine((s) => s.length > 0, 'name cannot be whitespace only')
    .optional(),
  producer: z.string().max(MAX_STRING).nullish().optional(),
  vintage: z
    .number()
    .int()
    .min(1800)
    .max(CURRENT_YEAR + 5)
    .nullish()
    .optional(),
  varietal: z.string().max(MAX_STRING).nullish().optional(),
  region: z.string().max(MAX_STRING).nullish().optional(),
  bottle_count: z.number().int().min(0).max(9999).optional(),
  tasting_notes: z.string().nullish().optional(),
  rating: z.number().int().min(1).max(5).nullish().optional(),
});

const bottleCountSchema = z.object({
  action: z.enum(['increment', 'decrement']),
});

// GET /api/v1/wines — paginated list with search/filter/sort
winesRouter.get('/', winesController.list);

// POST /api/v1/wines — create wine
winesRouter.post('/', validate(createWineSchema), winesController.create);

// GET /api/v1/wines/:wine_id — get single wine
winesRouter.get('/:wine_id', winesController.getById);

// PATCH /api/v1/wines/:wine_id — update wine fields
winesRouter.patch('/:wine_id', validate(updateWineSchema), winesController.update);

// DELETE /api/v1/wines/:wine_id — delete wine
winesRouter.delete('/:wine_id', winesController.delete);

// PATCH /api/v1/wines/:wine_id/bottle-count — increment or decrement
winesRouter.patch('/:wine_id/bottle-count', validate(bottleCountSchema), winesController.updateBottleCount);
