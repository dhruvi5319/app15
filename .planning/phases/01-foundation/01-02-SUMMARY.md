---
phase: 01-foundation
plan: "02"
subsystem: database
tags: [knex, postgresql, jwt, bcrypt, express, zod, supertest, migrations, auth]

# Dependency graph
requires:
  - phase: 01-foundation/01-01
    provides: Express app factory, Knex db instance, Zod env config, monorepo scaffold
provides:
  - 6 Knex migrations: users, wine_status enum, wines (TSVECTOR search_vector), wines indexes, sessions, sessions indexes
  - Auth API: POST /api/v1/auth/register, login, refresh, logout
  - JWT middleware (authenticate) attaching req.user
  - Zod validation middleware (validate)
  - Layered auth architecture: types → repos → service → controller → route
affects: [01-03, 02-01, 02-02, 02-03]

# Tech tracking
tech-stack:
  added:
    - supertest@7.2.2 (devDependency for integration tests)
  patterns:
    - Layered architecture: types → repositories → service → controller → routes
    - Repository pattern: usersRepo and sessionsRepo isolate DB queries
    - Zod request body validation via validate() middleware factory
    - JWT access token (1h) + refresh token (30d) stored in sessions table
    - bcryptjs with 12 rounds for password hashing
    - Error objects with statusCode + code properties for errorHandler

key-files:
  created:
    - server/knexfile.ts
    - server/migrations/20240101000001_create_users.ts
    - server/migrations/20240101000002_create_wine_status_enum.ts
    - server/migrations/20240101000003_create_wines.ts
    - server/migrations/20240101000004_create_wines_indexes.ts
    - server/migrations/20240101000005_create_sessions.ts
    - server/migrations/20240101000006_create_sessions_indexes.ts
    - server/src/types/auth.types.ts
    - server/src/types/wine.types.ts
    - server/src/repositories/users.repo.ts
    - server/src/repositories/sessions.repo.ts
    - server/src/services/auth.service.ts
    - server/src/controllers/auth.controller.ts
    - server/src/routes/auth.routes.ts
    - server/src/middleware/auth.ts
    - server/src/middleware/validate.ts
    - server/tests/integration/auth.test.ts
  modified:
    - server/src/app.ts
    - server/package.json

key-decisions:
  - "Rating DDL constraint kept at 1-100 (TechArch) — application layer enforces 1-5 stars per product decision"
  - "knex migrate scripts use ts-node/register to handle TypeScript migration files directly"
  - "jwt.sign expiresIn cast via SignOptions type to satisfy @types/jsonwebtoken StringValue constraint"

patterns-established:
  - "Repository pattern: usersRepo/sessionsRepo export plain object with async methods"
  - "Error pattern: throw Error with statusCode + code properties; errorHandler reads them"
  - "Auth middleware: authenticate() checks Bearer token, attaches req.user, no DB call"
  - "Validation: validate(schema) factory wraps Zod safeParse, returns 422 VALIDATION_ERROR"

# Metrics
duration: 4min
completed: 2026-05-15
---

# Phase 1 Plan 2: Database Schema & Auth API Summary

**6 Knex migrations creating users/wines/sessions tables with TSVECTOR search and GIN index, plus full JWT auth API (register, login, refresh, logout) with bcrypt, Zod validation, and 10/10 integration tests passing**

## Performance

- **Duration:** 4 min
- **Started:** 2026-05-15T18:07:58Z
- **Completed:** 2026-05-15T18:12:09Z
- **Tasks:** 2
- **Files modified:** 17 created + 2 modified = 19 total

## Accomplishments

- All 6 Knex migrations applied: users table, wine_status ENUM, wines table with GENERATED ALWAYS AS TSVECTOR search_vector, 7 wines indexes (incl. GIN), sessions table, 2 session indexes
- Full auth API: `POST /api/v1/auth/register` (201), `login` (200), `refresh` (200), `logout` (204) with exact TechArch response contracts
- JWT middleware (`authenticate`) verifies access tokens and attaches `req.user`
- Zod validation middleware returning 422 VALIDATION_ERROR with field-level errors
- 10/10 integration tests passing (supertest against live PostgreSQL)

## Task Commits

Each task was committed atomically:

1. **Task 1: Knex migrations** - `efa3fee` (feat)
2. **Task 2: Auth API** - `ab56e8f` (feat)

**Plan metadata:** (docs commit follows)

## Files Created/Modified

- `server/knexfile.ts` — Knex config for dev/test/production via DATABASE_URL
- `server/migrations/20240101000001_create_users.ts` — users DDL (UUID PK, email UNIQUE, password_hash)
- `server/migrations/20240101000002_create_wine_status_enum.ts` — wine_status ENUM ('active','consumed','removed')
- `server/migrations/20240101000003_create_wines.ts` — wines DDL with GENERATED ALWAYS AS TSVECTOR search_vector
- `server/migrations/20240101000004_create_wines_indexes.ts` — 7 indexes including GIN on search_vector
- `server/migrations/20240101000005_create_sessions.ts` — sessions DDL (refresh_token UNIQUE, expires_at, revoked_at)
- `server/migrations/20240101000006_create_sessions_indexes.ts` — 2 session indexes
- `server/src/types/auth.types.ts` — User, Session, JWT payload, request/response interfaces
- `server/src/types/wine.types.ts` — WineStatus enum, Wine interface (placeholder for plan 02-01)
- `server/src/repositories/users.repo.ts` — findByEmail, findById, create
- `server/src/repositories/sessions.repo.ts` — create, findActiveByToken, revoke, revokeByUserId
- `server/src/services/auth.service.ts` — register, login, refresh, logout business logic
- `server/src/controllers/auth.controller.ts` — thin Express controllers delegating to authService
- `server/src/routes/auth.routes.ts` — Zod schemas + route definitions for all 4 endpoints
- `server/src/middleware/auth.ts` — JWT Bearer token verification; global req.user augmentation
- `server/src/middleware/validate.ts` — Zod safeParse factory middleware returning 422 on failure
- `server/tests/integration/auth.test.ts` — 10 integration tests covering happy + error paths
- `server/src/app.ts` — Added authRouter mount at `/api/v1/auth`
- `server/package.json` — Added jest config (ts-jest), supertest devDependency, updated migrate scripts

## Auth Endpoint Contracts (for plan 01-03 frontend reference)

| Endpoint | Method | Auth | Request | Response |
|----------|--------|------|---------|----------|
| `/api/v1/auth/register` | POST | None | `{email, password}` | 201 `{user:{id,email}, access_token, refresh_token, expires_in}` |
| `/api/v1/auth/login` | POST | None | `{email, password}` | 200 `{access_token, refresh_token, expires_in}` |
| `/api/v1/auth/refresh` | POST | None | `{refresh_token}` | 200 `{access_token, expires_in}` |
| `/api/v1/auth/logout` | POST | Bearer | — | 204 |

**JWT env vars required:** `JWT_SECRET` (≥32 chars), `JWT_REFRESH_SECRET` (≥32 chars), `JWT_ACCESS_EXPIRES_IN` (e.g. `1h`), `JWT_REFRESH_EXPIRES_IN` (e.g. `30d`)

**JWT payload shape:** `{ sub: user_uuid, email, iat, exp }`

**Error format:** `{ error: { code: string, message: string } }`

## Decisions Made

- **Rating DDL constraint kept at 1-100**: TechArch schema specifies `CHECK (rating >= 1 AND rating <= 100)`. STATE.md records a product decision to use 1-5 stars. The DDL is kept at 1-100 to match the TechArch exactly; plan 02-01 will add application-layer validation enforcing 1-5.
- **ts-node/register for migrations**: The knexfile.ts uses TypeScript; running migrations requires `node -r ts-node/register`. Updated package.json `migrate` script accordingly.

## Deviations from Plan

### Auto-fixed Issues

**1. [Rule 1 - Bug] Fixed jwt.sign expiresIn type incompatibility**
- **Found during:** Task 2 (TypeScript type-check)
- **Issue:** `env.JWT_ACCESS_EXPIRES_IN` and `env.JWT_REFRESH_EXPIRES_IN` are Zod-inferred as `string`, but `@types/jsonwebtoken` requires `StringValue | number` for `expiresIn`. TypeScript error: `Type 'string' is not assignable to type 'number | StringValue | undefined'`
- **Fix:** Imported `SignOptions` from jsonwebtoken; created explicit `options: SignOptions` objects with `as SignOptions['expiresIn']` cast
- **Files modified:** `server/src/services/auth.service.ts`
- **Verification:** `npm run type-check` exits 0, all 10 tests pass
- **Committed in:** `ab56e8f` (Task 2 commit)

---

**Total deviations:** 1 auto-fixed (1 type compatibility fix)
**Impact on plan:** Minimal — cast required due to @types/jsonwebtoken strict typing. No behavior change, no scope creep.

## Issues Encountered

None — both tasks completed successfully. Migrations are idempotent (rollback + re-run verified). All 10 integration tests pass consistently.

## User Setup Required

**External services require manual configuration.** See Neon PostgreSQL setup in plan frontmatter:
- Create Neon project named 'wine-inventory' at https://console.neon.tech → New Project
- Copy connection string → set as `DATABASE_URL` environment variable
- Run `npm run migrate` from `server/` directory to apply all 6 migrations

For local development, Docker Compose (`docker compose up -d postgres`) provides PostgreSQL automatically.

## Integration Test Results

```
Tests:       10 passed, 10 total
Test Suites: 1 passed, 1 total
Time:        ~2s
```

| Test | Status |
|------|--------|
| register → 201 with user + tokens | ✅ |
| register duplicate → 409 EMAIL_IN_USE | ✅ |
| register invalid email → 422 VALIDATION_ERROR | ✅ |
| login → 200 with tokens | ✅ |
| login wrong password → 401 UNAUTHORIZED | ✅ |
| login unknown email → 401 | ✅ |
| refresh → 200 with new access_token | ✅ |
| refresh invalid token → 401 | ✅ |
| logout with Bearer → 204 | ✅ |
| logout without token → 401 | ✅ |

## Next Phase Readiness

- Auth API complete — plan 01-03 (client scaffold + auth pages) can use these endpoints immediately
- `authenticate` middleware is ready to protect wine routes in phase 02
- `req.user.id` available in any route protected by `authenticate`
- No blockers

---
*Phase: 01-foundation*
*Completed: 2026-05-15*

## Self-Check: PASSED

All 18 key files verified present on disk. Both task commits (`efa3fee`, `ab56e8f`) confirmed in git log.
