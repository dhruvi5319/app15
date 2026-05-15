
---

## Y3: External Integration Points

This section documents all external system dependencies for WineInventory v1. Given v1's narrow scope (personal inventory, no external data sources), integrations are minimal.

---

### §Authentication Provider (TBD)

**Dependency:** User identity and session management.

**Options under consideration** (resolved in TechArch):

| Option | Description | Impact on FRD |
|--------|-------------|---------------|
| Self-hosted JWT | App manages password hashing, token generation, refresh tokens | Uses `users` and `sessions` tables (see Y0-schema.md) |
| Supabase Auth | Managed auth with JWT; user record auto-provisioned | `users` table may be managed by Supabase; `user_id` is a UUID from Supabase |
| Auth0 / Clerk | External identity provider; JWT issued by provider | App trusts provider's JWT; no local password storage |

**Contract (regardless of provider):**
- All API requests must carry a valid Bearer JWT.
- JWT payload must include `sub` claim (user ID as UUID) and `exp` claim (expiry timestamp).
- The application backend validates JWT signature and expiry on every request.
- If JWT is invalid or expired, respond with `401 UNAUTHORIZED`.

---

### §Database

**Dependency:** Persistent storage for all wine records, users, and sessions.

**Requirements:**
- Must support full-text search OR efficient `ILIKE` queries across `name`, `producer`, `region`.
- Must support CHECK constraints for `bottle_count >= 0`, `rating` range, `vintage` range.
- Must support partial indexes (`WHERE deleted_at IS NULL`).
- Must support UUID primary keys.

**Likely choices** (resolved in TechArch): PostgreSQL (preferred), MySQL 8+, or SQLite (dev only).

---

### §Hosting / Cloud Infrastructure

**Dependency:** Server compute and managed database hosting.

**Requirements:**
- 99.5% uptime SLA.
- Supports automated database backups.
- Low-ops deployment (managed platform preferred over raw VMs).

**Likely choices** (resolved in TechArch): Render, Railway, Fly.io, Supabase (for DB + Auth), AWS (ECS + RDS), or Vercel + Neon (serverless).

---

### §Email (Optional — v1)

**Dependency:** Transactional email for account operations (password reset, welcome email).

- In v1, email is only required if self-hosted auth is used and password reset is in scope.
- If an external auth provider handles password reset flows, no app-level email integration is needed.
- If required: SMTP relay or transactional email service (SendGrid, Postmark, AWS SES) with minimal scope (1–2 templates).

---

### §Out-of-Scope Integrations (v1)

The following integrations are explicitly deferred to future versions:

| Integration | Reason Deferred |
|-------------|----------------|
| Wine database APIs (e.g., Vivino, Wine-Searcher) | Auto-population of wine details adds complexity; not core v1 value |
| Barcode scanning | Mobile-native feature; v1 is web-only |
| Social / sharing APIs | Social features deferred to v2 |
| Payment / marketplace | Out of scope indefinitely |
| Cellar temperature sensors / IoT | Hardware dependency; not feasible in v1 |
| Analytics / telemetry (e.g., Mixpanel, Amplitude) | Nice-to-have; add after initial launch for session tracking and funnel analysis |

---

*No external API integrations are required in WineInventory v1 beyond an authentication provider and a database. All data is generated and stored internally by the application.*
