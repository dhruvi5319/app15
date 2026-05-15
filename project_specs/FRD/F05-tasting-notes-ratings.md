
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
