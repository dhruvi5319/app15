
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

