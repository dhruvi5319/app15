
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
