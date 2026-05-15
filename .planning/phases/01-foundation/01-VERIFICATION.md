---
phase: 01-foundation
verified: 2026-05-15T18:25:00Z
status: gaps_found
score: 4/5 success criteria verified
re_verification: false
gaps:
  - truth: "API and SPA deploy automatically to Render/Neon on merge to main"
    status: failed
    reason: "No CD/deploy job exists in .github/workflows/ci.yml. The only workflow file is ci.yml with lint-and-typecheck, test, and build jobs. There is no deploy job, no render.yaml, no Procfile, and no other deployment configuration. The reference to https://placeholder.render.com in the build job's VITE_API_URL env var is a placeholder for a build-time env — not a deployment."
    artifacts:
      - path: ".github/workflows/ci.yml"
        issue: "Contains only lint-and-typecheck, test, and build jobs — no deploy job"
      - path: "render.yaml"
        issue: "File does not exist — no Render configuration"
    missing:
      - "A GitHub Actions deploy job (or separate deploy.yml) that runs on merge to main and triggers Render deployment of the API"
      - "render.yaml or equivalent deployment configuration specifying service, build command, and start command for the API"
      - "An automatic SPA deploy step (Render static site or equivalent) wired to the GitHub main branch"
  - truth: "GitHub Actions CI pipeline runs lint, tests, and build on every push to main"
    status: partial
    reason: "The CI pipeline runs lint, type-check, and build correctly. The test job exists and runs npm run test -w server (integration tests) but does NOT run migrations before tests. In CI the test database (wine_inventory_test) starts empty — auth.test.ts requires users, sessions, and wines tables to exist. Without a 'npm run migrate' step before 'npm run test -w server' in the CI test job, the integration tests will fail in CI on a fresh test database."
    artifacts:
      - path: ".github/workflows/ci.yml"
        issue: "test job runs 'npm run test -w server' without a preceding migration step — integration tests will fail against a fresh database"
    missing:
      - "A migration step in the test job before 'npm run test -w server': e.g. 'run: npm run migrate -w server'"
human_verification:
  - test: "Run 'docker compose up' from project root; verify all 3 services start and /health returns 200"
    expected: "postgres, api, and client all reach 'Up' state; GET http://localhost:3001/health returns {\"status\":\"ok\"}"
    why_human: "Docker daemon may not be available in all environments; verified config is valid but full stack startup requires live verification"
  - test: "Navigate to http://localhost:5173 in a browser with docker compose running; verify redirect to /login and working login flow"
    expected: "Redirected to /login; valid credentials redirect to 'My Wine Cellar'; invalid credentials show error message"
    why_human: "Browser-based auth flow with real JWT tokens requires a live environment"
---

# Phase 01: Foundation Verification Report

**Phase Goal:** A runnable, deployable full-stack skeleton exists — auth works, database is migrated, CI/CD pipeline is live
**Verified:** 2026-05-15T18:25:00Z
**Status:** gaps_found
**Re-verification:** No — initial verification

---

## Goal Achievement

### Observable Truths (from Success Criteria)

| # | Truth | Status | Evidence |
|---|-------|--------|----------|
| 1 | Developer can run the full stack locally with a single command (Docker Compose + npm scripts) | ✓ VERIFIED | `docker-compose.yml` defines postgres + api + client services; `docker compose config --quiet` exits 0; api service uses `server/Dockerfile` dev stage with `npm run dev`; healthcheck and depends_on wired correctly |
| 2 | PostgreSQL schema is migrated with all v1 tables: users, wines, sessions | ✓ VERIFIED | All 3 tables confirmed present in live DB; users (UUID PK, email UNIQUE, password_hash), wines (TSVECTOR search_vector GENERATED ALWAYS AS, wine_status enum), sessions (refresh_token UNIQUE, revoked_at); all 9 indexes confirmed including GIN on search_vector |
| 3 | A user can register and log in with email/password; JWT access and refresh tokens are issued | ✓ VERIFIED | Live endpoint tests: POST /api/v1/auth/register → 201 with user + both tokens; POST /api/v1/auth/login → 200 with both tokens; wrong password → 401; POST /api/v1/auth/refresh → 200; POST /api/v1/auth/logout → 204; 10/10 integration tests pass |
| 4 | GitHub Actions CI pipeline runs lint, tests, and build on every push to main | ⚠ PARTIAL | CI file exists with lint-and-typecheck, test, and build jobs on push/PR to main. HOWEVER: the `test` job runs `npm run test -w server` (integration tests) without first running migrations — in CI, the test database starts empty and auth.test.ts will fail because the users/sessions/wines tables don't exist |
| 5 | API and SPA deploy automatically to Render/Neon on merge to main | ✗ FAILED | No deploy job in ci.yml (only lint-and-typecheck, test, build). No render.yaml, Procfile, or other deploy config found. The only Render reference is `https://placeholder.render.com` as a build-time env var placeholder — not an actual deployment step |

**Score:** 3 fully verified + 1 partial = **4/5 truths verified** (SC4 partial, SC5 failed)

---

## Required Artifacts

### SC1: Single-command full-stack startup

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `docker-compose.yml` | postgres + api + client services | ✓ VERIFIED | All 3 services: postgres:16-alpine (port 5432, healthcheck), api (server/Dockerfile dev, port 3001, depends_on postgres healthy), client (node:20-alpine, port 5173) |
| `server/Dockerfile` | Multi-stage dev/build/production | ✓ VERIFIED | 3 stages: dev (ts-node-dev), build (tsc), production (non-root node user) |
| `server/package.json` | `dev` script starts Express on 3001 | ✓ VERIFIED | `"dev": "ts-node-dev --respawn --transpile-only src/server.ts"` |
| `client/vite.config.ts` | Vite dev server on port 5173 with /api proxy | ✓ VERIFIED | `port: 5173`, proxy `/api` → `http://localhost:3001` |

### SC2: Database schema

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `server/migrations/20240101000001_create_users.ts` | users DDL | ✓ VERIFIED | UUID PK, email UNIQUE, password_hash, timestamps |
| `server/migrations/20240101000002_create_wine_status_enum.ts` | wine_status ENUM | ✓ VERIFIED | active, consumed, removed |
| `server/migrations/20240101000003_create_wines.ts` | wines DDL with TSVECTOR | ✓ VERIFIED | GENERATED ALWAYS AS TSVECTOR search_vector confirmed in live DB |
| `server/migrations/20240101000004_create_wines_indexes.ts` | 7 wine indexes | ✓ VERIFIED | All 7 indexes including GIN on search_vector confirmed in live DB |
| `server/migrations/20240101000005_create_sessions.ts` | sessions DDL | ✓ VERIFIED | refresh_token UNIQUE, expires_at, revoked_at confirmed in live DB |
| `server/migrations/20240101000006_create_sessions_indexes.ts` | 2 session indexes | ✓ VERIFIED | idx_sessions_user_id, idx_sessions_token_active confirmed |

### SC3: Auth API

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `server/src/services/auth.service.ts` | register, login, refresh, logout | ✓ VERIFIED | Full bcrypt+JWT implementation, calls usersRepo and sessionsRepo, exports authService |
| `server/src/routes/auth.routes.ts` | Auth router | ✓ VERIFIED | Exports authRouter, 4 routes with Zod validation, authenticate middleware on logout |
| `server/src/middleware/auth.ts` | JWT verification, attaches req.user | ✓ VERIFIED | Bearer token parsing, jwt.verify, req.user attachment |
| `server/src/app.ts` | authRouter mounted at /api/v1/auth | ✓ VERIFIED | `app.use('/api/v1/auth', authRouter)` confirmed on line 19 |
| `server/tests/integration/auth.test.ts` | Integration tests | ✓ VERIFIED | 10/10 tests pass against live DB |

### SC4: CI Pipeline

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.github/workflows/ci.yml` | Lint, tests, build on push to main | ⚠ PARTIAL | Exists with correct trigger (push/PR to main), correct lint and build jobs. Test job missing a migrate step — will fail in CI against fresh empty database |

### SC5: CD Deploy Pipeline

| Artifact | Expected | Status | Details |
|----------|----------|--------|---------|
| `.github/workflows/ci.yml` (deploy job) | Auto-deploy on merge to main | ✗ MISSING | No deploy job exists |
| `render.yaml` | Render service configuration | ✗ MISSING | File does not exist |

---

## Key Link Verification

| From | To | Via | Status | Details |
|------|----|-----|--------|---------|
| `server/src/server.ts` | `server/src/app.ts` | `app.listen(env.PORT)` | ✓ WIRED | server.ts imports app, calls app.listen on line 10 |
| `server/src/config/db.ts` | `process.env.DATABASE_URL` | `env.DATABASE_URL` | ✓ WIRED | db.ts line 6: `connection: env.DATABASE_URL` |
| `docker-compose.yml` | `server/` | `build: context: ./server` | ✓ WIRED | api service builds from `context: ./server`, `dockerfile: Dockerfile` |
| `server/src/controllers/auth.controller.ts` | `server/src/services/auth.service.ts` | function calls | ✓ WIRED | authService.register/login/refresh/logout all called |
| `server/src/services/auth.service.ts` | `server/src/repositories/users.repo.ts` | usersRepo calls | ✓ WIRED | findByEmail, findById, create all called |
| `server/src/services/auth.service.ts` | `server/src/repositories/sessions.repo.ts` | sessionsRepo calls | ✓ WIRED | create, findActiveByToken, revokeByUserId all called |
| `server/src/routes/auth.routes.ts` | `server/src/app.ts` | `app.use('/api/v1/auth')` | ✓ WIRED | Mounted at line 19 in app.ts |
| `client/src/pages/LoginPage.tsx` | `client/src/hooks/useAuth.ts` | `useAuth()` + `login()` | ✓ WIRED | LoginPage imports useAuth, calls login() on form submit |
| `client/src/hooks/useAuth.ts` | `client/src/api/client.ts` | `apiClient.post('/api/v1/auth/login')` | ✓ WIRED | Line 12: apiClient.post call |
| `client/src/hooks/useAuth.ts` | `client/src/store/authStore.ts` | `setAuth()` after login | ✓ WIRED | setAuth called with token and user payload after login |
| `client/src/api/client.ts` | `client/src/store/authStore.ts` | `useAuthStore.getState().access_token` | ✓ WIRED | Request interceptor reads access_token from store (line 12) |
| `client/src/main.tsx` | `client/src/pages/LoginPage.tsx` | React Router Route + ProtectedRoute | ✓ WIRED | /login route renders LoginPage; ProtectedRoute wraps all other routes with redirect to /login |

---

## Anti-Patterns Found

| File | Pattern | Severity | Impact |
|------|---------|----------|--------|
| `.github/workflows/ci.yml` (test job) | Missing migration step before integration tests | 🛑 Blocker | Integration tests (auth.test.ts) require users/sessions/wines tables; CI test DB starts empty — tests will fail in CI |
| `.github/workflows/ci.yml` | No deploy job | 🛑 Blocker | SC5 (auto-deploy on merge to main) completely unimplemented |
| `client/src/pages/InventoryListPage.tsx` | Placeholder content: "Your wines will appear here." | ⚠ Warning | Expected for Phase 1 skeleton — Phase 2 fills in real content |
| `client/src/pages/AddWinePage.tsx` | Placeholder: "Add wine form coming in Phase 2." | ⚠ Warning | Expected — Phase 2 implements |
| `client/src/pages/HistoryPage.tsx` | Placeholder: "Consumed and removed wines will appear here." | ⚠ Warning | Expected — Phase 2 implements |

*Note: Page shell placeholders are expected for the Phase 1 skeleton — they are not blockers. SC1–SC3 only require auth and infra to work; wine CRUD is Phase 2.*

---

## Human Verification Required

### 1. Full Stack Docker Compose Startup

**Test:** `docker compose up -d` from project root, wait 30 seconds, run `curl http://localhost:3001/health`
**Expected:** All 3 services (postgres, api, client) reach "Up" state; `GET /health` returns `{"status":"ok","timestamp":"..."}`
**Why human:** Full Docker build and network setup requires a complete environment; automated checks verified config validity but not runtime behavior

### 2. Browser Login Flow

**Test:** Navigate to `http://localhost:5173` with docker compose running
**Expected:** Automatic redirect to `/login`; entering valid credentials redirects to "My Wine Cellar"; entering wrong password shows "Invalid email or password" error
**Why human:** React Router redirect behavior and form state require a running browser

---

## Gaps Summary

### Gap 1: No CD/Deploy Pipeline (SC5 — FAILED)

Success criterion 5 requires "API and SPA deploy automatically to Render/Neon on merge to main." **No deployment automation exists at all.** The ci.yml has only three jobs (lint-and-typecheck, test, build) — none of which deploy. There is no render.yaml, no Render CLI step, no Fly.io/Vercel/Heroku configuration. The `https://placeholder.render.com` value in the build job's VITE_API_URL env is a build-time placeholder, not a deployment target.

**To fix:** Add a `deploy` job to ci.yml (or a separate deploy.yml) that runs on push to main, and add a render.yaml or equivalent service configuration. This requires an actual Render account and service to be configured.

### Gap 2: CI Test Job Missing Migration Step (SC4 — PARTIAL)

The CI test job runs the server integration tests against a fresh `wine_inventory_test` database. The integration tests (`auth.test.ts`) require `users`, `sessions`, and `wines` tables — but there is no `npm run migrate` step in the test job. The tests pass locally only because the local dev database already has migrations applied. In CI on GitHub Actions, the test database starts empty and all 10 integration tests will fail with "relation 'users' does not exist."

**To fix:** Add a migrate step to the CI test job after `npm ci`:
```yaml
- name: Run migrations
  run: npm run migrate -w server
```

---

_Verified: 2026-05-15T18:25:00Z_
_Verifier: Claude (pivota_spec-verifier)_
