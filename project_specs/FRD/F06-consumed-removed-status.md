
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
4. Server sets `wines.status = 'consumed'`, `date_updated = now()`, and `status_changed_at = now()`.
5. Server returns `200 OK` with updated wine object (including `status_changed_at`).
6. Client removes the wine from the active inventory list.
7. The wine remains accessible in the history view (→ F06.4), where `status_changed_at` is displayed as "Consumed on [date]".

#### F06.2 Mark as Removed

1. User triggers "Mark as Removed" from the list view row or detail page.
2. Client sends `PATCH /wines/{wine_id}/status` with `{ "status": "removed" }`.
3. Server validates the transition: wine must currently be `active`.
4. Server sets `wines.status = 'removed'`, `date_updated = now()`, and `status_changed_at = now()`.
5. Server returns `200 OK` with updated wine object (including `status_changed_at`).
6. Client removes the wine from the active inventory list.
7. The wine is accessible in the history view, where `status_changed_at` is displayed as "Removed on [date]".

#### F06.3 Revert to Active

1. User is viewing the history (consumed/removed) list or a wine's detail page.
2. User triggers "Revert to Active" action.
3. Client sends `PATCH /wines/{wine_id}/status` with `{ "status": "active" }`.
4. Server validates: wine must be `consumed` or `removed`.
5. Server sets `wines.status = 'active'`, `date_updated = now()`, and `status_changed_at = NULL`.
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

Uses `wines.status` column (enum: `active`, `consumed`, `removed`; default `active`) and `wines.status_changed_at` (TIMESTAMPTZ, nullable). `status_changed_at` is set to `now()` on transitions to `consumed`/`removed` and set to `NULL` on revert to `active`. An index on `(user_id, status)` supports history view queries. See `Y0-schema.md` §wines.
