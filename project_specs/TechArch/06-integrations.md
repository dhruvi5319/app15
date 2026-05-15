
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
