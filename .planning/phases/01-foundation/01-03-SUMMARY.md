---
phase: 01-foundation
plan: "03"
subsystem: ui
tags: [react, vite, typescript, react-router, zustand, axios, tanstack-query, playwright, e2e]

# Dependency graph
requires:
  - phase: 01-foundation/01-02
    provides: Auth API endpoints (login, logout, register, refresh) and JWT token shape
  - phase: 01-foundation/01-01
    provides: Monorepo scaffold, Vite+React+TypeScript client setup
provides:
  - React SPA with React Router v6 routing for all 5 TechArch page routes
  - Zustand useAuthStore: access_token in-memory, setAuth, clearAuth, isAuthenticated
  - Axios apiClient: base URL, request interceptor (Bearer token), response interceptor (401 clears auth)
  - useAuth hook: login(), logout(), isAuthenticated, user
  - LoginPage with email/password form, validation, error handling, loading state
  - Page shells: InventoryListPage, WineDetailPage, AddWinePage, EditWinePage, HistoryPage
  - Playwright e2e test suite (5 auth tests) + playwright.config.ts
  - wines.api.ts stubs and useWines/useWine React Query hooks
affects: [02-01, 02-02, 02-03]

# Tech tracking
tech-stack:
  added:
    - "@playwright/test (devDependency) for e2e testing"
  patterns:
    - "Zustand store: in-memory token state (no localStorage), selector pattern for ProtectedRoute"
    - "Axios interceptors: request attaches Bearer token from store, response clears auth on 401"
    - "ProtectedRoute: reads isAuthenticated() from store, redirects to /login if false"
    - "useAuth hook: wraps apiClient + store + navigate — single hook for all auth actions"

key-files:
  created:
    - client/src/store/authStore.ts
    - client/src/api/client.ts
    - client/src/api/wines.api.ts
    - client/src/types/wine.types.ts
    - client/src/hooks/useAuth.ts
    - client/src/hooks/useWines.ts
    - client/src/hooks/useWine.ts
    - client/src/pages/LoginPage.tsx
    - client/src/pages/InventoryListPage.tsx
    - client/src/pages/WineDetailPage.tsx
    - client/src/pages/AddWinePage.tsx
    - client/src/pages/EditWinePage.tsx
    - client/src/pages/HistoryPage.tsx
    - client/src/utils/validation.ts
    - client/src/utils/formatters.ts
    - client/src/vite-env.d.ts
    - client/playwright.config.ts
    - e2e/auth.spec.ts
  modified:
    - client/src/main.tsx
    - package.json

key-decisions:
  - "vite-env.d.ts added: was missing from client scaffold; required for import.meta.env TypeScript types (vite/client reference)"
  - "playwright.config.ts webServer cwd uses __dirname (not './client') since config lives in client/ dir"
  - "E2E tests written as artifacts; execution deferred to verify phase (requires live API at localhost:3001)"

patterns-established:
  - "ProtectedRoute pattern: useAuthStore selector + Navigate to /login; used in main.tsx for all protected routes"
  - "useAuth hook: single import for login/logout/isAuthenticated/user — components don't access store directly"
  - "apiClient interceptors: store read via getState() (not hook) to work outside React tree"

# Metrics
duration: 4min
completed: 2026-05-15
---

# Phase 1 Plan 3: React SPA Shell & Auth Flow Summary

**React SPA with React Router v6 (6 routes), Zustand in-memory auth store, Axios Bearer interceptor, LoginPage with validation, and 5 Playwright e2e auth tests covering the complete unauthenticated redirect + login flow**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-15T18:14:20Z
- **Completed:** 2026-05-15T18:18:52Z
- **Tasks:** 2
- **Files modified:** 18 created + 2 modified = 20 total

## Accomplishments

- Full SPA routing: /, /login, /wines/:id, /wines/add, /wines/:id/edit, /history with ProtectedRoute guarding all non-login routes
- Zustand useAuthStore: access_token held purely in memory (no localStorage), with setAuth/clearAuth/isAuthenticated
- Axios apiClient: request interceptor attaches `Authorization: Bearer <token>`, response interceptor clears auth on 401
- LoginPage with controlled inputs, client-side validation, 401 error handling, loading state, and accessibility (role="alert")
- 5 Playwright e2e tests covering: redirect, form visibility, invalid credentials, valid credentials, empty form validation

## React Router Route Map

| Path | Component | Protected |
|------|-----------|-----------|
| `/login` | LoginPage | No |
| `/` | InventoryListPage | Yes |
| `/wines/:id` | WineDetailPage | Yes |
| `/wines/add` | AddWinePage | Yes |
| `/wines/:id/edit` | EditWinePage | Yes |
| `/history` | HistoryPage | Yes |
| `*` | Navigate to / | — |

## Zustand Store Shape (useAuthStore)

```typescript
{
  access_token: string | null,   // in-memory only
  user: { id: string; email: string } | null,
  setAuth(token, user): void,
  clearAuth(): void,
  isAuthenticated(): boolean
}
```

## Axios Client Behavior

- **baseURL:** `VITE_API_URL` env var or `http://localhost:3001`
- **Request interceptor:** reads `access_token` from `useAuthStore.getState()`, sets `Authorization: Bearer <token>`
- **Response interceptor:** on HTTP 401, calls `clearAuth()` to clear in-memory session

## Task Commits

Each task was committed atomically:

1. **Task 1: SPA scaffold** - `db749f5` (feat)
2. **Task 2: LoginPage + Playwright e2e tests** - `0df0434` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `client/src/store/authStore.ts` — Zustand auth store with in-memory token
- `client/src/api/client.ts` — Axios instance with auth interceptors
- `client/src/api/wines.api.ts` — Wine API stub functions (getAll, getById, create, update, remove)
- `client/src/types/wine.types.ts` — Wine, WineStatus types matching server schema
- `client/src/hooks/useAuth.ts` — useAuth: login(), logout(), isAuthenticated, user
- `client/src/hooks/useWines.ts` — useWines React Query hook (stub)
- `client/src/hooks/useWine.ts` — useWine React Query hook (stub)
- `client/src/pages/LoginPage.tsx` — Full login form with validation + error handling
- `client/src/pages/InventoryListPage.tsx` — Shell placeholder
- `client/src/pages/WineDetailPage.tsx` — Shell with useParams
- `client/src/pages/AddWinePage.tsx` — Shell placeholder
- `client/src/pages/EditWinePage.tsx` — Shell with useParams
- `client/src/pages/HistoryPage.tsx` — Shell placeholder
- `client/src/utils/validation.ts` — email, password, required validators
- `client/src/utils/formatters.ts` — vintage, bottleCount, rating, date formatters
- `client/src/vite-env.d.ts` — Vite TypeScript environment types
- `client/playwright.config.ts` — Playwright Chromium config, webServer on 5173
- `e2e/auth.spec.ts` — 5 e2e tests for auth flow
- `client/src/main.tsx` — Full app wiring with Router, QueryClient, ProtectedRoute
- `package.json` — Added `e2e` script

## Playwright E2E Tests

```
e2e/auth.spec.ts — Authentication Flow (5 tests)
  1. unauthenticated user visiting / is redirected to /login
  2. login page shows email and password fields and submit button
  3. invalid credentials show error message without page crash
  4. valid credentials redirect to inventory list page
  5. validation errors shown for empty form submission
```

**Environment variables for e2e:**
- `E2E_TEST_EMAIL` (default: `e2e-test@example.com`)
- `E2E_TEST_PASSWORD` (default: `Password123!`)

**Note:** Tests written; execution deferred to verify phase. Tests require API running at localhost:3001 and a registered test user. Create with:
```bash
curl -X POST http://localhost:3001/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"e2e-test@example.com","password":"Password123!"}'
```

## Decisions Made

- **vite-env.d.ts was missing:** The client scaffold from plan 01-01 didn't include the Vite environment types file. Added it as a Rule 3 (blocking) fix — without it, `import.meta.env` causes TypeScript errors across the entire client.
- **playwright.config.ts webServer cwd uses `__dirname`:** Since the config lives in `client/`, using `./client` as cwd would resolve to `client/client/`. Using `__dirname` correctly points to the client directory.
- **E2E tests deferred to verify phase:** Per execution boundary rules, Playwright (E2E) tests are not run during execute phase to avoid zombie browsers and stalls. The verify phase runs them with a live API.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 3 - Blocking] Added missing vite-env.d.ts**
- **Found during:** Task 1 (type-check verification)
- **Issue:** `client/src/vite-env.d.ts` was absent from the client scaffold. Without the `/// <reference types="vite/client" />` declaration, TypeScript reports `Property 'env' does not exist on type 'ImportMeta'` in `api/client.ts`
- **Fix:** Created `client/src/vite-env.d.ts` with the standard Vite client reference
- **Files modified:** `client/src/vite-env.d.ts`
- **Verification:** `npm run type-check` exits 0, `npm run build` succeeds
- **Committed in:** `db749f5` (Task 1 commit)

**2. [Rule 1 - Bug] Fixed playwright.config.ts webServer cwd**
- **Found during:** Task 2 (creating Playwright config)
- **Issue:** Plan showed `cwd: './client'` but config file is already inside `client/`. Relative path would resolve to `client/client/` — wrong directory
- **Fix:** Changed to `cwd: __dirname` which resolves to `client/` directory at runtime
- **Files modified:** `client/playwright.config.ts`
- **Verification:** Config is syntactically valid; correct path verified
- **Committed in:** `0df0434` (Task 2 commit)

---

**Total deviations:** 2 auto-fixed (1 blocking missing file, 1 bug in config path)
**Impact on plan:** Both fixes essential for correctness. No scope creep.

## Issues Encountered

None beyond the deviations documented above. Both tasks completed successfully. `npm run type-check` and `npm run build` both exit 0.

## Phase 1 Completion Status

All 3 plans in Phase 1 — Foundation are complete:
- **01-01:** Express app factory, Docker, Knex config, monorepo scaffold ✅
- **01-02:** DB migrations, Auth API (JWT + bcrypt), integration tests ✅
- **01-03:** React SPA shell, Zustand auth store, Axios client, LoginPage, Playwright tests ✅

**Phase 1 is complete.** Ready for Phase 2 (Wine CRUD).

## User Setup Required

None — no new external service configuration required. The e2e tests use the same API from plan 01-02 (requires Docker Compose or live Neon DB per plan 01-01/01-02 setup).

## Next Phase Readiness

- SPA shell complete — Phase 2 (02-01) can immediately add wine CRUD pages by filling in the page shells
- `useWines`, `useWine` React Query hooks are stubs ready to be filled with real data fetching
- `apiClient` with auth interceptor is ready — all Phase 2 API calls just use it directly
- `useAuth` hook available for logout buttons and auth-aware UI in Phase 2
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-05-15*

## Self-Check: PASSED

All 18 key files verified present on disk. Both task commits (`db749f5`, `0df0434`) confirmed in git log.
