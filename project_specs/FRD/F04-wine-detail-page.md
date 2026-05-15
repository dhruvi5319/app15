
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
