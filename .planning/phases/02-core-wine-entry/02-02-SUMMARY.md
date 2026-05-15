---
phase: 02-core-wine-entry
plan: "02"
subsystem: ui
tags: [react, react-query, zustand, axios, inventory-list, wine-detail, components]

requires:
  - phase: 02-core-wine-entry/02-01
    provides: Wine CRUD API endpoints, wine types
  - phase: 01-foundation/01-03
    provides: apiClient, authStore, React Router routing
provides:
  - client/src/types/wine.types.ts: full Wine, WineListItem, WineQueryParams, etc.
  - client/src/api/wines.api.ts: getAll, getById, create, update, remove, updateBottleCount
  - useWines(params): React Query list hook with all filter/sort/pagination params
  - useWine(id): React Query single wine hook
  - useDeleteWine(): useMutation with wines cache invalidation
  - InventoryListPage: sort, status filter, paginated list, empty state, add button
  - WineDetailPage: all fields, tasting notes, edit link, delete with ConfirmDialog
  - WineCard: list row with name, producer, vintage, varietal, bottle count, status badge
  - EmptyState: cellar empty CTA with link to /wines/add
  - StatusBadge: active (green), consumed (gray), removed (red) pill badges
  - ConfirmDialog: modal with cancel/confirm, loading state
  - e2e/inventory.spec.ts: 8 Playwright tests (deferred execution to verify phase)
affects: [02-03, 03-01, 04-01]

tech-stack:
  patterns:
    - useWines accepts WineQueryParams; queryKey includes params for cache granularity
    - useWine enabled only when id is defined (prevents blank requests)
    - useDeleteWine invalidates ['wines'] queryKey on success
    - WineDetailPage: handleDelete navigates to / on success; error shown inline
    - ConfirmDialog: role="dialog" aria-modal="true" for accessibility

key-files:
  modified:
    - client/src/types/wine.types.ts (full update — dates as ISO strings on client)
    - client/src/api/wines.api.ts (replaced stubs)
    - client/src/hooks/useWines.ts (real implementation)
    - client/src/hooks/useWine.ts (real implementation)
    - client/src/pages/InventoryListPage.tsx (full implementation)
    - client/src/pages/WineDetailPage.tsx (full implementation)
  created:
    - client/src/hooks/useDeleteWine.ts
    - client/src/components/StatusBadge.tsx
    - client/src/components/WineCard.tsx
    - client/src/components/EmptyState.tsx
    - client/src/components/ConfirmDialog.tsx
    - e2e/inventory.spec.ts

key-decisions:
  - "Inline styles only (no Tailwind) — consistent with Phase 1 scaffold"
  - "WineCard links directly to /wines/:id — no onClick needed, Link component handles navigation"
  - "InventoryListPage pagination hides prev/next when total_pages <= 1"
  - "E2E tests guard against empty inventory (test.skip if no wines)"

duration: ~8min
completed: 2026-05-15
---

# Phase 2 Plan 2: Inventory List + Wine Detail Pages Summary

**Full inventory list with sort/filter/pagination, wine detail with all fields + delete flow, 4 shared components, React Query hooks — client build passes clean**

## Performance

- **Duration:** ~8min
- **Tasks:** 2
- **Files created:** 7 new + 5 modified = 12 total

## Accomplishments

- client wine.types.ts fully typed (dates as ISO strings for client)
- winesApi with 6 typed functions matching server endpoints exactly
- useWines hook with full WineQueryParams support and per-params cache key
- useWine(id) with enabled guard
- useDeleteWine mutation with cache invalidation
- InventoryListPage: sort (4 fields, toggle direction), status filter tabs, paginated list, empty state
- WineDetailPage: full field display, tasting notes section, edit link, delete with confirmation
- WineCard: compact row with all at-a-glance fields + status badge
- EmptyState: "Your cellar is empty" with CTA to /wines/add
- StatusBadge: color-coded pill (green=active, gray=consumed, red=removed)
- ConfirmDialog: ARIA-compliant modal with loading state
- Playwright inventory.spec.ts: 8 tests (deferred execution to verify phase)

## Task Commits

1. `5a21bb1` — feat(02-02): client wine types, API functions, React Query hooks
2. `088dd47` — feat(02-02): InventoryListPage, WineDetailPage, WineCard, EmptyState, StatusBadge, ConfirmDialog

## Verification

- `npm run type-check` — exits 0 ✅
- `npm run build` — exits 0, Vite produces dist/ ✅

## Deviations from Plan

None. All components and pages implemented exactly as planned.

---
*Phase: 02-core-wine-entry*
*Completed: 2026-05-15*

## Self-Check: PASSED

All 12 files present. TypeScript clean. Build clean.
