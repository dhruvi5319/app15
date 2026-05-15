# Functional Requirements Document — Wine Inventory App

**Project:** WineInventory  
**Acronym:** WineInventory  
**Version:** 1.0  
**Date:** 2026-05-15  
**Status:** Draft  
**Based on:** PRD-WineInventory.md v1.0

---

## Scope

This document specifies the detailed functional behavior of every feature in WineInventory v1. It covers inputs, outputs, validation rules, error states, API surface, and database schema for the seven PRD features (F0–F6). It is the authoritative reference for development and QA. Social sharing, barcode scanning, marketplace, and cellar temperature tracking are explicitly out of scope for v1.

---

## Conventions

- **Feature IDs** match PRD: F0–F6. Chunk filenames use zero-padded form: `F00–F06`.
- **Field names** use `snake_case` throughout (API and DDL).
- **HTTP status codes** follow standard RFC 7231 semantics.
- **Timestamps** are stored and transmitted as ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`).
- **IDs** are UUIDs (v4) unless otherwise stated.
- **Pagination** defaults: `page=1`, `per_page=25`; max `per_page=100`.
- **Authentication:** All API endpoints require a valid session token (Bearer JWT). Auth mechanism is defined in the TechArch document; this FRD assumes a single-user session model for v1.
- Cross-references use the format `→ F03 §Process` or `→ Y0-schema.md §wines`.

---

## Table of Contents

| Section | File | Description |
|---------|------|-------------|
| F00 | `F00-wine-entry-management.md` | Wine Entry & Management (CRUD) |
| F01 | `F01-inventory-list-view.md` | Wine Inventory List View |
| F02 | `F02-search-filter.md` | Search & Filter |
| F03 | `F03-bottle-count-tracking.md` | Bottle Count Tracking |
| F04 | `F04-wine-detail-page.md` | Wine Detail Page |
| F05 | `F05-tasting-notes-ratings.md` | Tasting Notes & Ratings |
| F06 | `F06-consumed-removed-status.md` | Consumed / Removed Status |
| Y0 | `Y0-schema.md` | Database Schema (full DDL) |
| Y1 | `Y1-api.md` | REST API Endpoint Catalog |
| Y2 | `Y2-errors.md` | Cross-Feature Error Catalog |
| Y3 | `Y3-integrations.md` | External Integration Points |

---

## Cross-Cutting Terminology

| Term | Definition |
|------|-----------|
| **Wine record** | A single database row representing one distinct wine (label, vintage, producer). Not a physical bottle. |
| **Bottle count** | Integer tracking how many physical bottles of a wine record are in the cellar. Minimum value: 0. |
| **Active inventory** | All wine records where `status = 'active'`. The default view. |
| **Consumed** | A wine record status indicating all bottles have been intentionally opened/finished. |
| **Removed** | A wine record status indicating bottles were sold, gifted, broken, or otherwise taken out without being consumed. |
| **Tasting note** | Free-text user annotation capturing impressions of a wine. |
| **Rating** | Numeric score assigned to a wine by the user (scale TBD at design time; default 1–100 or 1–5 stars). |
| **Producer** | The winery, estate, or brand that produced the wine. |
| **Varietal** | The grape variety or blend designation (e.g., Cabernet Sauvignon, Chardonnay, Bordeaux Blend). |
| **Region** | Geographic origin of the wine (e.g., Napa Valley, Burgundy, Barossa Valley). |
| **Vintage** | The year the grapes were harvested. |
| **Soft delete** | Marking a record as deleted in the database without physically removing it, preserving history. |
| **Bearer JWT** | JSON Web Token passed in the `Authorization: Bearer <token>` header to authenticate API requests. |

---

*All chunk files are assembled into `FRD-WineInventory.md` via `cat project_specs/FRD/*.md`.*

---

## F00: Wine Entry & Management

**Priority:** P0 — Critical, MVP  
**PRD Reference:** §5 F0

**Description:** The core CRUD feature that lets users create, view, update, and delete wine records in their inventory. Every other feature depends on wine records being correctly created here. The only required field at creation time is `name`; all other fields are optional to enable rapid partial entry that users can complete later.

---

### Terminology

- **Quick-add:** A wine creation flow where only `name` is supplied; all optional fields are left blank and can be filled in later.
- **Full-add:** A wine creation flow where the user fills in some or all optional fields at creation time.
- **Hard delete:** Permanent removal of a wine record and all associated data (tasting notes, ratings). Requires confirmation.

---

### Sub-Features

- **F00.1 Create wine record** — Add a new wine with name (required) and optional fields.
- **F00.2 Read wine record** — Retrieve a single wine's full data.
- **F00.3 Update wine record** — Edit any field on an existing wine record.
- **F00.4 Delete wine record** — Permanently remove a wine record after confirmation.

---

### Process

#### F00.1 Create Wine Record

1. User navigates to the Add Wine screen or triggers the quick-add action.
2. User enters `name` (required). Optionally enters `producer`, `vintage`, `varietal`, `region`, `bottle_count`.
3. Client validates all supplied fields (see Validation below).
4. If validation fails, inline error messages are shown; submission is blocked.
5. On valid submission, client sends `POST /wines`.
6. Server validates fields server-side (same rules).
7. Server creates a new wine record with `status = 'active'`, `date_added = now()`, `date_updated = now()`.
8. Server responds `201 Created` with the full wine object.
9. Client navigates the user to the Wine Detail Page (→ F04) or back to the List View (→ F01), depending on UX flow.

#### F00.2 Read Wine Record

1. Client sends `GET /wines/{wine_id}`.
2. Server retrieves the wine record belonging to the authenticated user.
3. Server responds `200 OK` with the full wine object including tasting notes and rating (→ F05).

#### F00.3 Update Wine Record

1. User opens the edit form for an existing wine (from Detail Page or List View).
2. User modifies one or more fields.
3. Client validates changes (same validation rules as create).
4. Client sends `PATCH /wines/{wine_id}` with only the changed fields.
5. Server applies updates and sets `date_updated = now()`.
6. Server responds `200 OK` with the updated wine object.

#### F00.4 Delete Wine Record

1. User triggers the delete action from the Detail Page or List View.
2. Client displays a confirmation dialog: *"Delete [wine name]? This cannot be undone."*
3. User confirms deletion.
4. Client sends `DELETE /wines/{wine_id}`.
5. Server performs a hard delete of the wine record and all associated tasting notes and ratings.
6. Server responds `204 No Content`.
7. Client removes the wine from the list and shows a brief confirmation toast.

---

### Inputs

**Create / Update (`POST /wines`, `PATCH /wines/{wine_id}`):**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `name` | string | Yes (create) | 1–255 characters; cannot be blank |
| `producer` | string | No | Max 255 characters |
| `vintage` | integer | No | 1800 ≤ vintage ≤ current_year + 5 |
| `varietal` | string | No | Max 255 characters |
| `region` | string | No | Max 255 characters |
| `bottle_count` | integer | No | 1–9999; defaults to 1 on create |

---

### Outputs

**Wine Object (returned in responses):**

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | Server-generated |
| `name` | string | |
| `producer` | string \| null | |
| `vintage` | integer \| null | |
| `varietal` | string \| null | |
| `region` | string \| null | |
| `bottle_count` | integer | ≥ 0 |
| `status` | enum | `active`, `consumed`, `removed` |
| `tasting_notes` | string \| null | |
| `rating` | number \| null | |
| `date_added` | ISO 8601 string | UTC |
| `date_updated` | ISO 8601 string | UTC |

---

### Validation

- `name` must be present and non-empty; whitespace-only strings are rejected.
- `name` max length 255 characters.
- `vintage`, if provided, must be an integer in range [1800, current_year + 5]. Current year is evaluated at request time server-side.
- `bottle_count`, if provided at create time, must be a positive integer (≥ 1) and ≤ 9999. Defaults to 1 if omitted.
- `bottle_count` on update must be ≥ 0 (allows setting to zero) and ≤ 9999.
- String fields (`producer`, `varietal`, `region`) may not exceed 255 characters.
- `status` field may not be set via this endpoint; status changes are managed via → F06.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| `name` is missing or blank | 422 | `VALIDATION_ERROR` | "name is required" |
| `vintage` out of range | 422 | `VALIDATION_ERROR` | "vintage must be between 1800 and [year]" |
| `bottle_count` < 0 | 422 | `VALIDATION_ERROR` | "bottle_count cannot be negative" |
| `bottle_count` > 9999 | 422 | `VALIDATION_ERROR` | "bottle_count cannot exceed 9999" |
| String field exceeds 255 chars | 422 | `VALIDATION_ERROR` | "[field] must be 255 characters or fewer" |
| Wine not found | 404 | `NOT_FOUND` | "Wine not found" |
| Unauthenticated request | 401 | `UNAUTHORIZED` | "Authentication required" |
| Wine belongs to another user | 403 | `FORBIDDEN` | "Access denied" |

---

### API Surface (this feature)

See `Y1-api.md` §Wine CRUD for full request/response schemas.

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/wines` | Create a new wine record |
| `GET` | `/wines/{wine_id}` | Retrieve a wine record |
| `PATCH` | `/wines/{wine_id}` | Update a wine record |
| `DELETE` | `/wines/{wine_id}` | Delete a wine record |

---

### Schema Surface (this feature)

Uses table `wines`. See `Y0-schema.md` §wines for full DDL.

Key columns: `id`, `user_id`, `name`, `producer`, `vintage`, `varietal`, `region`, `bottle_count`, `status`, `tasting_notes`, `rating`, `date_added`, `date_updated`, `deleted_at`.

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

---

## F03: Bottle Count Tracking

**Priority:** P0 — Critical, MVP  
**PRD Reference:** §5 F3

**Description:** A lightweight, friction-free mechanism for keeping bottle counts accurate as wines are opened, purchased, or corrected. Users can increment or decrement counts directly from the list view or detail page in two taps, without navigating to a full edit form. Counts can also be set to an exact value for bulk corrections. Zero-bottle wines are visually flagged and can be transitioned to consumed/removed status (→ F06) rather than deleted.

---

### Terminology

- **Increment:** Increase `bottle_count` by 1.
- **Decrement:** Decrease `bottle_count` by 1. Cannot go below 0.
- **Exact-set:** Set `bottle_count` to a specific non-negative integer, bypassing +/− controls.
- **Zero-bottle wine:** A wine record where `bottle_count = 0` and `status = 'active'`. Flagged visually in the UI.

---

### Sub-Features

- **F03.1 Increment bottle count** — Add one bottle to a wine record.
- **F03.2 Decrement bottle count** — Remove one bottle from a wine record. Floor is 0.
- **F03.3 Exact-set bottle count** — Set count to any value 0–9999.
- **F03.4 Zero-bottle visual flag** — Highlight wines with `bottle_count = 0`.
- **F03.5 Zero-bottle consumed/removed prompt** — Suggest transitioning to consumed/removed when count reaches 0.

---

### Process

#### F03.1 Increment Bottle Count

1. User taps/clicks the `+` button on a list row or detail page.
2. Client sends `PATCH /wines/{wine_id}/bottle-count` with `{ "action": "increment" }`.
3. Server increments `bottle_count` by 1 (capped at 9999).
4. Server sets `date_updated = now()`.
5. Server returns `200 OK` with updated `bottle_count`.
6. Client updates the count in the UI immediately (optimistic update recommended).

#### F03.2 Decrement Bottle Count

1. User taps/clicks the `−` button on a list row or detail page.
2. Client sends `PATCH /wines/{wine_id}/bottle-count` with `{ "action": "decrement" }`.
3. Server checks current `bottle_count`. If already 0, returns `422` (cannot go negative).
4. Server decrements `bottle_count` by 1.
5. Server sets `date_updated = now()`.
6. Server returns `200 OK` with updated `bottle_count`.
7. If new `bottle_count = 0`, server includes `"zero_bottle_flag": true` in the response.
8. Client updates the UI; if `zero_bottle_flag` is true, applies the zero-bottle visual style and optionally surfaces a prompt: *"No bottles left. Mark as consumed or removed?"* with quick-action links (→ F06).

#### F03.3 Exact-Set Bottle Count

1. User opens the edit form for a wine (→ F00.3) or a dedicated count field on the detail page.
2. User enters a new integer value for `bottle_count`.
3. Client sends `PATCH /wines/{wine_id}` with `{ "bottle_count": <value> }`.
4. Server validates the value (0–9999).
5. Server updates `bottle_count` and `date_updated`.
6. Server returns `200 OK` with the updated wine object.

#### F03.4 Zero-Bottle Visual Flag

- The list view and detail page display a visual indicator (e.g., greyed-out row, "Empty" badge) when `bottle_count = 0` and `status = 'active'`.
- This is a client-side rendering decision based on the `bottle_count` value in the API response.

#### F03.5 Zero-Bottle Consumed/Removed Prompt

- When a decrement operation results in `bottle_count = 0`, the client may show a non-blocking prompt suggesting the user mark the wine as consumed or removed.
- This prompt is informational only; the user may dismiss it and the wine remains active with 0 bottles.
- The actual status change is handled by → F06.

---

### Inputs

**`PATCH /wines/{wine_id}/bottle-count`:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `action` | enum | Yes | `increment` or `decrement` |

**`PATCH /wines/{wine_id}` (exact-set via general update):**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `bottle_count` | integer | Yes | 0–9999 |

---

### Outputs

**Bottle-count endpoint response:**

```json
{
  "id": "uuid",
  "bottle_count": "integer",
  "zero_bottle_flag": "boolean",
  "date_updated": "ISO 8601 string"
}
```

---

### Validation

- `bottle_count` may not be set below 0 at any time (enforced server-side).
- `bottle_count` may not exceed 9999.
- Decrement when `bottle_count = 0` is rejected with `422`.
- `action` must be exactly `increment` or `decrement`; any other value returns `422`.
- The `bottle_count` cannot be reduced below 0 via exact-set either.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Decrement when count is already 0 | 422 | `COUNT_BELOW_ZERO` | "Bottle count cannot go below zero" |
| `bottle_count` set to negative value | 422 | `VALIDATION_ERROR` | "bottle_count cannot be negative" |
| `bottle_count` exceeds 9999 | 422 | `VALIDATION_ERROR` | "bottle_count cannot exceed 9999" |
| Invalid `action` value | 422 | `VALIDATION_ERROR` | "action must be increment or decrement" |
| Wine not found | 404 | `NOT_FOUND` | "Wine not found" |
| Unauthenticated request | 401 | `UNAUTHORIZED` | "Authentication required" |

---

### API Surface (this feature)

See `Y1-api.md` §Bottle Count for full request/response schemas.

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/wines/{wine_id}/bottle-count` | Increment or decrement bottle count |
| `PATCH` | `/wines/{wine_id}` | Exact-set bottle count (via general update, → F00) |

---

### Schema Surface (this feature)

Uses `wines.bottle_count` column. See `Y0-schema.md` §wines. A check constraint enforces `bottle_count >= 0`. The `date_updated` column is updated on every count change.

---

## F04: Wine Detail Page

**Priority:** P0 — Critical, MVP  
**PRD Reference:** §5 F4

**Description:** A dedicated full-record view for a single wine that surfaces all stored information in a clean, readable layout. This is the destination when a user wants the complete picture of a specific bottle — all fields, tasting notes, rating, history, and status. It also provides the entry points for all mutations on that record: quick-edit, full edit, bottle count changes, and status transitions.

---

### Terminology

- **Quick-edit:** Inline editing of a specific field directly on the detail page, without navigating to a separate edit form.
- **Full edit:** Navigating to the dedicated edit form (→ F00.3) to update any fields.
- **Record header:** The top section of the detail page showing the wine's name, producer, vintage, and bottle count prominently.

---

### Sub-Features

- **F04.1 Display full wine record** — Show all stored fields for a wine.
- **F04.2 Quick-edit key fields** — Allow inline editing of specific fields.
- **F04.3 Bottle count controls** — Expose increment/decrement buttons (→ F03).
- **F04.4 Status display and transition** — Show current status and allow transition to consumed/removed (→ F06).
- **F04.5 Delete action** — Trigger wine record deletion with confirmation (→ F00.4).

---

### Process

#### F04.1 Display Full Wine Record

1. User navigates to a wine's detail page (from list row, search result, or direct URL).
2. Client sends `GET /wines/{wine_id}`.
3. Server returns the full wine object (including tasting notes, rating, status, timestamps).
4. Client renders all fields as defined in the Display Fields section below.
5. If the wine has `status = 'consumed'` or `status = 'removed'`, a status banner is shown prominently at the top.

#### F04.2 Quick-Edit Key Fields

1. User clicks/taps an editable field on the detail page (e.g., name, producer, vintage, varietal, region).
2. The field transitions to an inline edit control (text input or number input).
3. User modifies the value and confirms (Enter key or tap-away).
4. Client sends `PATCH /wines/{wine_id}` with the changed field.
5. Server validates and updates the field.
6. Field reverts to display mode showing the updated value.
7. If validation fails, the field shows an inline error and the previous value is preserved.

#### F04.3 Bottle Count Controls

- The detail page displays the current `bottle_count` with `+` and `−` controls.
- Behavior is identical to → F03.1 and F03.2 (increment/decrement).
- An exact-count input field allows setting the count to any valid value (→ F03.3).

#### F04.4 Status Display and Transition

- Current `status` is displayed as a badge or label: "Active", "Consumed", or "Removed".
- If status is `active`, buttons/actions are shown to transition to "Consumed" or "Removed" (→ F06).
- If status is `consumed` or `removed`, a "Revert to Active" action is shown (→ F06.3).

#### F04.5 Delete Action

- A "Delete" button is available on the detail page.
- Clicking triggers a confirmation dialog (→ F00.4 process step 2–7).

---

### Display Fields

All fields rendered on the wine detail page:

| Field | Display Label | Notes |
|-------|--------------|-------|
| `name` | Wine Name | Prominent; quick-editable |
| `producer` | Producer | Quick-editable |
| `vintage` | Vintage | Quick-editable |
| `varietal` | Varietal | Quick-editable |
| `region` | Region | Quick-editable |
| `bottle_count` | Bottles in Cellar | With +/− controls |
| `status` | Status | Badge; with transition actions |
| `tasting_notes` | Tasting Notes | Free-text; links to → F05 edit |
| `rating` | Rating | Star or numeric display; links to → F05 edit |
| `date_added` | Added | Formatted date |
| `date_updated` | Last Updated | Formatted date |

---

### Inputs

- `wine_id` (path parameter, UUID): Identifies the wine record to display.

---

### Outputs

Full wine object as defined in → F00 Outputs, plus all tasting note and rating fields (→ F05).

---

### Validation

- `wine_id` must be a valid UUID; malformed IDs return `400`.
- Wine must belong to the authenticated user; foreign records return `403`.
- Wine must exist (not hard-deleted); missing records return `404`.
- Quick-edit submissions are subject to the same validation rules as → F00 Update.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Malformed `wine_id` (not UUID) | 400 | `INVALID_ID` | "Invalid wine ID format" |
| Wine not found | 404 | `NOT_FOUND` | "Wine not found" |
| Wine belongs to another user | 403 | `FORBIDDEN` | "Access denied" |
| Quick-edit validation failure | 422 | `VALIDATION_ERROR` | Field-specific message (see → F00 errors) |
| Unauthenticated request | 401 | `UNAUTHORIZED` | "Authentication required" |

---

### API Surface (this feature)

See `Y1-api.md` §Wine Detail for full request/response schemas.

| Method | Path | Description |
|--------|------|-------------|
| `GET` | `/wines/{wine_id}` | Retrieve full wine record (same endpoint as → F00.2) |
| `PATCH` | `/wines/{wine_id}` | Quick-edit field update (same endpoint as → F00.3) |

---

### Schema Surface (this feature)

Uses table `wines`. All columns rendered. No additional tables beyond `wines`. See `Y0-schema.md` §wines.

---

## F05: Tasting Notes & Ratings

**Priority:** P1 — High value, MVP target  
**PRD Reference:** §5 F5

**Description:** Allows users to capture their personal impressions of a wine alongside its inventory record, transforming the app into a personal wine journal as well as a cellar ledger. Users can write free-text tasting notes of any length and assign a numeric rating. Notes and ratings can be edited or deleted at any time, and they persist even after a wine is marked as consumed or removed — preserving the historical record.

---

### Terminology

- **Tasting note:** Free-form text entered by the user to record their impressions, aromas, flavors, and experience of a wine.
- **Rating:** A numeric score assigned by the user. Scale is 1–100 (points) by default; design may select 1–5 stars, with the API accepting either scale as configured. This FRD uses the **1–100 scale** as the canonical default.
- **Null rating:** A wine with no rating assigned (`rating = null`). This is the default state.

---

### Sub-Features

- **F05.1 Add tasting notes** — Enter free-text notes for a wine.
- **F05.2 Add rating** — Assign a numeric score to a wine.
- **F05.3 Edit tasting notes and rating** — Modify existing notes or score.
- **F05.4 Delete tasting notes and rating** — Clear notes and/or score.
- **F05.5 Persistence after status change** — Notes and ratings survive consumed/removed transitions.

---

### Process

#### F05.1 Add Tasting Notes

1. User navigates to the Wine Detail Page (→ F04) and taps/clicks the "Add tasting notes" area.
2. An inline text area expands (or a modal opens) for free-text entry. No character limit is enforced.
3. User enters their notes and confirms (saves).
4. Client sends `PATCH /wines/{wine_id}` with `{ "tasting_notes": "<text>" }`.
5. Server updates `wines.tasting_notes` and `date_updated`.
6. Server returns `200 OK` with the updated wine object.
7. Tasting notes are displayed on the detail page.

#### F05.2 Add Rating

1. User interacts with the rating control on the Wine Detail Page (star selector or numeric input).
2. User selects a rating value between 1 and 100 (inclusive).
3. Client sends `PATCH /wines/{wine_id}` with `{ "rating": <value> }`.
4. Server validates the rating value.
5. Server updates `wines.rating` and `date_updated`.
6. Server returns `200 OK` with the updated wine object.

#### F05.3 Edit Tasting Notes and Rating

- Identical to add flow (→ F05.1, F05.2). The `PATCH` endpoint overwrites the existing value.
- The user can modify notes or rating independently in separate requests.

#### F05.4 Delete Tasting Notes and Rating

1. User triggers "Clear notes" or "Clear rating" action on the detail page.
2. Client sends `PATCH /wines/{wine_id}` with `{ "tasting_notes": null }` or `{ "rating": null }`.
3. Server sets the respective column to `NULL`.
4. Server returns `200 OK` with the updated wine object.
5. The detail page reflects the cleared state.

#### F05.5 Persistence After Status Change

- When a wine is transitioned to `consumed` or `removed` (→ F06), `tasting_notes` and `rating` are NOT cleared.
- The detail page for consumed/removed wines still displays notes and rating.
- Notes and rating survive hard delete only if a soft-delete pattern is used; if the wine is hard-deleted (→ F00.4), all associated data is permanently removed.

---

### Inputs

**`PATCH /wines/{wine_id}` (notes and rating fields):**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `tasting_notes` | string \| null | No | No character limit; `null` to clear |
| `rating` | integer \| null | No | 1–100 inclusive; `null` to clear |

---

### Outputs

Updated wine object (see → F00 Outputs) with:
- `tasting_notes`: string or null
- `rating`: integer (1–100) or null

---

### Validation

- `tasting_notes`, if provided, must be a string or `null`. Empty string `""` is treated as `null` (no notes stored).
- `rating`, if provided, must be an integer between 1 and 100 inclusive, or `null`.
- `rating` of 0 is not valid (scale starts at 1).
- Decimal rating values (e.g., 87.5) are rejected; only integers accepted.
- `tasting_notes` and `rating` fields are independent — one can be set without affecting the other.

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| `rating` < 1 | 422 | `VALIDATION_ERROR` | "rating must be between 1 and 100" |
| `rating` > 100 | 422 | `VALIDATION_ERROR` | "rating must be between 1 and 100" |
| `rating` is a decimal | 422 | `VALIDATION_ERROR` | "rating must be a whole number" |
| `rating` is 0 | 422 | `VALIDATION_ERROR` | "rating must be between 1 and 100" |
| Wine not found | 404 | `NOT_FOUND` | "Wine not found" |
| Unauthenticated request | 401 | `UNAUTHORIZED` | "Authentication required" |
| Wine belongs to another user | 403 | `FORBIDDEN` | "Access denied" |

---

### API Surface (this feature)

See `Y1-api.md` §Tasting Notes & Ratings for full request/response schemas.

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/wines/{wine_id}` | Set or clear `tasting_notes` and/or `rating` (same general update endpoint as → F00.3) |

---

### Schema Surface (this feature)

Uses columns `wines.tasting_notes` (TEXT, nullable) and `wines.rating` (SMALLINT, nullable, check 1–100) in the `wines` table. See `Y0-schema.md` §wines for full DDL.

---

## F06: Consumed / Removed Status

**Priority:** P1 — High value, MVP target  
**PRD Reference:** §5 F6

**Description:** Lets users mark a wine as consumed (bottles intentionally finished) or removed (sold, gifted, broken, etc.) without deleting the historical record. This preserves tasting notes and ratings while keeping the active inventory clean. Consumed and removed wines are hidden from the default list view but accessible via a toggle or tab. Status transitions can also be reverted if made in error.

---

### Terminology

- **Active:** Default status — wine is in the cellar and available.
- **Consumed:** Wine was intentionally opened and finished. Historically meaningful; tasting notes typically exist.
- **Removed:** Wine left the cellar for reasons other than consumption (sold, gifted, lost, broken).
- **Status transition:** Changing a wine's `status` field from one value to another.
- **Revert:** Transitioning a wine back to `active` status after an erroneous consumed/removed marking.
- **History view:** A list/tab showing wines with `status = 'consumed'` or `status = 'removed'`.

---

### Sub-Features

- **F06.1 Mark as Consumed** — Transition a wine to `consumed` status.
- **F06.2 Mark as Removed** — Transition a wine to `removed` status.
- **F06.3 Revert to Active** — Transition a consumed/removed wine back to `active`.
- **F06.4 History view** — Display consumed/removed wines in a separate view.
- **F06.5 Hide from default list** — Consumed/removed wines excluded from `status=active` list (default).

---

### Process

#### F06.1 Mark as Consumed

1. User triggers "Mark as Consumed" from the list view row or detail page.
2. Client sends `PATCH /wines/{wine_id}/status` with `{ "status": "consumed" }`.
3. Server validates the transition: wine must currently be `active`.
4. Server sets `wines.status = 'consumed'` and `date_updated = now()`.
5. Server returns `200 OK` with updated wine object.
6. Client removes the wine from the active inventory list.
7. The wine remains accessible in the history view (→ F06.4).

#### F06.2 Mark as Removed

1. User triggers "Mark as Removed" from the list view row or detail page.
2. Client sends `PATCH /wines/{wine_id}/status` with `{ "status": "removed" }`.
3. Server validates the transition: wine must currently be `active`.
4. Server sets `wines.status = 'removed'` and `date_updated = now()`.
5. Server returns `200 OK` with updated wine object.
6. Client removes the wine from the active inventory list.

#### F06.3 Revert to Active

1. User is viewing the history (consumed/removed) list or a wine's detail page.
2. User triggers "Revert to Active" action.
3. Client sends `PATCH /wines/{wine_id}/status` with `{ "status": "active" }`.
4. Server validates: wine must be `consumed` or `removed`.
5. Server sets `wines.status = 'active'` and `date_updated = now()`.
6. Server returns `200 OK` with updated wine object.
7. Wine reappears in the active inventory list.

#### F06.4 History View

1. User navigates to the "History" tab or toggles "Show consumed / removed".
2. Client sends `GET /wines?status=consumed` or `GET /wines?status=removed` or `GET /wines?status=all`.
3. Server returns wines matching the requested status scope, scoped to the authenticated user.
4. Client renders the history list with the same at-a-glance fields as the active list, plus a status badge per row.

#### F06.5 Hide from Default List

- `GET /wines` with no `status` parameter (or `status=active`) returns only `active` wines.
- Consumed and removed wines are never included in the default list response.
- This is enforced server-side; the client does not need to filter.

---

### Inputs

**`PATCH /wines/{wine_id}/status`:**

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `status` | enum | Yes | `consumed`, `removed`, `active` |

---

### Outputs

Updated wine object (see → F00 Outputs) with `status` field reflecting the new state.

---

### Validation

- `status` must be one of: `consumed`, `removed`, `active`.
- Transition from `consumed` → `removed` or `removed` → `consumed` is **not allowed** directly. The wine must be reverted to `active` first, then transitioned to the desired status. Any attempt to go directly between non-active statuses returns `422`.
- Transition from `active` → `active` (no-op) returns `422`.
- `status` field cannot be set via the general `PATCH /wines/{wine_id}` endpoint — only via the dedicated `/status` sub-resource.

---

### Status Transition Matrix

| From \ To | `active` | `consumed` | `removed` |
|-----------|----------|------------|-----------|
| `active` | ✗ (no-op) | ✓ | ✓ |
| `consumed` | ✓ (revert) | ✗ (no-op) | ✗ (must revert first) |
| `removed` | ✓ (revert) | ✗ (must revert first) | ✗ (no-op) |

---

### Error States

| Scenario | HTTP Status | Error Code | Message |
|----------|-------------|------------|---------|
| Invalid `status` value | 422 | `VALIDATION_ERROR` | "status must be active, consumed, or removed" |
| Transition from consumed → removed directly | 422 | `INVALID_TRANSITION` | "Revert to active before changing to removed" |
| Transition from removed → consumed directly | 422 | `INVALID_TRANSITION` | "Revert to active before changing to consumed" |
| No-op transition (same status) | 422 | `INVALID_TRANSITION` | "Wine is already [status]" |
| Wine not found | 404 | `NOT_FOUND` | "Wine not found" |
| Unauthenticated request | 401 | `UNAUTHORIZED` | "Authentication required" |
| Wine belongs to another user | 403 | `FORBIDDEN` | "Access denied" |

---

### API Surface (this feature)

See `Y1-api.md` §Status Transitions for full request/response schemas.

| Method | Path | Description |
|--------|------|-------------|
| `PATCH` | `/wines/{wine_id}/status` | Transition wine status |
| `GET` | `/wines?status=consumed` | List consumed wines (→ F01) |
| `GET` | `/wines?status=removed` | List removed wines (→ F01) |
| `GET` | `/wines?status=all` | List all wines regardless of status (→ F01) |

---

### Schema Surface (this feature)

Uses `wines.status` column (enum: `active`, `consumed`, `removed`; default `active`). An index on `(user_id, status)` supports history view queries. See `Y0-schema.md` §wines.

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
| `rating` | Out of range (not 1–100) | "rating must be between 1 and 100" |
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
