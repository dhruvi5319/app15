
---

## F02: Search & Filter

**Priority:** P0 — Critical, MVP  
**PRD Reference:** §5 F2

**Description:** Fast, flexible lookup that lets users find specific wines in their collection by typing a search term or applying structured filters. Results must update in real time (debounced, no page reload) so the experience feels instantaneous. Multiple filters can be combined, and a single action resets the view to the full list.

---

### Terminology

- **Free-text search:** A query string matched against `name`, `producer`, and `region` fields using case-insensitive partial matching.
- **Structured filter:** A filter on a specific field with an exact or range value (varietal, region, vintage, producer).
- **Combined filters:** Multiple active filters applied simultaneously using AND logic.
- **Match count:** The number of wine records returned by the current active query, displayed in the UI.
- **Reset:** Clearing all active search terms and filters, returning to the full active inventory list.
- **Debounce:** Client-side delay (e.g., 300ms) before firing a search request to avoid excessive API calls while the user is typing.

---

### Sub-Features

- **F02.1 Free-text search** — Search `name`, `producer`, `region` by partial match.
- **F02.2 Structured filters** — Filter by `varietal`, `region`, `vintage` (exact or range), `producer`.
- **F02.3 Combined multi-filter** — Apply multiple filters simultaneously.
- **F02.4 Match count display** — Show how many wines match the current query.
- **F02.5 Reset filters** — Clear all active filters with one action.

---

### Process

#### F02.1 Free-Text Search

1. User types into the search input field.
2. Client debounces input (300ms delay after last keystroke).
3. Client sends `GET /wines?q={search_term}&page=1&per_page=25` (plus any active structured filters).
4. Server performs case-insensitive partial match of `search_term` against `name`, `producer`, and `region` columns.
5. Server returns matching wine records with pagination metadata.
6. Client renders results and updates the match count display.
7. If `search_term` is empty, the full active inventory list is returned.

#### F02.2 Structured Filters

1. User selects one or more filter controls (varietal dropdown, region input, vintage year or range, producer input).
2. Client sends `GET /wines` with the relevant filter parameters appended.
3. Server applies each filter as an AND condition on top of `status = 'active'` and user scoping.
4. Server returns filtered results.

#### F02.3 Combined Multi-Filter

1. User activates multiple filters simultaneously (e.g., varietal = "Pinot Noir" AND vintage_from = 2015 AND vintage_to = 2020).
2. Client includes all active filter parameters in the same `GET /wines` request.
3. Server applies all conditions as AND logic.
4. Server returns results satisfying all conditions.

#### F02.4 Match Count Display

1. Server includes `pagination.total` in every list response.
2. Client displays "X wines found" (or similar) whenever any filter or search term is active.
3. When no filter is active, match count is hidden or shows the total collection size.

#### F02.5 Reset Filters

1. User clicks "Clear all filters" / "Reset" button.
2. Client clears all search terms and filter values.
3. Client sends `GET /wines` with no filter parameters (default: `status=active`, `sort=name`, `direction=asc`).
4. Full active inventory list is restored.

---

### Inputs

**`GET /wines` query parameters (search/filter extensions):**

| Parameter | Type | Required | Constraints |
|-----------|------|----------|-------------|
| `q` | string | No | Free-text; max 255 chars; matched against name, producer, region |
| `varietal` | string | No | Exact match (case-insensitive); max 255 chars |
| `region` | string | No | Partial match (case-insensitive); max 255 chars |
| `producer` | string | No | Partial match (case-insensitive); max 255 chars |
| `vintage` | integer | No | Exact vintage year; 1800–current_year+5 |
| `vintage_from` | integer | No | Vintage range start (inclusive); 1800–current_year+5 |
| `vintage_to` | integer | No | Vintage range end (inclusive); 1800–current_year+5 |

All list parameters from F01 (`page`, `per_page`, `sort`, `direction`, `status`) are also valid.

---

### Outputs

Identical format to → F01 List Response, with `pagination.total` reflecting the filtered count.

---

### Validation

- `q` max 255 characters; values longer than 255 are rejected with `422`.
- `vintage` and `vintage_from`/`vintage_to` must be integers in [1800, current_year + 5].
- `vintage_from` must be ≤ `vintage_to` when both are provided; otherwise `422`.
- String filter parameters (`varietal`, `region`, `producer`) max 255 characters.
- Combining `vintage` with `vintage_from`/`vintage_to` in the same request returns `422` — use one form or the other.
- All other list validation rules from → F01 apply.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| `q` exceeds 255 characters | 422 | `VALIDATION_ERROR` | "Search query must be 255 characters or fewer" |
| `vintage` out of valid range | 422 | `VALIDATION_ERROR` | "vintage must be between 1800 and [year]" |
| `vintage_from` > `vintage_to` | 422 | `VALIDATION_ERROR` | "vintage_from must be less than or equal to vintage_to" |
| `vintage` combined with range params | 422 | `VALIDATION_ERROR` | "Use either vintage or vintage_from/vintage_to, not both" |
| No results match query | 200 | — | Empty results array; `total = 0`; client shows "No wines found" |
| Unauthenticated request | 401 | `UNAUTHORIZED` | "Authentication required" |

---

### API Surface (this feature)

See `Y1-api.md` §Search & Filter for full request/response schemas.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/wines` | Search/filter uses the same endpoint as the list view, extended with filter params |

---

### Schema Surface (this feature)

Uses table `wines`. Search requires a full-text index or `ILIKE` / `LIKE` queries on `name`, `producer`, `region`. A composite index on `(user_id, status, varietal, vintage)` supports structured filter queries. See `Y0-schema.md` §wines §indexes for details.
