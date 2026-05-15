---
phase: 02-core-wine-entry
plan: "01"
subsystem: api
tags: [knex, postgresql, express, zod, supertest, wines, crud, search, tsvector]

requires:
  - phase: 01-foundation/01-02
    provides: Auth API, JWT middleware, Knex db instance, validate() middleware
  - phase: 01-foundation/01-01
    provides: Express app factory, monorepo scaffold
provides:
  - Migration 007: status_changed_at TIMESTAMPTZ column on wines
  - Full wine.types.ts: Wine, WineListItem, QueryOptions, BottleCountResult, CreateWineInput, UpdateWineInput
  - winesRepo: create, findById, findByIdAnyUser, update, delete, updateBottleCount
  - searchService: findAll with filter/sort/pagination/tsvector search
  - winesService: list, create, getById, update, delete, updateBottleCount with business rules
  - winesController: list, create, getById, update, delete, updateBottleCount
  - winesRouter: all 6 routes mounted at /api/v1/wines
  - Integration tests: 25/25 passing
affects: [02-02, 02-03, 03-01, 04-01]

tech-stack:
  patterns:
    - Same layered arch as auth: types → repo → service → controller → routes
    - searchService builds Knex query with tsvector full-text search and all filters
    - winesService.getById does 403/404 disambiguation (findByIdAnyUser then ownership check)
    - winesController.requireUuid validates UUID format before DB hit (400 INVALID_ID)
    - updateBottleCount uses db.raw('bottle_count + ?', [delta]) for atomic increment

key-files:
  created:
    - server/migrations/20240101000007_add_status_changed_at.ts
    - server/src/types/wine.types.ts (replaced placeholder)
    - server/src/repositories/wines.repo.ts
    - server/src/services/search.service.ts
    - server/src/services/wines.service.ts
    - server/src/controllers/wines.controller.ts
    - server/src/routes/wines.routes.ts
    - server/tests/integration/wines.test.ts
  modified:
    - server/src/app.ts (winesRouter imported and mounted)

key-decisions:
  - "rating enforced 1-5 at Zod route layer; DDL CHECK 1-100 preserved from TechArch"
  - "tasting_notes: '' stored as null (sanitizeTastingNotes helper)"
  - "status NOT in updateWineSchema — Zod strips it; dedicated /status endpoint in Phase 4"
  - "getById does findByIdAnyUser first, then checks ownership — returns 403 not 404 for foreign wines"

duration: ~8min
completed: 2026-05-15
---

# Phase 2 Plan 1: Wine CRUD API Summary

**Migration 007 (status_changed_at), full Wine CRUD API (6 endpoints), tsvector search, bottle count with optimistic guard, 25/25 integration tests passing**

## Performance

- **Duration:** ~8min
- **Tasks:** 3
- **Files created:** 8 new + 2 modified = 10 total
- **Tests:** 25 passed, 25 total

## Accomplishments

- Migration 007 adds `status_changed_at TIMESTAMPTZ` to wines table (needed by Phase 3/4)
- Full wine.types.ts with all types: Wine, WineListItem, PaginationMeta, WineListResponse, QueryOptions, BottleCountResult, CreateWineInput, UpdateWineInput
- winesRepo: all CRUD + updateBottleCount with atomic raw SQL delta
- searchService: Knex query builder with tsvector `@@ plainto_tsquery`, ILIKE filters, sort, pagination, count
- winesService: business rules — name trim, vintage range, rating 1–5, empty tasting_notes → null, ownership 403/404
- winesController: UUID validation, list query parsing (defaults + coercion), all 6 handlers
- winesRouter: Zod schemas for create, update, bottle-count; all routes; `winesRouter.use(authenticate)` guards all endpoints
- app.ts updated to mount winesRouter

## Endpoint Reference (for 02-02/02-03 frontend)

| Method | Path | Auth | Request | Response |
|--------|------|------|---------|----------|
| `GET` | `/api/v1/wines` | Bearer | query: page, per_page, sort, direction, status, q, varietal, region, producer, vintage, vintage_from, vintage_to | 200 `{results: WineListItem[], pagination: {total, page, per_page, total_pages}}` |
| `POST` | `/api/v1/wines` | Bearer | `{name, producer?, vintage?, varietal?, region?, bottle_count?, tasting_notes?, rating?}` | 201 `Wine` |
| `GET` | `/api/v1/wines/:wine_id` | Bearer | — | 200 `Wine` |
| `PATCH` | `/api/v1/wines/:wine_id` | Bearer | any subset of create fields (no status) | 200 `Wine` |
| `DELETE` | `/api/v1/wines/:wine_id` | Bearer | — | 204 |
| `PATCH` | `/api/v1/wines/:wine_id/bottle-count` | Bearer | `{action: "increment"\|"decrement"}` | 200 `{id, bottle_count, zero_bottle_flag, date_updated}` |

## Error Codes

| Code | HTTP | Description |
|------|------|-------------|
| `NOT_FOUND` | 404 | Wine does not exist |
| `FORBIDDEN` | 403 | Wine belongs to another user |
| `INVALID_ID` | 400 | wine_id is not a valid UUID |
| `VALIDATION_ERROR` | 422 | Field validation failure |
| `COUNT_BELOW_ZERO` | 422 | Decrement attempted at bottle_count=0 |

## Exported Types from wine.types.ts

```typescript
WineStatus = 'active' | 'consumed' | 'removed'
Wine { id, user_id, name, producer, vintage, varietal, region, bottle_count, status,
       tasting_notes, rating, status_changed_at, date_added, date_updated, deleted_at }
WineListItem { id, name, producer, vintage, varietal, region, bottle_count, status, rating, date_added, date_updated }
PaginationMeta { total, page, per_page, total_pages }
WineListResponse { results: WineListItem[], pagination: PaginationMeta }
QueryOptions { page, per_page, sort, direction, status, q?, varietal?, region?, producer?, vintage?, vintage_from?, vintage_to? }
BottleCountResult { id, bottle_count, zero_bottle_flag, date_updated }
CreateWineInput { name, producer?, vintage?, varietal?, region?, bottle_count?, tasting_notes?, rating? }
UpdateWineInput { name?, producer?, vintage?, varietal?, region?, bottle_count?, tasting_notes?, rating? }
```

## Integration Test Results

```
Tests: 25 passed, 25 total
Test Suites: 1 passed, 1 total
Time: ~5s
```

All auth tests (10) still pass after changes — no regressions.

## Task Commits

1. `43be44d` — feat(02-01): migration 007 + wine types
2. `cadfce7` — feat(02-01): wine repository + search service
3. `8449986` — feat(02-01): wine service, controller, routes, integration tests

## Deviations from Plan

None. All code implemented exactly as planned. The `updateWineSchema` does not include a `status` field — Zod strips unknown keys, resulting in an empty-body 422 if only status is sent (test verifies this is acceptable behavior).

---
*Phase: 02-core-wine-entry*
*Completed: 2026-05-15*

## Self-Check: PASSED

All 8 key files present on disk. 25/25 tests pass. TypeScript clean.
