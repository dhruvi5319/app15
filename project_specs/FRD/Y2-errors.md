
---

## Y2: Cross-Feature Error Catalog

This section catalogs all error codes used across WineInventory v1, with HTTP status codes, descriptions, and retry guidance.

---

### Error Response Format

All API errors return JSON in the following shape:

```json
{
  "error": {
    "code": "ERROR_CODE_STRING",
    "message": "Human-readable description",
    "field": "field_name (only for VALIDATION_ERROR)"
  }
}
```

---

### HTTP Status Code Summary

| HTTP Status | Meaning | Used When |
|-------------|---------|-----------|
| `200 OK` | Success with body | Read, update operations |
| `201 Created` | Resource created | POST /wines |
| `204 No Content` | Success, no body | DELETE, logout |
| `400 Bad Request` | Malformed request | Invalid UUID format |
| `401 Unauthorized` | Not authenticated | Missing/expired JWT |
| `403 Forbidden` | Authenticated but not authorized | Cross-user access attempt |
| `404 Not Found` | Resource does not exist | Wine ID not found |
| `422 Unprocessable Entity` | Validation failure | Business rule violation |
| `429 Too Many Requests` | Rate limit exceeded | Infrastructure throttle |
| `500 Internal Server Error` | Unexpected server error | Database failure, etc. |
| `503 Service Unavailable` | Server temporarily down | Maintenance, overload |

---

### Error Code Catalog

| Error Code | HTTP Status | Feature | Description | Retry? |
|-----------|-------------|---------|-------------|--------|
| `UNAUTHORIZED` | 401 | All | JWT token missing, expired, or invalid | Re-authenticate |
| `FORBIDDEN` | 403 | All | Authenticated user does not own the requested resource | No |
| `NOT_FOUND` | 404 | F00, F03, F04, F06 | Wine record with given ID does not exist (or was hard-deleted) | No |
| `INVALID_ID` | 400 | F00, F04 | Path parameter `wine_id` is not a valid UUID | Fix request |
| `VALIDATION_ERROR` | 422 | All | One or more fields failed validation; see `field` in response | Fix request |
| `COUNT_BELOW_ZERO` | 422 | F03 | Decrement attempted when `bottle_count` is already 0 | No |
| `INVALID_TRANSITION` | 422 | F06 | Status transition not permitted (see transition matrix) | Fix request |
| `INTERNAL_ERROR` | 500 | All | Unexpected server-side failure | Retry with backoff |
| `RATE_LIMITED` | 429 | All | Too many requests; `Retry-After` header included | After delay |

---

### Validation Error Details

`VALIDATION_ERROR` responses include a `field` property identifying the offending input:

| Field | Rule Violated | Message |
|-------|--------------|---------|
| `name` | Missing or blank | "name is required" |
| `name` | Exceeds 255 chars | "name must be 255 characters or fewer" |
| `vintage` | Out of range | "vintage must be between 1800 and [current_year+5]" |
| `bottle_count` | Below 0 | "bottle_count cannot be negative" |
| `bottle_count` | Exceeds 9999 | "bottle_count cannot exceed 9999" |
| `rating` | Out of range (not 1–5) | "rating must be between 1 and 5" |
| `rating` | Not an integer | "rating must be a whole number" |
| `sort` | Unknown value | "sort must be one of: name, vintage, producer, date_added" |
| `direction` | Unknown value | "direction must be asc or desc" |
| `status` | Unknown value | "status must be active, consumed, or removed" |
| `action` | Unknown value | "action must be increment or decrement" |
| `q` | Exceeds 255 chars | "Search query must be 255 characters or fewer" |
| `vintage_from` > `vintage_to` | Range invalid | "vintage_from must be less than or equal to vintage_to" |
| `vintage` + range params | Conflicting params | "Use either vintage or vintage_from/vintage_to, not both" |
| `producer`, `varietal`, `region` | Exceeds 255 chars | "[field] must be 255 characters or fewer" |

---

### Client Guidance

- **4xx errors** indicate a client-side problem. The request should be corrected before retrying.
- **5xx errors** indicate a server-side problem. Clients should implement exponential backoff before retrying. After 3 failed retries, surface a user-visible error message.
- **401 errors** should trigger a token refresh flow (`POST /auth/refresh`). If the refresh also fails, redirect to login.
- **429 errors** include a `Retry-After` header (seconds). Clients must honor this delay.
