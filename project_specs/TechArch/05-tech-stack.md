
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

