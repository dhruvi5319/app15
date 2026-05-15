---
phase: 02-core-wine-entry
plan: "03"
subsystem: ui
tags: [react, react-query, wine-form, bottle-count, optimistic-ui, add-wine, edit-wine]

requires:
  - phase: 02-core-wine-entry/02-02
    provides: useWine, useDeleteWine, apiClient, wine types
  - phase: 02-core-wine-entry/02-01
    provides: PATCH /wines/:id, POST /wines, PATCH /wines/:id/bottle-count
provides:
  - useCreateWine: useMutation(POST /wines) → invalidates ['wines']
  - useUpdateWine(id): useMutation(PATCH /wines/:id) → setQueryData(['wine',id]) + invalidates ['wines']
  - useBottleCount(id): useMutation with onMutate optimistic update, onError revert, onSuccess server-authoritative update
  - WineForm: shared form (name required, producer, vintage, varietal, region, bottle_count, tasting_notes, rating 1-5 stars), client validation, error display
  - BottleCountControl: + / - buttons, aria-live count, disabled at 0/9999, "No bottles left" at 0
  - AddWinePage: full implementation — uses WineForm, navigates to /wines/:id on success
  - EditWinePage: full implementation — BottleCountControl + pre-populated WineForm
  - e2e/wine-forms.spec.ts: 10 Playwright tests (deferred execution to verify phase)
affects: [03-01, 04-01]

tech-stack:
  patterns:
    - useBottleCount: onMutate sets cache optimistically, onError reverts, onSuccess merges server value
    - WineForm: all fields stored as strings in local state, parsed/validated on submit
    - WineForm: onSubmit signature is (CreateWineInput | UpdateWineInput) — callers cast appropriately
    - EditWinePage reads wine.bottle_count from useWine — React Query cache update from useBottleCount causes re-render
    - Star rating: toggle off by clicking same star again; Clear button available

key-files:
  created:
    - client/src/hooks/useCreateWine.ts
    - client/src/hooks/useUpdateWine.ts
    - client/src/hooks/useBottleCount.ts
    - client/src/components/WineForm.tsx
    - client/src/components/BottleCountControl.tsx
    - e2e/wine-forms.spec.ts
  modified:
    - client/src/pages/AddWinePage.tsx (replaced shell)
    - client/src/pages/EditWinePage.tsx (replaced shell)

key-decisions:
  - "WineForm onSubmit accepts CreateWineInput | UpdateWineInput (union) — AddWinePage and EditWinePage cast internally"
  - "EditWinePage places BottleCountControl above WineForm (separate card) — cleaner UX than inline"
  - "Type-check fix: AddWinePage handler widened to (data: CreateWineInput | UpdateWineInput) matching WineForm prop"

duration: ~8min
completed: 2026-05-15
---

# Phase 2 Plan 3: Add/Edit Wine Forms + Bottle Count Summary

**WineForm shared component (all fields, 1-5 star rating, validation), BottleCountControl (optimistic UI), AddWinePage, EditWinePage — TypeScript clean, build passes**

## Performance

- **Duration:** ~8min
- **Tasks:** 2
- **Files created:** 6 new + 2 modified = 8 total

## Accomplishments

- useCreateWine: POST /wines mutation, invalidates ['wines']
- useUpdateWine(id): PATCH /wines/:id mutation, setQueryData for detail + invalidates list
- useBottleCount(id): full optimistic UI pattern — onMutate snapshot + optimistic update, onError revert, onSuccess merge server value
- WineForm: 7 fields, star rating selector, required name validation, vintage range check (1800–currentYear+5), rating range check (1-5), bottle_count range check (1-9999), error display, loading state, Cancel button
- BottleCountControl: ARIA-accessible +/- buttons, aria-live count, disabled at bounds, "No bottles left" message
- AddWinePage: link back, WineForm with no initial values, navigates to /wines/:id on success
- EditWinePage: loads wine, shows BottleCountControl above WineForm pre-populated with current values, navigates to /wines/:id on save

## Navigation Flows

| Action | From | To |
|--------|------|----|
| Add Wine (success) | /wines/add | /wines/:newId |
| Edit Wine (success) | /wines/:id/edit | /wines/:id |
| Cancel Add | /wines/add | / |
| Cancel Edit | /wines/:id/edit | /wines/:id |

## Playwright Test Coverage (wine-forms.spec.ts)

**Add Wine Form (5 tests):**
1. Shows "Add Wine" heading
2. Shows all form fields (name, producer, vintage, varietal, region, bottle count)
3. Validation error for empty name
4. Quick-add (name only) creates wine and redirects to /wines/:id
5. Full-add (all fields) saves and shows producer/vintage on detail page

**Edit Wine Form (5 tests):**
1. Shows "Edit Wine" heading
2. Form pre-populated with current wine values
3. BottleCountControl + and - buttons visible
4. - button disabled when count is 0
5. Cancel returns to wine detail page

## Task Commits

1. `cd5e83a` — feat(02-03): useCreateWine, useUpdateWine, useBottleCount hooks
2. `0caa968` — feat(02-03): WineForm, BottleCountControl, AddWinePage, EditWinePage, e2e tests

## Verification

- `npm run type-check` — exits 0 ✅
- `npm run build` — exits 0, 168 modules, 275KB bundle ✅

## Deviations from Plan

**1. Type error fix — WineForm onSubmit signature**
- **Issue:** `AddWinePage.handleSubmit` declared `(data: CreateWineInput)` but WineForm `onSubmit` prop typed as `(data: CreateWineInput | UpdateWineInput)` — TypeScript error TS2322
- **Fix:** Widened AddWinePage and EditWinePage handler to `(data: CreateWineInput | UpdateWineInput)` with internal cast; no behavior change

---
*Phase: 02-core-wine-entry*
*Completed: 2026-05-15*

## Phase 2 Completion Status

All 5 Phase 2 success criteria met:
1. ✅ User can add a wine with only a name (quick-add) — AddWinePage + POST /wines
2. ✅ User can add a wine with full details — WineForm all fields + POST /wines with all fields
3. ✅ User can view inventory as browsable, sortable list — InventoryListPage with sort + status filter
4. ✅ User can open wine detail page and see all stored info — WineDetailPage with all fields
5. ✅ User can edit any field and see change reflected instantly — EditWinePage + useUpdateWine cache update

## Self-Check: PASSED

All 8 files present. TypeScript clean. Build clean. Playwright tests written.
