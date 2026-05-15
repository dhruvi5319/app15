---
phase: 01-foundation
plan: "01"
subsystem: infra
tags: [express, typescript, vite, react, knex, zod, docker, github-actions, eslint, prettier]

# Dependency graph
requires: []
provides:
  - npm workspaces monorepo (server + client)
  - Express app factory with Zod-validated env config and Knex DB connection
  - Vite + React 18 TypeScript client scaffold
  - Docker Compose local dev stack (postgres:16, api, client)
  - GitHub Actions CI pipeline (lint, type-check, test, build)
affects: [01-02, 01-03, 02-01, 02-02, 02-03]

# Tech tracking
tech-stack:
  added:
    - express@4.22.2
    - knex@3.2.10
    - pg@8.11.3
    - bcryptjs@2.4.3
    - jsonwebtoken@9.0.2
    - zod@3.25.76
    - dotenv@16.3.1
    - cors@2.8.5
    - helmet@7.1.0
    - react@18.3.1
    - react-dom@18.3.1
    - react-router-dom@6.x
    - "@tanstack/react-query@5.x"
    - zustand@4.x
    - axios@1.x
    - typescript@5.9.3
    - vite@5.4.21
    - vitest@1.x
    - ts-node-dev@2.x
    - jest@29.x
  patterns:
    - App factory pattern (createApp() in app.ts, no side effects on import)
    - Zod schema validation for environment variables at startup
    - Express error handler middleware with typed AppError interface
    - npm workspaces for monorepo dependency management
    - Multi-stage Dockerfile (dev/build/production)

key-files:
  created:
    - package.json
    - server/package.json
    - server/tsconfig.json
    - server/src/config/env.ts
    - server/src/config/db.ts
    - server/src/app.ts
    - server/src/server.ts
    - server/src/middleware/errorHandler.ts
    - client/package.json
    - client/tsconfig.json
    - client/tsconfig.node.json
    - client/vite.config.ts
    - client/index.html
    - client/src/main.tsx
    - .eslintrc.cjs
    - .prettierrc
    - .env.example
    - docker-compose.yml
    - server/Dockerfile
    - .github/workflows/ci.yml
  modified:
    - .gitignore

key-decisions:
  - "App factory pattern: createApp() in app.ts exports both factory and singleton; server.ts is the only entry point that calls listen"
  - "Knex over Prisma: matches TechArch spec, better control over raw SQL and migrations"
  - "Removed docker-compose.yml version field: obsolete in Docker Compose v2, causes warning"
  - "Server Dockerfile placed in server/ (not root): build context is ./server, cleaner separation"

patterns-established:
  - "App factory pattern: export createApp() and const app = createApp() from app.ts"
  - "Zod env validation: parse process.env at module load; fail fast if required vars missing"
  - "Error handler: typed AppError extends Error with statusCode and code fields"
  - "Workspace scripts: root delegates to workspaces with --workspaces --if-present"

# Metrics
duration: 6min
completed: 2026-05-15
---

# Phase 1 Plan 1: Monorepo Scaffold Summary

**npm workspaces monorepo with Express/TypeScript server (Zod env, Knex, app factory), Vite/React 18 client, Docker Compose dev stack (postgres+api+client), and GitHub Actions CI (lint, type-check, test, build)**

## Performance

- **Duration:** 6 min
- **Started:** 2026-05-15T17:59:27Z
- **Completed:** 2026-05-15T18:05:22Z
- **Tasks:** 2
- **Files modified:** 20 created + 1 modified = 21 total

## Accomplishments

- Monorepo root with npm workspaces, ESLint, Prettier config, and .env.example
- Express server: Zod-validated env config, Knex PostgreSQL connection, app factory pattern, typed error middleware
- Vite + React 18 TypeScript client with TanStack Query, Zustand, React Router stubs
- Docker Compose: postgres:16 + api (dev stage) + client; all 3 services reach `Up` state; `GET /health` returns `{"status":"ok"}`
- GitHub Actions CI: lint+type-check, test (with postgres service), build jobs on push/PR to main
- Full TechArch directory structure in server/src/ and client/src/

## Task Commits

Each task was committed atomically:

1. **Task 1: Monorepo scaffold** - `98289fe` (feat)
2. **Task 2: Docker Compose + CI pipeline** - `18e5438` (feat)

## Files Created/Modified

- `package.json` — npm workspaces root with lint/type-check/build/test scripts
- `server/package.json` — Express + TS + Knex + Zod + test dependencies
- `server/tsconfig.json` — ES2020, commonjs, strict, rootDir=src, outDir=dist
- `server/src/config/env.ts` — Zod schema validates NODE_ENV, PORT, DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, CORS_ORIGIN
- `server/src/config/db.ts` — Knex instance with pg client, pool min:2/max:10, migrations dir
- `server/src/app.ts` — createApp() factory: helmet, cors, express.json, /health endpoint, errorHandler
- `server/src/server.ts` — Entry point: verifies DB connection, calls app.listen
- `server/src/middleware/errorHandler.ts` — Typed AppError handler returning `{error:{code,message}}`
- `client/package.json` — Vite + React 18 + TS + TanStack Query + Zustand + Axios
- `client/tsconfig.json` + `client/tsconfig.node.json` — Strict TS with bundler module resolution
- `client/vite.config.ts` — Vite with React plugin, port 5173, /api proxy to :3001
- `client/index.html` + `client/src/main.tsx` — React entry point stub
- `.eslintrc.cjs` — @typescript-eslint/recommended, no-unused-vars with `_` prefix exemption
- `.prettierrc` — singleQuote, semi, trailingComma:es5, printWidth:100
- `.env.example` — All required env vars documented (DATABASE_URL, JWT_SECRET, JWT_REFRESH_SECRET, etc.)
- `docker-compose.yml` — postgres:16-alpine + api (dev stage) + client; healthcheck + depends_on
- `server/Dockerfile` — Multi-stage: dev (ts-node-dev), build (tsc), production (non-root node user)
- `.github/workflows/ci.yml` — CI on push/PR to main: lint-and-typecheck + test + build jobs
- `.gitignore` — Added dist/, .env, *.local, .DS_Store, *.tsbuildinfo, coverage/

## Decisions Made

- **App factory pattern**: `createApp()` exported alongside `const app = createApp()` singleton; `server.ts` is the sole entry point calling `app.listen`. This keeps app.ts importable in tests without starting the server.
- **Knex over Prisma**: Matches TechArch specification; better control for raw SQL migrations.
- **Server Dockerfile in server/**: Build context is `./server` in docker-compose, cleaner separation than a root Dockerfile.
- **Removed docker-compose.yml version field**: The `version` attribute is obsolete in Docker Compose v2+ and emits a warning; removed for cleanliness.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Removed obsolete `version: '3.9'` from docker-compose.yml**
- **Found during:** Task 2 (Docker Compose validation)
- **Issue:** Docker Compose v2 treats the `version` field as obsolete and emits a warning: "the attribute `version` is obsolete, it will be ignored"
- **Fix:** Removed the `version: '3.9'` top-level key from docker-compose.yml
- **Files modified:** docker-compose.yml
- **Verification:** `docker compose config --quiet` exits 0 with no warnings
- **Committed in:** `18e5438` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 minor correctness fix)
**Impact on plan:** Minimal — removed obsolete field that caused warnings but not failures. No scope creep.

## Issues Encountered

None — plan executed cleanly. Both workspaces type-check with 0 errors. Docker stack comes up and health endpoint responds.

## User Setup Required

None - no external service configuration required for local development. See `.env.example` for required environment variables when running outside Docker.

## Environment Variables Required

| Variable | Example Value | Purpose |
|----------|--------------|---------|
| `DATABASE_URL` | `postgresql://postgres:postgres@localhost:5432/wine_inventory` | PostgreSQL connection string |
| `JWT_SECRET` | 32+ character string | Access token signing key |
| `JWT_REFRESH_SECRET` | 32+ character string | Refresh token signing key |
| `JWT_ACCESS_EXPIRES_IN` | `1h` | Access token TTL |
| `JWT_REFRESH_EXPIRES_IN` | `30d` | Refresh token TTL |
| `CORS_ORIGIN` | `http://localhost:5173` | Allowed CORS origin |
| `PORT` | `3001` | Server port |
| `NODE_ENV` | `development` | Environment mode |

Docker Compose provides all these automatically for local dev.

## Docker Compose Services

| Service | Port | Image |
|---------|------|-------|
| postgres | 5432 | postgres:16-alpine |
| api | 3001 | project-api (server/Dockerfile dev stage) |
| client | 5173 | node:20-alpine |

## CI Workflow Jobs

| Job | Trigger | What It Runs |
|-----|---------|-------------|
| lint-and-typecheck | push/PR to main | ESLint + tsc --noEmit for server and client |
| test | push/PR to main | jest (server) + vitest (client) with postgres service container |
| build | after lint-and-typecheck | tsc (server) + vite build (client) |

## Next Phase Readiness

- Monorepo scaffold complete — Phase 1 Plan 2 (database schema + auth API) can proceed immediately
- server/migrations/ directory ready for Knex migration files
- server/src/routes, controllers, services, repositories all exist as empty dirs
- DB connection (db.ts) is ready to use once a real DATABASE_URL is provided
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-05-15*

## Self-Check: PASSED

All key files verified present on disk. Both task commits (98289fe, 18e5438) confirmed in git log.
