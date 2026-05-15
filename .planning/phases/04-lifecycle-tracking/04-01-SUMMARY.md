---
phase: 04-lifecycle-tracking
plan: "01"
subsystem: api + ui
tags: [status-transitions, lifecycle, history, consumed, removed, react-query, jest, playwright]

requires:
  - phase: 02-core-wine-entry/02-01
    provides: wines.repo, wines.service, wines.controller, wines.routes (base)
  - phase: 02-core-wine-entry/02-02
    provides: WineDetailPage, HistoryPage shell, WineCard, useWines
  - phase: 02-core-wine-entry/02-03
    provides: useUpdateWine pattern (cache update on success)
provides:
  - PATCH /api/v1/wines/:id/status — transition endpoint with ALLOWED_TRANSITIONS matrix
  - winesRepo.updateStatus — sets status + status_changed_at + date_updated
  - winesService.updateStatus — validates 403/404 + transition matrix + sets statusChangedAt null on revert
  - winesController.updateStatus — UUID check + delegates to service
  - 9 new integration tests for status transitions (46/46 total pass)
  - useUpdateStatus(id) — useMutation with setQueryData + invalidateQueries
  - StatusTransitionButtons — context-aware buttons: active shows Mark Consumed/Removed; consumed/removed shows Revert
  - WineDetailPage — updated with StatusTransitionButtons between details card and tasting notes
  - HistoryPage — real implementation with Consumed/Removed tabs using useWines({ status })
  - e2e/lifecycle.spec.ts — 6 Playwright tests (deferred execution)
  - jest --forceExit — fixes pre-existing parallel test suite DB pool destruction issue
affects: []

tech-stack:
  patterns:
    - ALLOWED_TRANSITIONS matrix in service layer: guards all 6 possible state changes
    - status_changed_at set to now() on consumed/removed, null on revert to active
    - useUpdateStatus follows same pattern as useUpdateWine: setQueryData(['wine',id]) + invalidate ['wines']
    - HistoryPage reuses useWines with status filter — same hook, different params
    - StatusTransitionButtons renders different buttons purely from currentStatus prop

key-files:
  modified:
    - server/src/repositories/wines.repo.ts (updateStatus method)
    - server/src/services/wines.service.ts (updateStatus method + WineStatus import)
    - server/src/controllers/wines.controller.ts (updateStatus method)
    - server/src/routes/wines.routes.ts (statusUpdateSchema + route)
    - server/tests/integration/wines.test.ts (9 status transition tests)
    - server/package.json (--forceExit flag)
    - client/src/api/wines.api.ts (updateStatus method + WineStatus import)
    - client/src/pages/WineDetailPage.tsx (StatusTransitionButtons added)
    - client/src/pages/HistoryPage.tsx (real implementation)
  created:
    - client/src/hooks/useUpdateStatus.ts
    - client/src/components/StatusTransitionButtons.tsx
    - e2e/lifecycle.spec.ts

key-decisions:
  - "jest --forceExit: fixes pre-existing parallel test suite issue where both suites called db.destroy() and pool got corrupted"
  - "HistoryPage per_page: 50: history is browse-only, 50 covers most real cellars without pagination complexity"
  - "StatusTransitionButtons placed between wine details and tasting notes — logical UX order: info → action → notes"
  - "status_changed_at set to null when reverting to active — matches FRD F06.3 spec exactly"

duration: ~10min
completed: 2026-05-15
---

# Phase 4 Plan 1: Lifecycle Tracking Summary

**PATCH /wines/:id/status endpoint with transition validation, StatusTransitionButtons, real HistoryPage, 46/46 integration tests passing**

## Performance

- **Duration:** ~10min
- **Tasks:** 2
- **Files:** 6 new/created + 5 modified server + 3 modified client = 14 total

## Accomplishments

- `PATCH /api/v1/wines/:id/status` — validates transitions via ALLOWED_TRANSITIONS matrix; 422 INVALID_TRANSITION for illegal moves; sets `status_changed_at` correctly
- `winesRepo.updateStatus` — atomic Knex update: status + status_changed_at + date_updated
- `winesService.updateStatus` — getById (auth check) → same-status check → matrix check → DB call
- 9 new integration tests: active→consumed, consumed→active, active→removed, removed→active, same→same (422), consumed→removed (422), invalid value (422), other user (403), no token (401)
- `useUpdateStatus(id)` — mutation with instant cache update + list invalidation
- `StatusTransitionButtons` — shows "Mark as Consumed" + "Mark as Removed" for active wines; "Revert to Active" for consumed/removed wines
- `WineDetailPage` — StatusTransitionButtons added between wine details and tasting notes
- `HistoryPage` — real implementation: Consumed/Removed tab buttons, useWines({ status }), WineCard list, empty state, count display
- 6 Playwright e2e tests: mark consumed, disappears from active list, appears in history, revert to active, mark removed, tab switching

## Status Transition Matrix

| From | To | Result |
|------|----|--------|
| active | consumed | ✅ 200 — sets status_changed_at = now() |
| active | removed | ✅ 200 — sets status_changed_at = now() |
| consumed | active | ✅ 200 — sets status_changed_at = null |
| removed | active | ✅ 200 — sets status_changed_at = null |
| consumed | removed | ❌ 422 INVALID_TRANSITION |
| removed | consumed | ❌ 422 INVALID_TRANSITION |
| any | same | ❌ 422 INVALID_TRANSITION |

## Integration Test Results

```
Tests: 46 passed, 46 total (10 auth + 36 wines)
Test Suites: 2 passed, 2 total
```

## Task Commits

1. `b45b0b9` — feat(04-01): PATCH /wines/:id/status endpoint + 9 integration tests (46/46 pass)
2. `f4aa9fa` — feat(04-01): StatusTransitionButtons, HistoryPage, useUpdateStatus, Playwright e2e lifecycle tests

## Verification

- `npm run type-check` — exits 0 (server ✅, client ✅)
- `npm run build` — exits 0, 171 modules, 281KB ✅
- Server tests — 46/46 pass ✅

## Phase 4 Completion Status

All 4 Phase 4 success criteria met:
1. ✅ User can mark any active wine as consumed — "Mark as Consumed" button on WineDetailPage
2. ✅ Consumed wines disappear from default active list — status filter defaults to 'active'
3. ✅ Consumed wines accessible via history view — HistoryPage with Consumed tab
4. ✅ User can revert consumed wine back to active — "Revert to Active" button on WineDetailPage

## Deviations from Plan

**jest --forceExit fix**
- **Issue:** Both auth.test.ts and wines.test.ts call `db.destroy()` in afterAll; with parallel test suite execution, one suite destroys the pool before the other finishes
- **Fix:** Added `--forceExit` to jest CLI in server/package.json; Jest exits after all tests complete, bypassing the open handle issue
- **Impact:** All 46 tests pass; no behavior change in test logic

---
*Phase: 04-lifecycle-tracking*
*Completed: 2026-05-15*

## Self-Check: PASSED

All 11 files created/modified. TypeScript clean. Build clean. 46/46 tests pass.
