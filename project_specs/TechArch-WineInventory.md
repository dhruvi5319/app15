# Technical Architecture Document — Wine Inventory App

**Project:** WineInventory  
**Version:** 1.0  
**Date:** 2026-05-15  
**Status:** Draft  
**Based on:** PRD-WineInventory.md v1.0, FRD-WineInventory.md v1.0

---

## 1. Architectural Overview

### Pattern

WineInventory v1 follows a **Monolithic REST API + Single-Page Application (SPA)** architecture. This is the simplest, most maintainable choice for a personal inventory app at v1 scale. A single Node.js/Express backend serves the REST API; a React SPA renders the frontend. The entire stack deploys to a managed PaaS platform to minimise operational overhead.

**Why not microservices?** The domain is a single bounded context (wine inventory). Splitting into services adds operational complexity with no benefit at this scale. The architecture is designed so that future decomposition is possible if needed (e.g., extracting a search service), but premature decomposition is avoided.

**Why REST over GraphQL?** The API surface is small, well-defined, and does not require client-driven query shaping. REST is simpler to implement, cache, and document at this scale.

---

### System Architecture Diagram

```
┌─────────────────────────────────────────────────────────────┐
│                        BROWSER                              │
│  ┌──────────────────────────────────────────────────────┐   │
│  │              React SPA (Vite + TypeScript)           │   │
│  │  ┌────────────┐  ┌─────────────┐  ┌──────────────┐  │   │
│  │  │ List View  │  │ Detail Page │  │  Add / Edit  │  │   │
│  │  └────────────┘  └─────────────┘  └──────────────┘  │   │
│  │         ↕ Fetch (axios / fetch)                      │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │ HTTPS
                           ▼
┌─────────────────────────────────────────────────────────────┐
│                   PaaS (Render / Railway)                    │
│  ┌──────────────────────────────────────────────────────┐   │
│  │          Node.js / Express API Server                │   │
│  │  ┌──────────────┐  ┌────────────┐  ┌─────────────┐  │   │
│  │  │ Auth Middleware│ │  Routers   │  │  Validators │  │   │
│  │  └──────────────┘  └────────────┘  └─────────────┘  │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │               Service Layer                  │    │   │
│  │  │  WineService │ AuthService │ SearchService   │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  │  ┌──────────────────────────────────────────────┐    │   │
│  │  │         Knex.js Query Builder / ORM          │    │   │
│  │  └──────────────────────────────────────────────┘    │   │
│  └──────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
                           │ TLS (internal)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Managed PostgreSQL (Neon / Supabase)            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────┐  │
│  │    users     │  │    wines     │  │     sessions     │  │
│  └──────────────┘  └──────────────┘  └──────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

### Deployment Topology

```
┌─────────────────────────────────────────────────────────────┐
│  Production Environment                                       │
│                                                               │
│  Render (or Railway)          Neon (or Supabase)             │
│  ┌─────────────────────┐      ┌──────────────────────────┐  │
│  │  Web Service (API)  │─────▶│  PostgreSQL (managed)    │  │
│  │  Node.js Docker     │      │  + Connection pooling    │  │
│  │  container          │      │    (PgBouncer / Neon)    │  │
│  └─────────────────────┘      └──────────────────────────┘  │
│  ┌─────────────────────┐                                     │
│  │  Static Site (SPA)  │  CDN-served (Vercel / Render)       │
│  │  React build output │                                     │
│  └─────────────────────┘                                     │
└─────────────────────────────────────────────────────────────┘
```

**Key deployment decisions:**
- API and SPA deployed separately; SPA served from CDN edge, API from a single region container.
- Database on a managed serverless-compatible PostgreSQL provider (Neon preferred) to eliminate DB ops overhead.
- No Kubernetes, no orchestration — single container, PaaS auto-scaling handles traffic bursts.
- Environment variables (database URL, JWT secret) injected at runtime via PaaS secrets management.

---

### Key Architectural Decisions

| Decision | Choice | Rationale |
|----------|--------|-----------|
| Architecture pattern | Monolith REST + SPA | Simplest, lowest ops burden for v1 personal inventory scale |
| API style | REST over `/api/v1` prefix | Small, well-defined surface; no need for GraphQL flexibility |
| Database | PostgreSQL | Best-in-class full-text search (tsvector), partial indexes, CHECK constraints, UUID support |
| Auth approach | Self-hosted JWT (access + refresh tokens) | No external dependency cost; full control; Supabase Auth is a drop-in upgrade path |
| Frontend framework | React + Vite + TypeScript | Industry standard; fast HMR; large ecosystem; team familiarity |
| Query layer | Knex.js (query builder) | Lightweight, gives SQL control without a heavy ORM; migrations built-in |
| Hosting | Render (API) + Neon (DB) | Both free-tier-friendly for v1; managed, low ops |
| Search | PostgreSQL tsvector + GIN index | Native DB full-text search avoids adding Elasticsearch or similar for v1 scale |
| Soft delete | `deleted_at` column on `wines` | Preserves audit trail; hard delete is still exposed via API for user-initiated deletion |


---

## 2. Component Architecture

### Backend Components

```
server/
├── src/
│   ├── app.ts                  ← Express app factory (no side effects)
│   ├── server.ts               ← Entry point; binds port
│   ├── config/
│   │   ├── env.ts              ← Typed env vars (zod-validated)
│   │   └── db.ts               ← Knex instance + connection pool
│   ├── middleware/
│   │   ├── auth.ts             ← JWT verification; attaches req.user
│   │   ├── errorHandler.ts     ← Centralised error-to-response mapping
│   │   └── validate.ts         ← Zod schema validation wrapper
│   ├── routes/
│   │   ├── auth.routes.ts      ← POST /auth/login, /auth/refresh, /auth/logout
│   │   └── wines.routes.ts     ← All /wines/* routes
│   ├── controllers/
│   │   ├── auth.controller.ts  ← Request parsing → service call → response
│   │   └── wines.controller.ts ← Request parsing → service call → response
│   ├── services/
│   │   ├── auth.service.ts     ← Password hashing, JWT issue/verify, refresh
│   │   ├── wines.service.ts    ← CRUD, status transitions, count mutations
│   │   └── search.service.ts   ← Query builder for list/search/filter
│   ├── repositories/
│   │   ├── users.repo.ts       ← DB queries for users table
│   │   ├── wines.repo.ts       ← DB queries for wines table
│   │   └── sessions.repo.ts    ← DB queries for sessions table
│   └── types/
│       ├── wine.types.ts       ← Shared TypeScript interfaces
│       └── auth.types.ts       ← JWT payload, session types
├── migrations/                 ← Knex migration files
└── tests/
    ├── unit/                   ← Service + repo unit tests
    └── integration/            ← API endpoint tests (supertest)
```

#### Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `app.ts` | Registers middleware (CORS, JSON parsing, auth) and mounts routers. No business logic. |
| `middleware/auth.ts` | Extracts and verifies Bearer JWT on every request. Attaches `req.user = { id, email }`. Returns `401` if token is missing or invalid. |
| `middleware/errorHandler.ts` | Catches errors thrown by controllers/services and maps them to the standard error response envelope `{ error: { code, message, field } }`. |
| `middleware/validate.ts` | Wraps Zod schema validation; returns `422 VALIDATION_ERROR` with field-level detail on failure. |
| `routes/*.routes.ts` | Defines route paths, attaches auth middleware, delegates to controllers. Thin — no logic. |
| `controllers/*.controller.ts` | Parses path/query/body params, calls services, serialises response. No SQL. |
| `services/wines.service.ts` | Business rules: status transition validation, bottle count floor/ceiling, soft-delete logic. Calls repository layer for DB access. |
| `services/search.service.ts` | Builds dynamic Knex queries for the list endpoint: pagination, sort, free-text search (tsvector), structured filters (AND conditions). |
| `repositories/*.repo.ts` | Raw DB access via Knex. All SQL lives here. Returns plain objects. |

---

### Frontend Components

```
client/
├── src/
│   ├── main.tsx                ← React root; Router setup
│   ├── api/
│   │   ├── client.ts           ← Axios instance with base URL + auth header injection
│   │   └── wines.api.ts        ← Typed API functions (getWines, createWine, etc.)
│   ├── pages/
│   │   ├── InventoryListPage.tsx    ← F01: Main list view
│   │   ├── WineDetailPage.tsx       ← F04: Full record view
│   │   ├── AddWinePage.tsx          ← F00: Create form
│   │   ├── EditWinePage.tsx         ← F00: Edit form
│   │   ├── HistoryPage.tsx          ← F06: Consumed/removed list
│   │   └── LoginPage.tsx            ← Auth
│   ├── components/
│   │   ├── WineCard.tsx             ← List row: name, producer, vintage, count +/−
│   │   ├── WineForm.tsx             ← Shared create/edit form
│   │   ├── SearchFilterBar.tsx      ← F02: Search input + filter controls
│   │   ├── BottleCountControl.tsx   ← F03: +/− buttons + count display
│   │   ├── StatusBadge.tsx          ← F06: active/consumed/removed badge
│   │   ├── RatingInput.tsx          ← F05: 1–100 rating picker
│   │   ├── TastingNotesEditor.tsx   ← F05: Free-text textarea
│   │   ├── EmptyState.tsx           ← F01: Empty cellar CTA
│   │   ├── ConfirmDialog.tsx        ← F00.4: Delete confirmation modal
│   │   └── Pagination.tsx           ← Page controls
│   ├── hooks/
│   │   ├── useWines.ts              ← React Query: wine list + search state
│   │   ├── useWine.ts               ← React Query: single wine detail
│   │   └── useAuth.ts               ← Auth state (JWT storage, refresh)
│   ├── store/
│   │   └── authStore.ts             ← Zustand: access token, user info
│   └── utils/
│       ├── validation.ts            ← Client-side Zod schemas (mirrors server rules)
│       └── formatters.ts           ← Date formatting, vintage display, status labels
├── index.html
└── vite.config.ts
```

#### Frontend Component Responsibilities

| Component | Responsibility |
|-----------|---------------|
| `api/client.ts` | Axios instance; injects `Authorization: Bearer` header from auth store; intercepts `401` responses to trigger token refresh. |
| `useWines.ts` | React Query hook; manages list fetching, debounced search (300ms), filter state, pagination. Invalidates cache on mutations. |
| `SearchFilterBar.tsx` | Controlled component; emits debounced search/filter state changes upward; includes "Clear all" button. |
| `BottleCountControl.tsx` | Optimistic UI: updates local count immediately on +/− click, fires `PATCH /wines/{id}/bottle-count`. Shows zero-bottle prompt when count hits 0. |
| `WineCard.tsx` | List row; renders at-a-glance fields; hosts `BottleCountControl`; exposes status transition quick-actions. |
| `authStore.ts` | Zustand store; holds access token in memory (not localStorage); persists refresh token in httpOnly-equivalent secure storage. |


---

## 3. Data Model

### Entity Relationship Diagram

```
┌──────────────────────────────────────┐
│               users                  │
├──────────────────────────────────────┤
│  id            UUID  PK              │
│  email         VARCHAR(255) UNIQUE   │
│  password_hash VARCHAR(255)          │
│  created_at    TIMESTAMPTZ           │
│  updated_at    TIMESTAMPTZ           │
└──────────────────┬───────────────────┘
                   │ 1
                   │
                   │ has many
                   │
                   ▼ N
┌──────────────────────────────────────┐
│               wines                  │
├──────────────────────────────────────┤
│  id             UUID  PK             │
│  user_id        UUID  FK → users.id  │
│  name           VARCHAR(255) NOT NULL│
│  producer       VARCHAR(255)         │
│  vintage        SMALLINT             │
│  varietal       VARCHAR(255)         │
│  region         VARCHAR(255)         │
│  bottle_count   SMALLINT  DEFAULT 1  │
│  status         wine_status DEFAULT  │
│                 'active'             │
│  tasting_notes  TEXT                 │
│  rating         SMALLINT  (1–100)    │
│  date_added     TIMESTAMPTZ          │
│  date_updated   TIMESTAMPTZ          │
│  deleted_at     TIMESTAMPTZ          │
│  search_vector  TSVECTOR (generated) │
└──────────────────────────────────────┘

┌──────────────────────────────────────┐
│             sessions                 │
├──────────────────────────────────────┤
│  id             UUID  PK             │
│  user_id        UUID  FK → users.id  │
│  refresh_token  VARCHAR(512) UNIQUE  │
│  expires_at     TIMESTAMPTZ          │
│  created_at     TIMESTAMPTZ          │
│  revoked_at     TIMESTAMPTZ          │
└──────────────────────────────────────┘
```

**Relationship summary:**
- `users` (1) → `wines` (many): each wine record belongs to exactly one user.
- `users` (1) → `sessions` (many): each login creates one session row per device/token.
- All tasting notes and ratings are inline columns on `wines` — no separate table needed for v1.
- Soft delete is implemented via `deleted_at` on `wines`; hard delete removes the row via CASCADE.

---

### Complete DDL

#### Enum Type

```sql
-- Wine status enum
CREATE TYPE wine_status AS ENUM ('active', 'consumed', 'removed');
```

---

#### Table: users

```sql
-- User accounts.
-- password_hash is nullable to support future external auth providers (Supabase, Auth0)
-- where the identity provider manages credentials.
CREATE TABLE users (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    email           VARCHAR(255) NOT NULL UNIQUE,
    password_hash   VARCHAR(255),           -- null when using external auth
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

#### Table: wines

```sql
-- Central inventory table. One row = one distinct wine (label + vintage + producer).
-- Bottle count tracks physical stock. Status tracks lifecycle state.
-- Tasting notes and rating are inline (no separate table for v1).
CREATE TABLE wines (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL
                        REFERENCES users(id) ON DELETE CASCADE,

    -- Core identification fields
    name            VARCHAR(255) NOT NULL,
    producer        VARCHAR(255),
    vintage         SMALLINT
                        CHECK (vintage IS NULL
                            OR (vintage >= 1800 AND vintage <= 2099)),
    varietal        VARCHAR(255),
    region          VARCHAR(255),

    -- Inventory tracking
    bottle_count    SMALLINT    NOT NULL DEFAULT 1
                        CHECK (bottle_count >= 0 AND bottle_count <= 9999),
    status          wine_status NOT NULL DEFAULT 'active',

    -- Tasting / journal
    tasting_notes   TEXT,
    rating          SMALLINT
                        CHECK (rating IS NULL
                            OR (rating >= 1 AND rating <= 100)),

    -- Audit timestamps
    date_added      TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_updated    TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Soft delete support (NULL = not deleted)
    deleted_at      TIMESTAMPTZ,

    -- Generated full-text search vector over name + producer + region
    -- Updated automatically on INSERT/UPDATE by PostgreSQL
    search_vector   TSVECTOR
                        GENERATED ALWAYS AS (
                            to_tsvector('english',
                                coalesce(name,     '') || ' ' ||
                                coalesce(producer, '') || ' ' ||
                                coalesce(region,   '')
                            )
                        ) STORED
);
```

---

#### Table: sessions

```sql
-- Tracks active refresh tokens for JWT-based auth.
-- revoked_at IS NULL means the session is still valid.
-- On logout, revoked_at is set to now().
-- Expired or revoked rows can be pruned by a scheduled cleanup job.
CREATE TABLE sessions (
    id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID        NOT NULL
                        REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(512) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at      TIMESTAMPTZ                     -- NULL = active
);
```

---

#### Indexes

```sql
-- ── wines indexes ────────────────────────────────────────────────────────────

-- FK index (required; ON DELETE CASCADE without this is slow)
CREATE INDEX idx_wines_user_id
    ON wines (user_id);

-- Default list view: user's active wines, sorted by name (most common query)
CREATE INDEX idx_wines_user_status
    ON wines (user_id, status)
    WHERE deleted_at IS NULL;

-- Sort by date_added DESC (second-most common sort)
CREATE INDEX idx_wines_user_date_added
    ON wines (user_id, date_added DESC)
    WHERE deleted_at IS NULL;

-- Sort by vintage (ascending / descending supported by same index)
CREATE INDEX idx_wines_user_vintage
    ON wines (user_id, vintage)
    WHERE deleted_at IS NULL;

-- Sort by producer
CREATE INDEX idx_wines_user_producer
    ON wines (user_id, producer)
    WHERE deleted_at IS NULL;

-- Structured filter: varietal + vintage range (F02 combined filter)
CREATE INDEX idx_wines_filter_varietal_vintage
    ON wines (user_id, status, varietal, vintage)
    WHERE deleted_at IS NULL;

-- Full-text search (GIN index on generated tsvector column)
CREATE INDEX idx_wines_search_fts
    ON wines USING GIN (search_vector);

-- ── sessions indexes ─────────────────────────────────────────────────────────

-- Lookup by user (e.g., revoke all sessions on password change)
CREATE INDEX idx_sessions_user_id
    ON sessions (user_id);

-- Token lookup: only active (non-revoked) sessions
CREATE INDEX idx_sessions_token_active
    ON sessions (refresh_token)
    WHERE revoked_at IS NULL;
```

---

### Constraints Summary

| Table | Column | Constraint | Rule |
|-------|--------|-----------|------|
| `users` | `email` | UNIQUE NOT NULL | One account per email address |
| `wines` | `user_id` | FK NOT NULL | Every wine must belong to a user |
| `wines` | `name` | NOT NULL | At minimum a name is required |
| `wines` | `bottle_count` | CHECK ≥ 0 AND ≤ 9999 | Cannot go negative; capped at 9999 |
| `wines` | `vintage` | CHECK IS NULL OR 1800–2099 | Valid year range; allows null for unknown |
| `wines` | `rating` | CHECK IS NULL OR 1–100 | 1–100 scale; null means unrated |
| `wines` | `status` | ENUM `wine_status` | Only valid transitions via application layer |
| `sessions` | `refresh_token` | UNIQUE NOT NULL | One row per token; enforces no reuse |

---

### Migration Strategy

Migrations are managed by **Knex.js migrations** (`knex migrate:latest`). Migration files are versioned and committed to source control. The migration sequence for v1:

| Migration | Description |
|-----------|-------------|
| `001_create_users` | Create `users` table |
| `002_create_wine_status_enum` | Create `wine_status` ENUM type |
| `003_create_wines` | Create `wines` table with all columns, CHECK constraints, generated `search_vector` |
| `004_create_wines_indexes` | Create all performance indexes on `wines` |
| `005_create_sessions` | Create `sessions` table |
| `006_create_sessions_indexes` | Create indexes on `sessions` |


---

## 4. API Design

### Conventions

- **Base URL:** `/api/v1`
- **Authentication:** All endpoints (except `/auth/*`) require `Authorization: Bearer <jwt>` header.
- **Content-Type:** `application/json` for all request and response bodies.
- **Timestamps:** ISO 8601 UTC — `YYYY-MM-DDTHH:MM:SSZ`.
- **IDs:** UUID v4 strings.
- **Pagination defaults:** `page=1`, `per_page=25`, max `per_page=100`.
- **Versioning:** Breaking changes increment to `/api/v2`. Non-breaking additions are backward-compatible.

---

### TypeScript Interfaces

```typescript
// ── Shared domain types ───────────────────────────────────────────────────────

type WineStatus = 'active' | 'consumed' | 'removed';
type SortField  = 'name' | 'vintage' | 'producer' | 'date_added';
type SortDir    = 'asc' | 'desc';

// Full wine record (returned by detail, create, update endpoints)
interface Wine {
  id:             string;           // UUID
  name:           string;
  producer:       string | null;
  vintage:        number | null;    // 1800–2099
  varietal:       string | null;
  region:         string | null;
  bottle_count:   number;           // 0–9999
  status:         WineStatus;
  tasting_notes:  string | null;
  rating:         number | null;    // 1–100 or null
  date_added:     string;           // ISO 8601
  date_updated:   string;           // ISO 8601
}

// Abbreviated wine record (returned in list responses)
interface WineListItem {
  id:           string;
  name:         string;
  producer:     string | null;
  vintage:      number | null;
  varietal:     string | null;
  bottle_count: number;
  status:       WineStatus;
}

interface Pagination {
  total:       number;
  page:        number;
  per_page:    number;
  total_pages: number;
}

interface WineListResponse {
  results:    WineListItem[];
  pagination: Pagination;
}

// ── Auth types ────────────────────────────────────────────────────────────────

interface LoginRequest {
  email:    string;
  password: string;
}

interface LoginResponse {
  access_token:  string;   // JWT, short-lived (1h)
  refresh_token: string;   // Opaque token, long-lived (30d)
  expires_in:    number;   // seconds until access_token expires
}

interface RefreshRequest {
  refresh_token: string;
}

interface RefreshResponse {
  access_token: string;
  expires_in:   number;
}

// ── Request body types ────────────────────────────────────────────────────────

interface CreateWineRequest {
  name:         string;           // required
  producer?:    string | null;
  vintage?:     number | null;
  varietal?:    string | null;
  region?:      string | null;
  bottle_count?: number;          // default 1
}

interface UpdateWineRequest {
  name?:          string;
  producer?:      string | null;
  vintage?:       number | null;
  varietal?:      string | null;
  region?:        string | null;
  bottle_count?:  number;
  tasting_notes?: string | null;
  rating?:        number | null;
}

interface BottleCountRequest {
  action: 'increment' | 'decrement';
}

interface BottleCountResponse {
  id:               string;
  bottle_count:     number;
  zero_bottle_flag: boolean;
  date_updated:     string;
}

interface StatusUpdateRequest {
  status: WineStatus;
}

// ── Error response ────────────────────────────────────────────────────────────

interface ApiError {
  error: {
    code:     string;
    message:  string;
    field?:   string;   // only present for VALIDATION_ERROR
  };
}

// ── List query parameters (client-side model) ─────────────────────────────────

interface WineListParams {
  page?:          number;
  per_page?:      number;
  sort?:          SortField;
  direction?:     SortDir;
  status?:        WineStatus | 'all';
  q?:             string;         // free-text search
  varietal?:      string;         // exact match
  region?:        string;         // partial match
  producer?:      string;         // partial match
  vintage?:       number;         // exact year
  vintage_from?:  number;         // range start
  vintage_to?:    number;         // range end
}
```

---

### Endpoint Reference

#### Auth Endpoints

| Method | Path | Auth Required | Description |
|--------|------|:---:|-------------|
| `POST` | `/api/v1/auth/login` | No | Authenticate with email/password; receive access + refresh tokens |
| `POST` | `/api/v1/auth/refresh` | No | Exchange refresh token for new access token |
| `POST` | `/api/v1/auth/logout` | Yes | Revoke current refresh token |

---

**POST /api/v1/auth/login**

Request body: `LoginRequest`

Response `200`: `LoginResponse`

Errors:
- `401 UNAUTHORIZED` — invalid credentials
- `422 VALIDATION_ERROR` — missing email or password

---

**POST /api/v1/auth/refresh**

Request body: `RefreshRequest`

Response `200`: `RefreshResponse`

Errors:
- `401 UNAUTHORIZED` — refresh token invalid, expired, or revoked

---

**POST /api/v1/auth/logout**

Request body: `{}` (token identified from `Authorization` header)

Response: `204 No Content`

---

#### Wine Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/api/v1/wines` | Paginated, sorted, filterable list of wines |
| `POST` | `/api/v1/wines` | Create a new wine record |
| `GET` | `/api/v1/wines/:wine_id` | Retrieve a single wine (full record) |
| `PATCH` | `/api/v1/wines/:wine_id` | Partial update (fields, tasting notes, rating) |
| `DELETE` | `/api/v1/wines/:wine_id` | Hard-delete a wine record |
| `PATCH` | `/api/v1/wines/:wine_id/bottle-count` | Increment or decrement bottle count by 1 |
| `PATCH` | `/api/v1/wines/:wine_id/status` | Transition wine lifecycle status |

---

**GET /api/v1/wines**

Query parameters: `WineListParams`

Response `200`: `WineListResponse`

Behaviour:
- Default `status=active` — only active wines returned unless overridden.
- `q` performs full-text search against `name`, `producer`, `region` (PostgreSQL tsvector).
- `varietal` uses case-insensitive exact match (`ILIKE`).
- `region` and `producer` use case-insensitive partial match (`ILIKE '%value%'`).
- `vintage_from`/`vintage_to` define an inclusive range; `vintage` alone is an exact match.
- Cannot combine `vintage` with `vintage_from`/`vintage_to` — returns `422`.
- All filters are combined with AND logic.
- `per_page` is silently capped at 100.

Errors:
- `401 UNAUTHORIZED`
- `422 VALIDATION_ERROR` — invalid sort, direction, or vintage params

---

**POST /api/v1/wines**

Request body: `CreateWineRequest`

Response `201`: `Wine`

Behaviour:
- `name` is the only required field.
- `status` defaults to `active`; cannot be set at creation time.
- `bottle_count` defaults to `1` if omitted.
- `date_added` and `date_updated` are set to `now()` server-side.

Errors:
- `401 UNAUTHORIZED`
- `422 VALIDATION_ERROR` — name missing, vintage out of range, bottle_count invalid

---

**GET /api/v1/wines/:wine_id**

Path parameter: `wine_id` (UUID)

Response `200`: `Wine` (full record including tasting_notes, rating)

Errors:
- `400 INVALID_ID` — wine_id not a valid UUID
- `401 UNAUTHORIZED`
- `403 FORBIDDEN` — wine belongs to another user
- `404 NOT_FOUND`

---

**PATCH /api/v1/wines/:wine_id**

Request body: `UpdateWineRequest` (any subset of fields)

Response `200`: `Wine` (updated full record)

Behaviour:
- Only fields present in the request body are updated (`undefined` fields are untouched).
- `status` cannot be changed via this endpoint — use `/status` sub-resource.
- `tasting_notes: null` clears the notes field.
- `rating: null` clears the rating.
- `tasting_notes: ""` (empty string) is treated as `null` server-side.

Errors:
- `400 INVALID_ID`
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `422 VALIDATION_ERROR`

---

**DELETE /api/v1/wines/:wine_id**

Response: `204 No Content`

Behaviour:
- Performs a hard delete of the wine row and all related sessions-level data.
- If the wine has a `deleted_at` value (soft-deleted), it is still permanently removed.

Errors:
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`

---

**PATCH /api/v1/wines/:wine_id/bottle-count**

Request body: `BottleCountRequest`

Response `200`: `BottleCountResponse`

Behaviour:
- `increment` adds 1; capped at 9999.
- `decrement` subtracts 1; floor is 0 (returns `422 COUNT_BELOW_ZERO` if already 0).
- `zero_bottle_flag: true` in response when new count = 0.

Errors:
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `422 COUNT_BELOW_ZERO` — decrement at zero
- `422 VALIDATION_ERROR` — invalid action value

---

**PATCH /api/v1/wines/:wine_id/status**

Request body: `StatusUpdateRequest`

Response `200`: `Wine` (updated full record)

Behaviour — valid transitions only:

| From → To | Allowed? |
|-----------|:--------:|
| `active` → `consumed` | ✓ |
| `active` → `removed` | ✓ |
| `consumed` → `active` | ✓ (revert) |
| `removed` → `active` | ✓ (revert) |
| `consumed` → `removed` | ✗ (must revert to active first) |
| `removed` → `consumed` | ✗ (must revert to active first) |
| same → same | ✗ (no-op, rejected) |

Errors:
- `401 UNAUTHORIZED`
- `403 FORBIDDEN`
- `404 NOT_FOUND`
- `422 INVALID_TRANSITION` — disallowed state change or no-op
- `422 VALIDATION_ERROR` — unknown status value

---

### Standard Error Response

All error responses use this envelope:

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable description",
    "field": "field_name (VALIDATION_ERROR only, optional)"
  }
}
```

**Error code catalogue:**

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `UNAUTHORIZED` | 401 | JWT missing, expired, or invalid |
| `FORBIDDEN` | 403 | Authenticated user does not own the resource |
| `NOT_FOUND` | 404 | Wine record does not exist |
| `INVALID_ID` | 400 | Path parameter `wine_id` is not a valid UUID |
| `VALIDATION_ERROR` | 422 | Field-level validation failure (see `field` property) |
| `COUNT_BELOW_ZERO` | 422 | Decrement attempted when `bottle_count` is 0 |
| `INVALID_TRANSITION` | 422 | Status transition is not permitted |
| `INTERNAL_ERROR` | 500 | Unexpected server-side failure |
| `RATE_LIMITED` | 429 | Too many requests; `Retry-After` header included |


---

## 5. Security Architecture

### Authentication

WineInventory v1 uses **self-hosted JWT-based authentication** (access token + refresh token pattern). An external provider (Supabase Auth, Auth0) is a drop-in upgrade path that requires no schema changes to the `wines` table.

**Token lifecycle:**

```
User                  API Server              Database
 │                        │                      │
 │  POST /auth/login       │                      │
 │  { email, password }   │                      │
 │ ───────────────────────▶│                      │
 │                         │  SELECT user         │
 │                         │ ────────────────────▶│
 │                         │◀────────────────────-│
 │                         │  bcrypt.compare()    │
 │                         │  sign access_token   │
 │                         │  sign refresh_token  │
 │                         │  INSERT session      │
 │                         │ ────────────────────▶│
 │◀───────────────────────-│                      │
 │  { access_token,        │                      │
 │    refresh_token }      │                      │
 │                         │                      │
 │  (access_token expires  │                      │
 │   after 1 hour)         │                      │
 │                         │                      │
 │  POST /auth/refresh     │                      │
 │  { refresh_token }      │                      │
 │ ───────────────────────▶│                      │
 │                         │  SELECT session      │
 │                         │  (WHERE revoked_at   │
 │                         │   IS NULL AND        │
 │                         │   expires_at > now)  │
 │                         │ ────────────────────▶│
 │                         │◀────────────────────-│
 │                         │  sign new            │
 │                         │  access_token        │
 │◀───────────────────────-│                      │
 │  { access_token }       │                      │
```

**Token configuration:**

| Token | Lifetime | Storage (client) | Notes |
|-------|----------|-----------------|-------|
| Access token (JWT) | 1 hour | In-memory (Zustand store) | Never persisted to localStorage in production |
| Refresh token | 30 days | Secure httpOnly cookie or secure storage | Stored in `sessions` table; revocable |

**JWT payload:**
```json
{
  "sub": "<user_uuid>",
  "email": "user@example.com",
  "iat": 1716000000,
  "exp": 1716003600
}
```

**JWT signing:**
- Algorithm: `HS256` (HMAC-SHA256)
- Secret: minimum 64-byte random string, stored as environment variable `JWT_SECRET`
- Upgrade path: move to `RS256` (asymmetric) if the API is exposed to third-party clients

---

### Authorization

All API routes (except `/auth/*`) apply the following authorization model:

1. **Authentication middleware** (`middleware/auth.ts`) verifies the JWT signature and expiry on every request. Invalid or expired tokens return `401 UNAUTHORIZED`.

2. **Resource ownership** is enforced at the service layer for all wine operations:
   ```typescript
   // All wine queries include user_id scoping:
   WHERE user_id = req.user.id AND deleted_at IS NULL
   ```
   A request for a wine that exists but belongs to another user returns `403 FORBIDDEN` — not `404`, to avoid information leakage about other users' data. However, note: the 403 vs 404 choice leaks that *a* wine exists at that ID. For v1 personal use this is acceptable; for multi-tenant SaaS, return 404 for both cases.

3. **No admin roles in v1.** Every authenticated user has identical permissions scoped to their own data.

---

### Data Protection

| Concern | Control |
|---------|---------|
| Passwords at rest | Hashed with **bcrypt** (cost factor ≥ 12). Plain-text passwords never stored or logged. |
| Tokens in transit | All traffic over **HTTPS/TLS 1.2+**. HTTP redirected to HTTPS at PaaS edge. |
| Database connection | TLS-encrypted connection string. Credentials in environment variables, never in source code. |
| JWT secret | Stored in PaaS secrets manager. Rotatable without data migration. |
| Soft-deleted wines | `deleted_at IS NOT NULL` wines are excluded from all queries by default; only accessible by DB admin for audit purposes. |
| Logging | Access logs do not include request bodies (no password or token leakage in logs). Structured JSON logs only. |
| CORS | API allows requests only from the known SPA origin (`ALLOWED_ORIGIN` env var). Credentials mode enabled for cookie-based refresh token flow. |

---

### Input Validation & Injection Prevention

- **Server-side validation:** All request bodies and query parameters are validated via **Zod** schemas before reaching the service layer. Unknown fields are stripped (`.strip()` mode).
- **SQL injection:** Knex.js uses parameterised queries for all DB interactions. No raw string concatenation in SQL.
- **XSS:** The API is JSON-only; no HTML rendering server-side. The React frontend uses React's default escaping for all rendered strings.
- **Rate limiting:** Basic infrastructure-level throttle (200 req/min per user). `429 Too Many Requests` with `Retry-After` header.

---

### Security Headers

The Express API sets the following headers (via `helmet` middleware):

| Header | Value |
|--------|-------|
| `X-Content-Type-Options` | `nosniff` |
| `X-Frame-Options` | `DENY` |
| `Strict-Transport-Security` | `max-age=31536000; includeSubDomains` |
| `Content-Security-Policy` | `default-src 'none'; frame-ancestors 'none'` (API responses) |
| `X-XSS-Protection` | `0` (modern browsers; CSP is preferred) |


---

## 6. Technology Stack

### Stack Table

| Layer | Technology | Version | Purpose |
|-------|------------|---------|---------|
| **Frontend framework** | React | 18.x | SPA component model |
| **Frontend build tool** | Vite | 5.x | Fast HMR, optimised production builds |
| **Frontend language** | TypeScript | 5.x | Type safety across client code |
| **Frontend routing** | React Router | 6.x | Client-side navigation |
| **Frontend data fetching** | TanStack Query (React Query) | 5.x | Server state, caching, cache invalidation |
| **Frontend state** | Zustand | 4.x | Auth token in-memory store |
| **Frontend HTTP client** | Axios | 1.x | API calls with interceptors for auth refresh |
| **Frontend styling** | Tailwind CSS | 3.x | Utility-first; fast mobile-responsive layout |
| **Frontend validation** | Zod | 3.x | Client-side form validation (mirrors server rules) |
| **Backend runtime** | Node.js | 20 LTS | JavaScript runtime |
| **Backend framework** | Express.js | 4.x | REST API framework |
| **Backend language** | TypeScript | 5.x | Type safety across server code |
| **Backend validation** | Zod | 3.x | Request body + query param validation |
| **Backend auth** | `jsonwebtoken` | 9.x | JWT sign and verify |
| **Backend password hashing** | `bcrypt` | 5.x | Password hashing (cost factor 12) |
| **Backend security headers** | `helmet` | 7.x | HTTPS / XSS / frame injection headers |
| **Backend CORS** | `cors` (Express) | 2.x | Origin allowlist |
| **Query builder** | Knex.js | 3.x | SQL query builder + migrations |
| **Database** | PostgreSQL | 16.x | Primary data store |
| **DB hosting (prod)** | Neon (serverless Postgres) | — | Managed, serverless, free tier |
| **DB hosting (dev/test)** | Docker `postgres:16` | — | Local development |
| **API hosting** | Render (Web Service) | — | PaaS, auto-deploy from Git, free tier available |
| **SPA hosting** | Render (Static Site) or Vercel | — | CDN-served, HTTPS by default |
| **Test runner (backend)** | Vitest | 1.x | Unit + integration tests |
| **API integration tests** | Supertest | 7.x | HTTP-level endpoint tests against real Express app |
| **Test runner (frontend)** | Vitest + React Testing Library | 1.x | Component and hook tests |
| **Linter** | ESLint + TypeScript ESLint | 8.x | Code quality |
| **Formatter** | Prettier | 3.x | Consistent code style |
| **Container** | Docker + docker-compose | — | Local dev: API + DB together |
| **CI/CD** | GitHub Actions | — | Lint → test → build → deploy on push to main |

---

### Dependency Notes

- **Why Knex over Prisma/TypeORM?** Knex gives direct SQL control, which matters for the PostgreSQL-specific features used (tsvector, partial indexes, ENUM types, generated columns). Prisma's schema abstraction would complicate these. Knex migrations are also simpler for a small schema.

- **Why React Query over SWR or plain `useEffect`?** React Query's cache invalidation model is a natural fit for the optimistic UI on bottle count updates: fire the mutation, invalidate the `wines` cache, refetch silently in the background.

- **Why Tailwind over a component library (MUI, Chakra)?** A component library adds bundle weight and design constraints. Tailwind lets us build a wine-specific UI without fighting framework defaults. The tradeoff is more custom CSS; acceptable for a focused v1.

- **Why Neon over Supabase for DB?** Neon's branching feature supports preview environments per PR. Supabase is the preferred upgrade if Auth is migrated from self-hosted JWT to managed auth — both are viable.

---

### Local Development Setup

```
# Prerequisites: Docker, Node.js 20+, pnpm (or npm)

# 1. Clone and install
git clone <repo>
cd wine-inventory
pnpm install

# 2. Start local Postgres
docker-compose up -d db

# 3. Run migrations
cd server && pnpm knex migrate:latest

# 4. Start API server (with hot reload)
pnpm --filter server dev

# 5. Start SPA (in a separate terminal)
pnpm --filter client dev
# → http://localhost:5173

# API available at http://localhost:3000/api/v1
```

`docker-compose.yml` services:
- `db`: `postgres:16-alpine`, port 5432, volume-mounted for persistence
- (optional) `adminer`: lightweight DB UI at port 8080


---

## 7. Integration Points

### External Dependencies Summary

WineInventory v1 has a deliberately minimal external surface. All data is generated and stored internally.

| Integration | Category | Status | Notes |
|-------------|----------|--------|-------|
| PostgreSQL (Neon) | Database | Required | All wine, user, session data |
| Render (or Railway) | Hosting / PaaS | Required | API container + static SPA deployment |
| Email / SMTP | Transactional email | Optional in v1 | Only required if password reset is in scope |

---

### PostgreSQL (Neon)

**Role:** Primary and only persistent data store.

**Connection:** Standard `DATABASE_URL` environment variable (postgresql connection string with SSL required).

**Specific PostgreSQL features used:**
- `gen_random_uuid()` — UUID v4 primary key generation
- `TIMESTAMPTZ` — timezone-aware timestamps
- `ENUM` type (`wine_status`) — status column constraint
- `TSVECTOR` generated column + `GIN` index — full-text search
- Partial indexes (`WHERE deleted_at IS NULL`) — query performance
- `CHECK` constraints — `bottle_count`, `vintage`, `rating` bounds
- `ON DELETE CASCADE` — referential integrity on `user_id` FK

**Connection pooling:** Neon's built-in serverless pooling (PgBouncer-compatible). For non-serverless deployments, configure `max` connection pool size in Knex to avoid exhausting Postgres max connections (recommended: `max: 10` for a single-instance API on free tier).

---

### Render (Hosting)

**Role:** API hosting (Web Service) + SPA hosting (Static Site).

**Deployment trigger:** Push to `main` branch triggers CI/CD pipeline (GitHub Actions → Render deploy hook).

**Environment variables managed in Render dashboard:**

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string (from Neon) |
| `JWT_SECRET` | Minimum 64-byte random string for JWT signing |
| `JWT_EXPIRES_IN` | Access token lifetime, e.g. `3600` (seconds) |
| `JWT_REFRESH_EXPIRES_IN` | Refresh token lifetime, e.g. `2592000` (30 days, seconds) |
| `ALLOWED_ORIGIN` | SPA origin for CORS, e.g. `https://wineinventory.app` |
| `NODE_ENV` | `production` |
| `PORT` | `10000` (Render default) |

---

### Email / SMTP (Optional)

**Role:** Transactional email for password reset (only required if password reset is in scope for v1).

**Recommended provider:** Postmark or AWS SES (free tier sufficient for v1 volume).

**Templates required (v1 only):**
1. Password reset link (single-use token, expires 1 hour)
2. Welcome email (optional; triggered on first login)

**If deferred:** The auth flow can ship without password reset in v1 (admin resets password via DB directly for early users). This is a viable v1 simplification.

---

### Explicitly Out-of-Scope Integrations (v1)

| Integration | Reason |
|-------------|--------|
| Wine database APIs (Vivino, Wine-Searcher) | Auto-fill details adds complexity; not core value for v1 |
| Barcode scanning | Mobile-native; v1 is web-only |
| Analytics (Mixpanel, Amplitude) | Nice-to-have; add post-launch |
| Social / sharing | Deferred to v2 |
| Payment / marketplace | Out of scope indefinitely |
| Cellar sensors / IoT | Hardware dependency |

---

*End of Technical Architecture Document — WineInventory v1.0*
