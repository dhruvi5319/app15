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

