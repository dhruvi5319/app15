import { winesRepo } from '../repositories/wines.repo';
import { searchService } from './search.service';
import type {
  Wine,
  WineListResponse,
  QueryOptions,
  CreateWineInput,
  UpdateWineInput,
  BottleCountResult,
} from '../types/wine.types';

function makeError(
  message: string,
  statusCode: number,
  code: string
): Error & { statusCode: number; code: string } {
  const err = new Error(message) as Error & { statusCode: number; code: string };
  err.statusCode = statusCode;
  err.code = code;
  return err;
}

function validateVintage(vintage: number | null | undefined): void {
  if (vintage === null || vintage === undefined) return;
  const currentYear = new Date().getFullYear();
  if (!Number.isInteger(vintage) || vintage < 1800 || vintage > currentYear + 5) {
    throw makeError(
      `vintage must be an integer between 1800 and ${currentYear + 5}`,
      422,
      'VALIDATION_ERROR'
    );
  }
}

function validateRating(rating: number | null | undefined): void {
  if (rating === null || rating === undefined) return;
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    throw makeError('rating must be an integer between 1 and 5', 422, 'VALIDATION_ERROR');
  }
}

function sanitizeTastingNotes(notes: string | null | undefined): string | null {
  if (notes === '' || notes === null || notes === undefined) return null;
  return notes;
}

export const winesService = {
  async list(userId: string, opts: QueryOptions): Promise<WineListResponse> {
    return searchService.findAll(userId, opts);
  },

  async create(userId: string, data: CreateWineInput): Promise<Wine> {
    // Validate and sanitize name
    const name = (data.name ?? '').trim();
    if (!name) {
      throw makeError('name is required', 422, 'VALIDATION_ERROR');
    }

    validateVintage(data.vintage);
    validateRating(data.rating);

    const bottle_count = data.bottle_count ?? 1;
    if (!Number.isInteger(bottle_count) || bottle_count < 1 || bottle_count > 9999) {
      throw makeError('bottle_count must be between 1 and 9999', 422, 'VALIDATION_ERROR');
    }

    return winesRepo.create(userId, {
      ...data,
      name,
      tasting_notes: sanitizeTastingNotes(data.tasting_notes),
    });
  },

  async getById(id: string, userId: string): Promise<Wine> {
    // First check if wine exists at all (any user)
    const anyWine = await winesRepo.findByIdAnyUser(id);
    if (!anyWine) {
      throw makeError('Wine not found', 404, 'NOT_FOUND');
    }
    // Check ownership
    if (anyWine.user_id !== userId) {
      throw makeError('Access denied', 403, 'FORBIDDEN');
    }
    return anyWine;
  },

  async update(id: string, userId: string, data: UpdateWineInput): Promise<Wine> {
    // Ownership check
    await winesService.getById(id, userId);

    // Validate fields if provided
    let sanitizedData = { ...data };
    if (sanitizedData.name !== undefined) {
      const name = sanitizedData.name.trim();
      if (!name) throw makeError('name cannot be empty', 422, 'VALIDATION_ERROR');
      sanitizedData = { ...sanitizedData, name };
    }
    if (sanitizedData.vintage !== undefined) validateVintage(sanitizedData.vintage);
    if (sanitizedData.rating !== undefined) validateRating(sanitizedData.rating);

    if (sanitizedData.bottle_count !== undefined) {
      if (!Number.isInteger(sanitizedData.bottle_count) || sanitizedData.bottle_count < 0 || sanitizedData.bottle_count > 9999) {
        throw makeError('bottle_count must be between 0 and 9999', 422, 'VALIDATION_ERROR');
      }
    }

    const finalData: UpdateWineInput = {
      ...sanitizedData,
      tasting_notes: sanitizedData.tasting_notes !== undefined
        ? sanitizeTastingNotes(sanitizedData.tasting_notes)
        : undefined,
    };

    const updated = await winesRepo.update(id, userId, finalData);
    if (!updated) throw makeError('Wine not found', 404, 'NOT_FOUND');
    return updated;
  },

  async delete(id: string, userId: string): Promise<void> {
    // Ownership check
    await winesService.getById(id, userId);
    const deleted = await winesRepo.delete(id, userId);
    if (!deleted) throw makeError('Wine not found', 404, 'NOT_FOUND');
  },

  async updateBottleCount(
    id: string,
    userId: string,
    action: 'increment' | 'decrement'
  ): Promise<BottleCountResult> {
    const wine = await winesService.getById(id, userId);

    if (action === 'decrement' && wine.bottle_count === 0) {
      throw makeError('Cannot decrement bottle count below zero', 422, 'COUNT_BELOW_ZERO');
    }
    if (action === 'increment' && wine.bottle_count >= 9999) {
      throw makeError('bottle_count cannot exceed 9999', 422, 'VALIDATION_ERROR');
    }

    const result = await winesRepo.updateBottleCount(id, userId, action);
    if (!result) throw makeError('Wine not found', 404, 'NOT_FOUND');
    return result;
  },
};
