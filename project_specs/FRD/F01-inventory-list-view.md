
---

## F01: Wine Inventory List View

**Priority:** P0 — Critical, MVP  
**PRD Reference:** §5 F1

**Description:** The primary screen that users return to repeatedly. It presents all wines in the active inventory as a paginated, sortable list or grid. The view must feel fast and clear for collections from one bottle to tens of thousands, and it must provide an obvious entry point when the inventory is empty.

---

### Terminology

- **List view:** The default browsable presentation of all active wine records.
- **At-a-glance fields:** The subset of wine data shown per row without opening the detail page: name, producer, vintage, varietal, bottle count.
- **Empty state:** The UI shown when the user has no wine records or all records are filtered out.
- **Sort key:** The field used to order the list.
- **Sort direction:** Ascending (`asc`) or descending (`desc`).

---

### Sub-Features

- **F01.1 Paginated wine list** — Retrieve wines in sorted, paginated pages.
- **F01.2 Sort controls** — Let the user change the sort key and direction.
- **F01.3 Empty state** — Surface a clear call-to-action when the list is empty.
- **F01.4 Bottle count quick-actions** — Inline increment/decrement controls on each list row (→ F03).

---

### Process

#### F01.1 Paginated Wine List

1. User navigates to the home/list screen.
2. Client sends `GET /wines?page=1&per_page=25&sort=name&direction=asc` (defaults).
3. Server queries the `wines` table for all records owned by the authenticated user where `status = 'active'` (default; toggled by F06).
4. Server applies sort, then paginates.
5. Server returns `200 OK` with a results array and pagination metadata (`total`, `page`, `per_page`, `total_pages`).
6. Client renders each wine row showing: `name`, `producer`, `vintage`, `varietal`, `bottle_count`.
7. Client shows pagination controls or triggers infinite scroll for the next page.

#### F01.2 Sort Controls

1. User selects a sort key from the UI (name, vintage, producer, date_added).
2. User optionally toggles sort direction (asc/desc).
3. Client re-issues `GET /wines` with updated `sort` and `direction` query parameters.
4. Server returns re-sorted results; client re-renders the list.

#### F01.3 Empty State

1. Server returns `200 OK` with an empty `results` array and `total = 0`.
2. Client detects empty results with no active filters.
3. Client renders the empty state UI: illustration + message ("Your cellar is empty") + a prominent "Add your first wine" call-to-action button that navigates to → F00 create flow.

#### F01.4 Bottle Count Quick-Actions

- Each list row exposes `+` and `−` buttons that call `PATCH /wines/{wine_id}/bottle-count` (→ F03).
- Count updates are reflected immediately in the row without a full page reload.

---

### Inputs

**`GET /wines` query parameters:**

| Parameter | Type | Required | Default | Constraints |
|-----------|------|----------|---------|-------------|
| `page` | integer | No | 1 | ≥ 1 |
| `per_page` | integer | No | 25 | 1–100 |
| `sort` | enum | No | `name` | `name`, `vintage`, `producer`, `date_added` |
| `direction` | enum | No | `asc` | `asc`, `desc` |
| `status` | enum | No | `active` | `active`, `consumed`, `removed`, `all` |

---

### Outputs

**List Response:**

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
      "status": "active"
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

---

### Validation

- `page` must be a positive integer; invalid values default to 1.
- `per_page` must be between 1 and 100; values above 100 are capped at 100.
- `sort` must be one of the enumerated values; unknown values return `422`.
- `direction` must be `asc` or `desc`; unknown values return `422`.
- `status` filter must be one of `active`, `consumed`, `removed`, `all`; unknown values return `422`.
- The server only returns wines belonging to the authenticated user; no cross-user data is ever returned.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| `sort` value unknown | 422 | `VALIDATION_ERROR` | "sort must be one of: name, vintage, producer, date_added" |
| `direction` value unknown | 422 | `VALIDATION_ERROR` | "direction must be asc or desc" |
| `per_page` exceeds 100 | 200 | — | Silently capped; returns max 100 results |
| Unauthenticated request | 401 | `UNAUTHORIZED` | "Authentication required" |
| Server error | 500 | `INTERNAL_ERROR` | "An unexpected error occurred" |

---

### API Surface (this feature)

See `Y1-api.md` §Wine List for full request/response schemas.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/wines` | Retrieve paginated, sorted wine list |

---

### Schema Surface (this feature)

Uses table `wines`. The list query filters on `user_id`, `status`, and `deleted_at IS NULL`. Sorted by `name`, `vintage`, `producer`, or `date_added`. See `Y0-schema.md` §wines for DDL and indexes.
