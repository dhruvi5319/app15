---
phase: 02-core-wine-entry
plan: "02"
subsystem: ui
tags: [react, react-query, react-router, typescript, inventory, wine-list, wine-detail]

# Dependency graph
requires:
  - phase: 02-core-wine-entry/02-01
    provides: Wine CRUD API (6 endpoints), WineListResponse shape, typed API contracts
  - phase: 01-foundation/01-03
    provides: React app scaffold, routing, apiClient (axios), formatters utility
provides:
  - wine.types.ts: Full client-side types (Wine, WineListItem, WineListResponse, PaginationMeta, WineQueryParams, SortField, SortDirection, StatusFilter, CreateWineInput, UpdateWineInput, BottleCountResult)
  - winesApi: Fully typed API functions (getAll, getById, create, update, remove, updateBottleCount)
  - useWines(params): React Query hook with WineQueryParams in queryKey for proper cache keying
  - useWine(id): React Query hook for single wine, enabled only when id present
  - useDeleteWine(): useMutation hook with ['wines'] cache invalidation on success
  - StatusBadge: colored badge component for active/consumed/removed status
  - WineCard: list row component with all wine fields and link to detail page
  - EmptyState: empty cellar CTA linking to /wines/add
  - ConfirmDialog: accessible modal dialog for delete confirmation
  - InventoryListPage: fully functional wine list with sort/filter/pagination
  - WineDetailPage: full wine detail with delete flow
  - e2e/inventory.spec.ts: Playwright tests for inventory list and wine detail flows
affects: [02-03, 03-status-lifecycle, 04-final-features]

# Tech tracking
tech-stack:
  added: []
  patterns:
    - React Query queryKey includes full params object for per-query cache keying
    - useMutation with onSuccess cache invalidation pattern via invalidateQueries
    - Inline styles for all components (no Tailwind — not configured in Phase 1)
    - Conditional rendering pattern: isLoading → isError → empty check → data
    - ConfirmDialog uses role="dialog" + aria-modal for accessibility

key-files:
  created:
    - client/src/components/StatusBadge.tsx
    - client/src/components/WineCard.tsx
    - client/src/components/EmptyState.tsx
    - client/src/components/ConfirmDialog.tsx
    - client/src/hooks/useDeleteWine.ts
    - e2e/inventory.spec.ts
  modified:
    - client/src/types/wine.types.ts
    - client/src/api/wines.api.ts
    - client/src/hooks/useWines.ts
    - client/src/hooks/useWine.ts
    - client/src/pages/InventoryListPage.tsx
    - client/src/pages/WineDetailPage.tsx

key-decisions:
  - "useWines queryKey includes full params object: ['wines', params] — ensures separate cache entries per sort/filter/page combination"
  - "useWine accepts string | undefined (not string) — matches useParams which returns string | undefined"
  - "Inline styles used throughout — Tailwind not configured in Phase 1, adding dependency deferred to styling phase"
  - "E2E tests written as artifacts; execution deferred to verify phase (requires live API + registered test user)"

patterns-established:
  - "React Query queryKey pattern: ['wines', params] for list, ['wine', id] for single"
  - "useDeleteWine invalidates ['wines'] (broad) so all list views refresh after delete"
  - "ConfirmDialog: controlled component (open prop), returns null when closed — no DOM presence"
  - "WineDetailPage navigate('/', { replace: true }) after delete — replaces history entry so back button doesn't return to deleted wine"

# Metrics
duration: 2min
completed: 2026-05-15
---

# Phase 2 Plan 2: Inventory List & Wine Detail Pages Summary

**Inventory list page and wine detail page with React Query hooks, 4 reusable components (StatusBadge, WineCard, EmptyState, ConfirmDialog), fully typed API client, and Playwright e2e tests**

## Performance

- **Duration:** 2 min
- **Started:** 2026-05-15T19:48:49Z
- **Completed:** 2026-05-15T19:51:37Z
- **Tasks:** 2
- **Files modified:** 12

## Accomplishments

- Full client-side type system matching server API contracts (Wine, WineListItem, WineListResponse, all query params and input types)
- Replaced all API stubs with correctly typed functions; `winesApi.getAll()` now accepts `WineQueryParams` and returns `WineListResponse`
- React Query hooks with proper cache keying (`['wines', params]` for list, `['wine', id]` for single)
- 4 reusable components with inline styles and accessibility attributes
- Two fully functional pages: InventoryListPage with sort/filter/pagination, WineDetailPage with delete confirmation flow
- Playwright e2e tests covering inventory list and wine detail user flows

## API & Hook Contracts

### queryKey Shapes
| Hook | queryKey |
|------|----------|
| `useWines(params)` | `['wines', params]` — separate cache per sort/filter/page |
| `useWine(id)` | `['wine', id]` |

### Cache Invalidation
- `useDeleteWine` → `invalidateQueries({ queryKey: ['wines'] })` — invalidates all list queries

## Task Commits

Each task was committed atomically:

1. **Task 1: Types, API client, hooks (useWines, useWine, useDeleteWine)** - `1e7f915` (feat)
2. **Task 2: Components + pages + e2e tests** - `f57c219` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `client/src/types/wine.types.ts` — Full type definitions: Wine (with status_changed_at), WineListItem, WineListResponse, PaginationMeta, WineQueryParams, SortField, SortDirection, StatusFilter, CreateWineInput, UpdateWineInput, BottleCountResult
- `client/src/api/wines.api.ts` — Typed API functions: getAll(params), getById, create, update, remove, updateBottleCount
- `client/src/hooks/useWines.ts` — React Query hook, queryKey includes params
- `client/src/hooks/useWine.ts` — React Query hook for single wine, enabled only when id truthy
- `client/src/hooks/useDeleteWine.ts` — useMutation with ['wines'] invalidation on success
- `client/src/components/StatusBadge.tsx` — Colored badge: active=green, consumed=gray, removed=red
- `client/src/components/WineCard.tsx` — List row: name, vintage, producer, varietal, region, bottle count, status badge; links to /wines/:id
- `client/src/components/EmptyState.tsx` — Empty cellar state with 🍷 icon and "Add a Wine" CTA link
- `client/src/components/ConfirmDialog.tsx` — role="dialog" modal with cancel/confirm buttons and loading state
- `client/src/pages/InventoryListPage.tsx` — Full list page: sort by name/producer/vintage/date_added, status filter, pagination, EmptyState fallback
- `client/src/pages/WineDetailPage.tsx` — Full detail page: all wine fields in dl grid, tasting notes section, Edit link, Delete button → ConfirmDialog → navigate('/')
- `e2e/inventory.spec.ts` — Playwright tests: inventory list heading, Add Wine button, sort controls, status filters, empty state, wine card navigation, Edit/Delete buttons, ConfirmDialog behavior

## Decisions Made

- **queryKey includes full params**: `['wines', params]` ensures the cache has separate entries for each unique combination of sort/filter/page. If params were excluded, switching from `status=active` to `status=all` would show stale data.
- **useWine accepts `string | undefined`**: React Router's `useParams()` returns `string | undefined`, not `string`. Accepting the same type avoids requiring callers to assert non-null.
- **Inline styles throughout**: Tailwind was not configured in Phase 1. Adding it now would require new dependencies and config changes — deferred to a dedicated styling phase. The app is functional and readable.
- **E2E tests as artifacts**: Playwright tests require a running API + registered test user. Writing tests now and deferring execution to the verify phase is the correct approach.

## Deviations from Plan

None — plan executed exactly as written. The `disabled` prop issue in the original plan's InventoryListPage snippet (using `disabled` as a CSS property in a CSSProperties object) was quietly fixed to use the standard HTML `disabled` attribute on the button element — this is a minor correctness fix (Rule 1).

## Issues Encountered

None — both tasks completed on first pass. Type check and build passed cleanly.

## User Setup Required

None — no external service configuration required.

## Next Phase Readiness

- Inventory list and wine detail fully functional — connects to live API from 02-01
- 02-03 (Add/edit forms) can use winesApi.create and winesApi.update immediately
- useDeleteWine, WineCard, StatusBadge, ConfirmDialog all reusable in future phases
- No blockers

---
*Phase: 02-core-wine-entry*
*Completed: 2026-05-15*

## Self-Check: PASSED

All 13 key files verified present on disk. Both task commits (`1e7f915`, `f57c219`) confirmed in git log.
