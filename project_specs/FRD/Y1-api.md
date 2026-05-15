
---

## Y1: REST API Endpoint Catalog

**Base URL:** `/api/v1`  
**Authentication:** All endpoints require `Authorization: Bearer <jwt_token>` header.  
**Content-Type:** `application/json` for all request and response bodies.  
**Timestamps:** ISO 8601 UTC (`YYYY-MM-DDTHH:MM:SSZ`).

---

### §Auth

> Auth endpoints depend on the TechArch stack decision. The following are representative endpoints for a self-hosted JWT model. If an external auth provider (e.g., Auth0, Supabase Auth) is used, these endpoints may be replaced by provider-specific flows.

#### POST /auth/login

Login and obtain access + refresh tokens.

**Request:**
```json
{
  "email": "string",
  "password": "string"
}
```

**Response 200:**
```json
{
  "access_token": "string (JWT)",
  "refresh_token": "string",
  "expires_in": 3600
}
```

**Errors:** `401 UNAUTHORIZED` (invalid credentials), `422 VALIDATION_ERROR` (missing fields)

---

#### POST /auth/refresh

Exchange a refresh token for a new access token.

**Request:**
```json
{ "refresh_token": "string" }
```

**Response 200:**
```json
{
  "access_token": "string (JWT)",
  "expires_in": 3600
}
```

**Errors:** `401 UNAUTHORIZED` (invalid/expired refresh token)

---

#### POST /auth/logout

Revoke the current refresh token.

**Request:** `{}` (empty body; token identified from Bearer header)

**Response:** `204 No Content`

---

### §Wine CRUD

#### POST /wines

Create a new wine record.

**Request:**
```json
{
  "name": "string (required)",
  "producer": "string | null",
  "vintage": "integer | null",
  "varietal": "string | null",
  "region": "string | null",
  "bottle_count": "integer (default: 1)"
}
```

**Response 201:**
```json
{
  "id": "uuid",
  "name": "string",
  "producer": "string | null",
  "vintage": "integer | null",
  "varietal": "string | null",
  "region": "string | null",
  "bottle_count": "integer",
  "status": "active",
  "tasting_notes": null,
  "rating": null,
  "date_added": "ISO 8601",
  "date_updated": "ISO 8601"
}
```

**Errors:** `401`, `422 VALIDATION_ERROR`

---

#### GET /wines/{wine_id}

Retrieve a single wine record.

**Path parameter:** `wine_id` (UUID)

**Response 200:** Full wine object (same shape as POST response above).

**Errors:** `400 INVALID_ID`, `401`, `403 FORBIDDEN`, `404 NOT_FOUND`

---

#### PATCH /wines/{wine_id}

Partial update of a wine record. Only send fields to be changed.

**Request (any subset of):**
```json
{
  "name": "string",
  "producer": "string | null",
  "vintage": "integer | null",
  "varietal": "string | null",
  "region": "string | null",
  "bottle_count": "integer",
  "tasting_notes": "string | null",
  "rating": "integer | null"
}
```

**Response 200:** Updated full wine object.

**Errors:** `400`, `401`, `403`, `404`, `422 VALIDATION_ERROR`

---

#### DELETE /wines/{wine_id}

Hard-delete a wine record and all associated data.

**Response:** `204 No Content`

**Errors:** `401`, `403`, `404`

---

### §Wine List

#### GET /wines

Retrieve a paginated, sorted, filtered list of wines.

**Query parameters:**

| Parameter | Type | Default | Notes |
|-----------|------|---------|-------|
| `page` | integer | 1 | ≥ 1 |
| `per_page` | integer | 25 | 1–100 |
| `sort` | enum | `name` | `name`, `vintage`, `producer`, `date_added` |
| `direction` | enum | `asc` | `asc`, `desc` |
| `status` | enum | `active` | `active`, `consumed`, `removed`, `all` |
| `q` | string | — | Free-text search: name, producer, region |
| `varietal` | string | — | Exact match (case-insensitive) |
| `region` | string | — | Partial match (case-insensitive) |
| `producer` | string | — | Partial match (case-insensitive) |
| `vintage` | integer | — | Exact vintage year |
| `vintage_from` | integer | — | Range start (inclusive) |
| `vintage_to` | integer | — | Range end (inclusive) |

**Response 200:**
```json
{
  "results": [
    {
      "id": "uuid",
      "name": "string",
      "producer": "string | null",
      "vintage": "integer | null",
      "varietal": "string | null",
      "bottle_count": "integer",
      "status": "active | consumed | removed"
    }
  ],
  "pagination": {
    "total": "integer",
    "page": "integer",
    "per_page": "integer",
    "total_pages": "integer"
  }
}
```

**Errors:** `401`, `422 VALIDATION_ERROR` (invalid sort/direction/vintage params)

---

### §Bottle Count

#### PATCH /wines/{wine_id}/bottle-count

Increment or decrement bottle count by 1.

**Request:**
```json
{ "action": "increment | decrement" }
```

**Response 200:**
```json
{
  "id": "uuid",
  "bottle_count": "integer",
  "zero_bottle_flag": "boolean",
  "date_updated": "ISO 8601"
}
```

**Errors:** `401`, `403`, `404`, `422 COUNT_BELOW_ZERO` (decrement at 0), `422 VALIDATION_ERROR` (invalid action)

---

### §Status Transitions

#### PATCH /wines/{wine_id}/status

Transition a wine's status.

**Request:**
```json
{ "status": "active | consumed | removed" }
```

**Response 200:** Updated full wine object.

**Errors:** `401`, `403`, `404`, `422 INVALID_TRANSITION`, `422 VALIDATION_ERROR`

---

### §Standard Error Response Shape

All error responses use this envelope:

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable description",
    "field": "field_name (for VALIDATION_ERROR only, optional)"
  }
}
```

**Example:**
```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "vintage must be between 1800 and 2031",
    "field": "vintage"
  }
}
```

---

### §API Versioning

- All endpoints are prefixed `/api/v1/`.
- The version prefix is included for forward-compatibility; no version negotiation is required in v1.
- Breaking changes will increment the version prefix to `/api/v2/`.

---

### §Rate Limiting

- v1 does not implement per-endpoint rate limiting.
- Basic server-level throttling may be applied at the infrastructure level (e.g., 200 requests/minute per user).
- `429 Too Many Requests` is returned if throttling is triggered, with `Retry-After` header.
