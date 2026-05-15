
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

