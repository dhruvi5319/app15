
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
