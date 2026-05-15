
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

