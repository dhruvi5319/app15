
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

