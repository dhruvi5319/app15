---
phase: 02-core-wine-entry
plan: "01"
subsystem: api
tags: [knex, postgresql, express, zod, jwt, tsvector, wine-crud, integration-tests]

# Dependency graph
requires:
  - phase: 01-foundation/01-02
    provides: Express app factory, Knex db instance, authenticate middleware, validate middleware, JWT auth API
provides:
  - Migration 007: status_changed_at TIMESTAMPTZ column on wines table
  - Full Wine CRUD API: GET /api/v1/wines, POST, GET/:id, PATCH/:id, DELETE/:id, PATCH/:id/bottle-count
  - wine.types.ts: Wine, WineListItem, WineListResponse, PaginationMeta, QueryOptions, BottleCountResult, CreateWineInput, UpdateWineInput
  - winesRepo: Knex queries for all wine CRUD operations
  - searchService: full-text search + filter/sort/pagination for wine list
  - winesService: business rules (ownership, validation, status guard, COUNT_BELOW_ZERO)
  - winesController: Express layer with UUID validation
  - winesRouter: Zod schemas + 6 routes
  - 25 passing integration tests
affects: [02-02, 02-03, 03-status-lifecycle, 04-final-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - Same layered architecture as auth: types → repo → service → controller → routes
    - Repository pattern extended to winesRepo with updateBottleCount using raw SQL delta
    - Separate searchService for complex query-building (filter/sort/pagination/full-text)
    - Error pattern: statusCode + code properties on thrown Error objects
    - UUID validation at controller boundary before service call
    - Zod strips unknown fields (status protected from PATCH by schema exclusion → 422 on empty body)

key-files:
  created:
    - server/migrations/20240101000007_add_status_changed_at.ts
    - server/src/types/wine.types.ts
    - server/src/repositories/wines.repo.ts
    - server/src/services/search.service.ts
    - server/src/services/wines.service.ts
    - server/src/controllers/wines.controller.ts
    - server/src/routes/wines.routes.ts
    - server/tests/integration/wines.test.ts
  modified:
    - server/src/app.ts

key-decisions:
  - "searchService separated from winesService to isolate complex query-building from business rules"
  - "UUID validation at controller level returns 400 INVALID_ID before hitting service"
  - "status field protected via Zod schema omission (not via explicit guard in service)"
  - "tasting_notes empty string sanitized to null in both create and update paths"

patterns-established:
  - "winesRepo.updateBottleCount uses db.raw('bottle_count + ?', [delta]) for atomic DB operation"
  - "searchService.findAll clones query before count to avoid pagination affecting total count"
  - "Ownership check pattern: findByIdAnyUser → check user_id → 403 FORBIDDEN if mismatch"

# Metrics
duration: 3min
completed: 2026-05-15
---

# Phase 2 Plan 1: Wine CRUD API Summary

**Full Wine CRUD API (6 endpoints) with PostgreSQL full-text search, Knex repository + search service, Zod validation, ownership enforcement, and 25/25 integration tests passing**

## Performance

- **Duration:** 3 min
- **Started:** 2026-05-15T19:43:11Z
- **Completed:** 2026-05-15T19:46:37Z
- **Tasks:** 3
- **Files modified:** 8 created + 1 modified = 9 total

## Accomplishments

- Migration 007 adds `status_changed_at TIMESTAMPTZ` (nullable) to wines table — needed by Phase 3/4 status transitions
- Full Wine CRUD API with 6 endpoints all scoped to authenticated user (ownership enforced via 403 FORBIDDEN)
- PostgreSQL full-text search via `search_vector @@ plainto_tsquery` with status/varietal/region/producer/vintage filters
- Business rules: name required + trim, vintage 1800–currentYear+5, rating 1–5, tasting_notes="" → null, status immutable via PATCH, COUNT_BELOW_ZERO at 0
- 25/25 integration tests passing in 2.7s

## API Endpoint Contracts (for 02-02/02-03 frontend reference)

| Endpoint | Method | Auth | Request | Response |
|----------|--------|------|---------|----------|
| `/api/v1/wines` | GET | Bearer | `?page&per_page&sort&direction&status&q&varietal&region&producer&vintage` | 200 `{results: WineListItem[], pagination: {total, page, per_page, total_pages}}` |
| `/api/v1/wines` | POST | Bearer | `{name, producer?, vintage?, varietal?, region?, bottle_count?, tasting_notes?, rating?}` | 201 `Wine` |
| `/api/v1/wines/:id` | GET | Bearer | — | 200 `Wine` \| 404 NOT_FOUND \| 403 FORBIDDEN |
| `/api/v1/wines/:id` | PATCH | Bearer | `{name?, producer?, vintage?, varietal?, region?, bottle_count?, tasting_notes?, rating?}` | 200 `Wine` |
| `/api/v1/wines/:id` | DELETE | Bearer | — | 204 |
| `/api/v1/wines/:id/bottle-count` | PATCH | Bearer | `{action: "increment" \| "decrement"}` | 200 `{id, bottle_count, zero_bottle_flag, date_updated}` |

**Default query params:** `page=1`, `per_page=20`, `sort=date_added`, `direction=desc`, `status=active`

**Error codes in use:**
- `NOT_FOUND` — 404 (wine not found)
- `FORBIDDEN` — 403 (cross-user access attempt)
- `INVALID_ID` — 400 (wine_id not a valid UUID)
- `VALIDATION_ERROR` — 422 (name empty, vintage out of range, rating > 5, etc.)
- `COUNT_BELOW_ZERO` — 422 (decrement at bottle_count=0)

## Exported Types from wine.types.ts

For 02-02 and 02-03 frontend plans to reference:
- `WineStatus` — `'active' | 'consumed' | 'removed'`
- `Wine` — full DB record (all columns including status_changed_at, tasting_notes)
- `WineListItem` — list subset (excludes tasting_notes, status_changed_at)
- `WineListResponse` — `{results: WineListItem[], pagination: PaginationMeta}`
- `PaginationMeta` — `{total, page, per_page, total_pages}`
- `QueryOptions` — all GET /wines query params typed
- `BottleCountResult` — `{id, bottle_count, zero_bottle_flag, date_updated}`
- `CreateWineInput` — POST body shape
- `UpdateWineInput` — PATCH body shape

## Task Commits

Each task was committed atomically:

1. **Task 1: Migration 007 + full wine.types.ts** - `f58d1db` (feat)
2. **Task 2: Wine repository + search service** - `744415d` (feat)
3. **Task 3: Wine service, controller, routes, app.ts + integration tests** - `7049d4c` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `server/migrations/20240101000007_add_status_changed_at.ts` — Adds status_changed_at TIMESTAMPTZ column to wines table
- `server/src/types/wine.types.ts` — Full type definitions: Wine, WineListItem, WineListResponse, PaginationMeta, QueryOptions, BottleCountResult, CreateWineInput, UpdateWineInput
- `server/src/repositories/wines.repo.ts` — Knex CRUD queries: create, findById, findByIdAnyUser, update, delete, updateBottleCount
- `server/src/services/search.service.ts` — Complex list query with full-text search, filters, sort, pagination
- `server/src/services/wines.service.ts` — Business rules: validation, ownership, status guard, COUNT_BELOW_ZERO
- `server/src/controllers/wines.controller.ts` — Express controllers with UUID validation, delegates to winesService
- `server/src/routes/wines.routes.ts` — Zod schemas + 6 route definitions, all behind authenticate middleware
- `server/src/app.ts` — Added winesRouter import + mount at /api/v1/wines
- `server/tests/integration/wines.test.ts` — 25 integration tests covering all endpoints

## Decisions Made

- **searchService separated from winesService**: The complex query-building (filters, sort, pagination, full-text) is isolated in its own service to keep winesService focused on business rules. This also makes the search logic independently testable.
- **UUID validation at controller boundary**: Invalid UUIDs return 400 INVALID_ID before reaching the service layer — avoids polluting business logic with format validation.
- **Status protection via Zod schema**: `status` is not in `updateWineSchema`, so Zod strips it as an unknown field. If only `status` is sent, the body becomes `{}` and the refine check `Object.keys(data).length > 0` rejects it → 422. No explicit guard needed in service.

## Deviations from Plan

None — plan executed exactly as written.

## Issues Encountered

None — all 3 tasks completed successfully on first pass. 25/25 integration tests passed.

## Integration Test Results

```
Tests:       25 passed, 25 total
Test Suites: 1 passed, 1 total
Time:        2.688s
```

| Test Suite | Tests | Status |
|------------|-------|--------|
| POST /api/v1/wines | 6 | ✅ all pass |
| GET /api/v1/wines | 4 | ✅ all pass |
| GET /api/v1/wines/:wine_id | 4 | ✅ all pass |
| PATCH /api/v1/wines/:wine_id | 4 | ✅ all pass |
| DELETE /api/v1/wines/:wine_id | 2 | ✅ all pass |
| PATCH /api/v1/wines/:wine_id/bottle-count | 5 | ✅ all pass |

## User Setup Required

None — no external service configuration required. PostgreSQL connection uses the same DATABASE_URL as Phase 1.

## Next Phase Readiness

- Wine CRUD API complete — 02-02 (Inventory list + detail pages) and 02-03 (Add/edit forms) can use these endpoints immediately
- All 6 endpoint contracts documented above for frontend reference
- Error codes documented for frontend error handling
- `req.user.id` ownership enforcement tested and working
- No blockers

---
*Phase: 02-core-wine-entry*
*Completed: 2026-05-15*

## Self-Check: PASSED

All 9 key files verified present on disk. All 3 task commits (`f58d1db`, `744415d`, `7049d4c`) confirmed in git log.
