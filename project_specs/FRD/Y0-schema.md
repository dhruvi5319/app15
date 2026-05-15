
---

## Y0: Database Schema

This section contains the canonical DDL for all database entities in WineInventory v1. The schema is designed to support collections from a few bottles to 50,000 records per user, with indexes tuned for the list view, search, and filter operations.

---

### §users

Stores user account information. In v1 this supports a single-user or minimal account model; the table is included to provide `user_id` scoping for all wine records.

```sql
CREATE TABLE users (
    id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email       VARCHAR(255) NOT NULL UNIQUE,
    password_hash VARCHAR(255),          -- nullable if using external auth
    created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);
```

---

### §wines

The central table. Every wine record belongs to a user. All optional text fields default to NULL.

```sql
CREATE TYPE wine_status AS ENUM ('active', 'consumed', 'removed');

CREATE TABLE wines (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,

    -- Core fields
    name            VARCHAR(255) NOT NULL,
    producer        VARCHAR(255),
    vintage         SMALLINT
                        CHECK (vintage IS NULL OR (vintage >= 1800 AND vintage <= 2099)),
    varietal        VARCHAR(255),
    region          VARCHAR(255),

    -- Inventory
    bottle_count    SMALLINT NOT NULL DEFAULT 1
                        CHECK (bottle_count >= 0 AND bottle_count <= 9999),
    status          wine_status NOT NULL DEFAULT 'active',

    -- Tasting
    tasting_notes   TEXT,
    rating          SMALLINT
                        CHECK (rating IS NULL OR (rating >= 1 AND rating <= 100)),

    -- Timestamps
    date_added      TIMESTAMPTZ NOT NULL DEFAULT now(),
    date_updated    TIMESTAMPTZ NOT NULL DEFAULT now(),

    -- Soft delete (optional; supports auditing)
    deleted_at      TIMESTAMPTZ
);
```

---

### §wines — Indexes

Indexes are defined to support the performance requirements: list view < 1s, search < 500ms, for up to 50,000 records per user.

```sql
-- Primary lookup: user's active wines (default list view)
CREATE INDEX idx_wines_user_status
    ON wines (user_id, status)
    WHERE deleted_at IS NULL;

-- Sort by date_added (common secondary sort)
CREATE INDEX idx_wines_user_date_added
    ON wines (user_id, date_added DESC)
    WHERE deleted_at IS NULL;

-- Sort by vintage
CREATE INDEX idx_wines_user_vintage
    ON wines (user_id, vintage)
    WHERE deleted_at IS NULL;

-- Sort by producer
CREATE INDEX idx_wines_user_producer
    ON wines (user_id, producer)
    WHERE deleted_at IS NULL;

-- Structured filter: varietal + vintage range (common combined filter)
CREATE INDEX idx_wines_filter_varietal_vintage
    ON wines (user_id, status, varietal, vintage)
    WHERE deleted_at IS NULL;

-- Full-text search across name, producer, region
-- Using PostgreSQL tsvector for full-text search:
ALTER TABLE wines
    ADD COLUMN search_vector TSVECTOR
        GENERATED ALWAYS AS (
            to_tsvector('english',
                coalesce(name, '') || ' ' ||
                coalesce(producer, '') || ' ' ||
                coalesce(region, '')
            )
        ) STORED;

CREATE INDEX idx_wines_search_fts
    ON wines USING GIN (search_vector);
```

> **Note:** If the database does not support generated TSVECTOR columns (e.g., MySQL or SQLite), full-text search can be implemented via `LIKE`/`ILIKE` queries on `name`, `producer`, and `region` with a composite index on those columns. The TechArch document will specify the exact database engine and search approach.

---

### §sessions (optional — if not using external auth)

If v1 implements its own JWT-based session management (rather than delegating entirely to an external auth provider), a sessions table may be used to track refresh tokens.

```sql
CREATE TABLE sessions (
    id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id         UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    refresh_token   VARCHAR(512) NOT NULL UNIQUE,
    expires_at      TIMESTAMPTZ NOT NULL,
    created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
    revoked_at      TIMESTAMPTZ                      -- null = active
);

CREATE INDEX idx_sessions_user ON sessions (user_id);
CREATE INDEX idx_sessions_token ON sessions (refresh_token) WHERE revoked_at IS NULL;
```

---

### Entity Relationship Summary

```
users (1) ──< wines (many)
  id ──────────── user_id

wines (1) has:
  - tasting_notes (inline column)
  - rating (inline column)
  - status: active | consumed | removed
```

All tasting notes and rating data live directly on the `wines` row. No separate notes table is needed in v1.

---

### Constraints Summary

| Table | Column | Constraint |
|-------|--------|-----------|
| `wines` | `bottle_count` | `>= 0 AND <= 9999` |
| `wines` | `vintage` | `IS NULL OR (>= 1800 AND <= 2099)` |
| `wines` | `rating` | `IS NULL OR (>= 1 AND <= 100)` |
| `wines` | `status` | ENUM: `active`, `consumed`, `removed` |
| `wines` | `name` | `NOT NULL`, max 255 chars |
| `users` | `email` | `NOT NULL UNIQUE` |
