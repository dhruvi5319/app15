# Requirements Traceability Matrix — Wine Inventory App

**Project:** WineInventory  
**Version:** 1.0  
**Date:** 2026-05-15  
**Status:** Draft  
**Based on:** PRD-WineInventory.md v1.0, FRD-WineInventory.md v1.0, TechArch-WineInventory.md v1.0, UserStories-WineInventory.md v1.0

---

## 1. Overview

This Requirements Traceability Matrix (RTM) provides bidirectional traceability between all WineInventory v1 specification artifacts. It ensures every product requirement is translated into functional specifications, grounded in a technical architecture decision, exercised by at least one user story, and covered by defined test cases.

The matrix spans four traceability levels: the Product Requirements Document (PRD) defines seven top-level features (F0–F6) representing the core cellar-management capabilities; the Functional Requirements Document (FRD) translates each feature into sub-features with formal inputs, outputs, validation rules, and API surface (F00–F06 plus cross-cutting sections Y0–Y3); the Technical Architecture Document (TechArch) provides the system specifications — data model, REST API design, component architecture, security controls, and stack choices — that implement the functional requirements; and the User Stories document decomposes each feature into twenty-seven acceptance-tested stories (US-0.1 through US-6.4) written from real-persona perspectives.

Bidirectional coverage means every PRD feature can be traced forward to its FRD sub-features, TechArch specifications, and user stories, and every user story can be traced back to the PRD feature that motivated it. Coverage gaps are surfaced in Section 5. This document is intended to be updated whenever requirements change, new stories are added, or architecture decisions are revised.

---

## 2. Requirements Summary

### PRD Features (F0–F6)

- **F0 — Wine Entry & Management (P0):** Core CRUD for wine records. Name is the only required field; all other fields are optional for rapid partial entry. Includes create, read, update, and hard-delete with confirmation.
- **F1 — Wine Inventory List View (P0):** Primary browsable screen. Paginated, sortable list of all active wines. Must load in under 1 second for up to 10,000 records. Includes empty state.
- **F2 — Search & Filter (P0):** Real-time free-text search across name, producer, and region. Structured filters by varietal, region, vintage (exact or range), and producer. Multi-filter AND logic. One-action reset.
- **F3 — Bottle Count Tracking (P0):** Lightweight increment/decrement controls available from list and detail views. Exact-set via edit field. Visual flag for zero-bottle wines. Prompt to mark as consumed/removed.
- **F4 — Wine Detail Page (P0):** Full-record view with quick-edit inline fields, bottle count controls, status transition actions, and delete trigger. Single destination for all mutations.
- **F5 — Tasting Notes & Ratings (P1):** Free-text notes (no character limit) and 1–5 star integer rating. Independently editable and clearable. Persists after status transitions to consumed/removed.
- **F6 — Consumed / Removed Status (P1):** Lifecycle status management. Wines move from active → consumed or active → removed; revert to active is supported. History view for non-active wines. Direct consumed ↔ removed transition is blocked.

### FRD Sub-Features

- **F00:** F00.1 Create wine, F00.2 Read wine, F00.3 Update wine, F00.4 Delete wine
- **F01:** F01.1 Paginated list, F01.2 Sort controls, F01.3 Empty state, F01.4 Bottle count quick-actions
- **F02:** F02.1 Free-text search, F02.2 Structured filters, F02.3 Combined multi-filter, F02.4 Match count, F02.5 Reset filters
- **F03:** F03.1 Increment count, F03.2 Decrement count, F03.3 Exact-set count, F03.4 Zero-bottle flag, F03.5 Zero-bottle prompt
- **F04:** F04.1 Display full record, F04.2 Quick-edit fields, F04.3 Bottle count controls, F04.4 Status display/transition, F04.5 Delete action
- **F05:** F05.1 Add tasting notes, F05.2 Add rating, F05.3 Edit notes/rating, F05.4 Delete notes/rating, F05.5 Persistence after status change
- **F06:** F06.1 Mark as consumed, F06.2 Mark as removed, F06.3 Revert to active, F06.4 History view, F06.5 Hide from default list

### Non-Functional Requirements (PRD §6)

- **Performance:** List view < 1 s (10,000 wines); search/filter < 500 ms
- **Scalability:** Up to 50,000 wine records per user
- **Usability:** Full wine add in under 60 s; core actions in ≤ 2 taps
- **Reliability:** 99.5% uptime; no data loss on server errors
- **Data Integrity:** Bottle counts cannot go below zero
- **Security:** User data private by default; no cross-user access
- **Accessibility:** WCAG 2.1 AA on all core screens
- **Responsiveness:** Fully functional on desktop and mobile browsers

### User Stories (US-0.1 – US-6.4)

- **P0 stories (19):** Cover F0–F4 — the full MVP core
- **P1 stories (8):** Cover F5–F6 — tasting journal and lifecycle management
- **Total:** 27 stories across 3 personas (Marcus Webb, Sofia Reyes, Priya Nair)

---

## 3. Traceability Matrix

### 3.1 PRD → FRD → TechArch → User Stories

| PRD Feature | PRD Priority | FRD Sub-Feature | TechArch Reference | User Story |
|---|---|---|---|---|
| F0: Wine Entry & Management | P0 | F00.1 Create wine record | `POST /api/v1/wines`; `wines` table DDL; `WineForm.tsx`; `wines.service.ts` | US-0.1, US-0.2 |
| F0: Wine Entry & Management | P0 | F00.2 Read wine record | `GET /api/v1/wines/:wine_id`; `WineDetailPage.tsx`; `wines.repo.ts` | US-4.1 |
| F0: Wine Entry & Management | P0 | F00.3 Update wine record | `PATCH /api/v1/wines/:wine_id`; `EditWinePage.tsx`; `WineForm.tsx`; `wines.service.ts` | US-0.3 |
| F0: Wine Entry & Management | P0 | F00.4 Delete wine record | `DELETE /api/v1/wines/:wine_id`; `ConfirmDialog.tsx`; hard-delete logic in `wines.service.ts` | US-0.4 |
| F1: Wine Inventory List View | P0 | F01.1 Paginated wine list | `GET /api/v1/wines` (pagination params); `InventoryListPage.tsx`; `useWines.ts`; `idx_wines_user_status` index | US-1.1 |
| F1: Wine Inventory List View | P0 | F01.2 Sort controls | `GET /api/v1/wines?sort=&direction=`; `search.service.ts`; `idx_wines_user_date_added`, `idx_wines_user_vintage`, `idx_wines_user_producer` indexes | US-1.2 |
| F1: Wine Inventory List View | P0 | F01.3 Empty state | `InventoryListPage.tsx`; `EmptyState.tsx`; `total=0` response handling | US-1.3 |
| F1: Wine Inventory List View | P0 | F01.4 Bottle count quick-actions | `PATCH /api/v1/wines/:wine_id/bottle-count`; `WineCard.tsx`; `BottleCountControl.tsx` | US-1.4 |
| F2: Search & Filter | P0 | F02.1 Free-text search | `GET /api/v1/wines?q=`; PostgreSQL `tsvector` + `GIN` index (`idx_wines_search_fts`); `search.service.ts` | US-2.1 |
| F2: Search & Filter | P0 | F02.2 Structured filters | `GET /api/v1/wines?varietal=&region=&vintage=&producer=`; `ILIKE` queries; `idx_wines_filter_varietal_vintage` index | US-2.2 |
| F2: Search & Filter | P0 | F02.3 Combined multi-filter | AND logic in `search.service.ts`; `SearchFilterBar.tsx`; `useWines.ts` debounce (300 ms) | US-2.3 |
| F2: Search & Filter | P0 | F02.4 Match count display | `pagination.total` in `WineListResponse`; `SearchFilterBar.tsx` | US-2.1, US-2.2, US-2.3 |
| F2: Search & Filter | P0 | F02.5 Reset filters | `SearchFilterBar.tsx` "Clear all" button; default `GET /api/v1/wines` (no params) | US-2.4 |
| F3: Bottle Count Tracking | P0 | F03.1 Increment count | `PATCH /api/v1/wines/:wine_id/bottle-count { action: "increment" }`; `BottleCountControl.tsx` optimistic update | US-3.1 |
| F3: Bottle Count Tracking | P0 | F03.2 Decrement count | `PATCH /api/v1/wines/:wine_id/bottle-count { action: "decrement" }`; `COUNT_BELOW_ZERO` error; `BottleCountControl.tsx` | US-3.2 |
| F3: Bottle Count Tracking | P0 | F03.3 Exact-set count | `PATCH /api/v1/wines/:wine_id { bottle_count: <n> }`; `WineDetailPage.tsx` count input; CHECK constraint `bottle_count >= 0 AND <= 9999` | US-3.3 |
| F3: Bottle Count Tracking | P0 | F03.4 Zero-bottle visual flag | `zero_bottle_flag` in `BottleCountResponse`; `WineCard.tsx` / `WineDetailPage.tsx` rendering | US-3.4 |
| F3: Bottle Count Tracking | P0 | F03.5 Zero-bottle prompt | `BottleCountControl.tsx` non-blocking prompt on `zero_bottle_flag: true` | US-3.2 |
| F4: Wine Detail Page | P0 | F04.1 Display full wine record | `GET /api/v1/wines/:wine_id`; `WineDetailPage.tsx`; `useWine.ts` | US-4.1 |
| F4: Wine Detail Page | P0 | F04.2 Quick-edit key fields | `PATCH /api/v1/wines/:wine_id` (single field); `WineDetailPage.tsx` inline edit; `middleware/validate.ts` | US-4.2 |
| F4: Wine Detail Page | P0 | F04.3 Bottle count controls | `BottleCountControl.tsx` on detail page; `PATCH /api/v1/wines/:wine_id/bottle-count` | US-4.3 |
| F4: Wine Detail Page | P0 | F04.4 Status display and transition | `StatusBadge.tsx`; `PATCH /api/v1/wines/:wine_id/status`; status transition matrix | US-4.3 |
| F4: Wine Detail Page | P0 | F04.5 Delete action | `ConfirmDialog.tsx`; `DELETE /api/v1/wines/:wine_id`; `wines.service.ts` hard-delete | US-4.3 |
| F5: Tasting Notes & Ratings | P1 | F05.1 Add tasting notes | `PATCH /api/v1/wines/:wine_id { tasting_notes: "<text>" }`; `TastingNotesEditor.tsx`; `wines.tasting_notes TEXT` column | US-5.1 |
| F5: Tasting Notes & Ratings | P1 | F05.2 Add rating | `PATCH /api/v1/wines/:wine_id { rating: <1-5> }`; `RatingInput.tsx`; `wines.rating SMALLINT CHECK (1–5)` | US-5.2 |
| F5: Tasting Notes & Ratings | P1 | F05.3 Edit notes and rating | `PATCH /api/v1/wines/:wine_id` (same endpoint); `TastingNotesEditor.tsx`; `RatingInput.tsx` | US-5.3 |
| F5: Tasting Notes & Ratings | P1 | F05.4 Delete notes and rating | `PATCH /api/v1/wines/:wine_id { tasting_notes: null }` / `{ rating: null }`; clear actions on `WineDetailPage.tsx` | US-5.3 |
| F5: Tasting Notes & Ratings | P1 | F05.5 Persistence after status change | Status transition does not clear `tasting_notes`/`rating`; `wines.service.ts` status logic | US-5.4 |
| F6: Consumed / Removed Status | P1 | F06.1 Mark as consumed | `PATCH /api/v1/wines/:wine_id/status { status: "consumed" }`; `wines_status` ENUM; `status_changed_at` column | US-6.1 |
| F6: Consumed / Removed Status | P1 | F06.2 Mark as removed | `PATCH /api/v1/wines/:wine_id/status { status: "removed" }`; `INVALID_TRANSITION` error for direct consumed↔removed | US-6.2 |
| F6: Consumed / Removed Status | P1 | F06.3 Revert to active | `PATCH /api/v1/wines/:wine_id/status { status: "active" }`; `status_changed_at = NULL` on revert | US-6.3 |
| F6: Consumed / Removed Status | P1 | F06.4 History view | `GET /api/v1/wines?status=consumed|removed|all`; `HistoryPage.tsx`; `idx_wines_user_status` index | US-6.4 |
| F6: Consumed / Removed Status | P1 | F06.5 Hide from default list | Default `status=active` filter in `GET /api/v1/wines`; server-enforced scoping | US-1.1, US-6.1, US-6.2 |

---

### 3.2 TechArch Specifications → FRD Requirements

| TechArch Specification | Type | FRD Requirements |
|---|---|---|
| `POST /api/v1/wines` | API endpoint | F00.1 Create wine record |
| `GET /api/v1/wines/:wine_id` | API endpoint | F00.2 Read wine; F04.1 Display full record |
| `PATCH /api/v1/wines/:wine_id` | API endpoint | F00.3 Update; F04.2 Quick-edit; F05.1–F05.4 Notes/rating |
| `DELETE /api/v1/wines/:wine_id` | API endpoint | F00.4 Delete wine |
| `GET /api/v1/wines` (paginated) | API endpoint | F01.1 Paginated list; F02.1–F02.5 Search/filter |
| `PATCH /api/v1/wines/:wine_id/bottle-count` | API endpoint | F03.1 Increment; F03.2 Decrement |
| `PATCH /api/v1/wines/:wine_id/status` | API endpoint | F06.1 Consumed; F06.2 Removed; F06.3 Revert |
| `wines` table DDL (PostgreSQL) | Data model | F00 all sub-features; F01.1; F03.3; F05.1–F05.5; F06 all |
| `wine_status` ENUM (`active`, `consumed`, `removed`) | Data model | F06.1–F06.5; F01.5 Hide from default list |
| `bottle_count CHECK (≥ 0 AND ≤ 9999)` | DB constraint | F03.1–F03.3; F00.1 create validation |
| `rating CHECK (IS NULL OR 1–5)` | DB constraint | F05.2 Rating validation |
| `vintage CHECK (IS NULL OR 1800–2099)` | DB constraint | F00.1 vintage validation |
| `search_vector TSVECTOR GENERATED` + `idx_wines_search_fts GIN` | Performance | F02.1 Free-text search |
| `idx_wines_user_status` partial index | Performance | F01.1 Paginated list; F06.4 History view |
| `idx_wines_user_date_added`, `idx_wines_user_vintage`, `idx_wines_user_producer` | Performance | F01.2 Sort controls |
| `idx_wines_filter_varietal_vintage` composite index | Performance | F02.2 Structured filters |
| `deleted_at TIMESTAMPTZ` (soft-delete) | Data model | F00.4 hard-delete; audit trail |
| `status_changed_at TIMESTAMPTZ` | Data model | F06.1–F06.3 status transitions |
| JWT access token (1 h) + refresh token (30 d) | Security | Auth requirement across all F00–F06 endpoints |
| `middleware/auth.ts` — JWT verification | Security | Cross-cutting auth (`401` on all protected routes) |
| `middleware/validate.ts` — Zod validation | Validation | Cross-cutting field validation (`422` responses) |
| `middleware/errorHandler.ts` — error envelope | Error handling | Y2 error catalog implementation |
| React SPA — `InventoryListPage.tsx` | Frontend | F01.1–F01.4 list view |
| React SPA — `WineDetailPage.tsx` | Frontend | F04.1–F04.5 detail page |
| React SPA — `SearchFilterBar.tsx` | Frontend | F02.1–F02.5 search/filter |
| React SPA — `BottleCountControl.tsx` | Frontend | F03.1–F03.5 bottle count |
| React SPA — `TastingNotesEditor.tsx` + `RatingInput.tsx` | Frontend | F05.1–F05.4 notes/rating |
| React SPA — `HistoryPage.tsx` + `StatusBadge.tsx` | Frontend | F06.4–F06.5 history view |
| `useWines.ts` React Query hook (300 ms debounce) | Frontend | F02.3 real-time combined filters |
| PostgreSQL tsvector full-text search | Search | F02.1; NFR: search < 500 ms |
| Knex.js migrations (001–006) | Database | Schema provisioning for all features |
| HTTPS/TLS + `helmet` security headers | Security | NFR: User data private by default |
| Rate limiting 200 req/min per user | Security | `RATE_LIMITED` error (Y2) |
| CORS `ALLOWED_ORIGIN` env var | Security | Cross-origin request control |
| Render (API) + Neon (DB) hosting | Infrastructure | NFR: 99.5% uptime; managed DB |
| Optimistic UI in `BottleCountControl.tsx` | UX | F03.1–F03.2 immediate count feedback |

---

### 3.3 User Stories → PRD Features (Reverse Traceability)

| User Story | Title | PRD Feature | Priority |
|---|---|---|---|
| US-0.1 | Quick-Add a Wine by Name Only | F0 | P0 |
| US-0.2 | Add a Wine with Full Details | F0 | P0 |
| US-0.3 | Edit an Existing Wine Record | F0 | P0 |
| US-0.4 | Delete a Wine Record | F0 | P0 |
| US-1.1 | Browse the Active Inventory List | F1 | P0 |
| US-1.2 | Sort the Inventory List | F1 | P0 |
| US-1.3 | See an Empty State When No Wines Are Logged | F1 | P0 |
| US-1.4 | See Inline Bottle Count Controls on Each List Row | F1, F3 | P0 |
| US-2.1 | Search by Free Text | F2 | P0 |
| US-2.2 | Filter by Varietal, Region, Vintage, or Producer | F2 | P0 |
| US-2.3 | Apply Multiple Filters Simultaneously | F2 | P0 |
| US-2.4 | Clear All Filters | F2 | P0 |
| US-3.1 | Increment a Bottle Count | F3 | P0 |
| US-3.2 | Decrement a Bottle Count | F3 | P0 |
| US-3.3 | Set an Exact Bottle Count | F3 | P0 |
| US-3.4 | See a Visual Flag on Zero-Bottle Wines | F3 | P0 |
| US-4.1 | View All Details of a Wine | F4 | P0 |
| US-4.2 | Quick-Edit a Field on the Detail Page | F4 | P0 |
| US-4.3 | Access All Actions from the Detail Page | F4, F3, F6 | P0 |
| US-5.1 | Add a Tasting Note | F5 | P1 |
| US-5.2 | Rate a Wine | F5 | P1 |
| US-5.3 | Edit or Delete Tasting Notes and Rating | F5 | P1 |
| US-5.4 | Retain Tasting Notes and Rating After Status Change | F5, F6 | P1 |
| US-6.1 | Mark a Wine as Consumed | F6 | P1 |
| US-6.2 | Mark a Wine as Removed | F6 | P1 |
| US-6.3 | Revert a Wine Back to Active | F6 | P1 |
| US-6.4 | View Consumed and Removed History | F6 | P1 |

---

## 4. Requirements Detail

### F0: Wine Entry & Management

**PRD Priority:** P0 — Critical MVP  
**FRD Reference:** §F00 (sub-features F00.1–F00.4)

**Functional Requirements:**
- F00.1: User can create a wine record with `name` (required) and optional fields: `producer`, `vintage`, `varietal`, `region`, `bottle_count` (defaults to 1). Server sets `status='active'` and timestamps on creation. Response: `201 Created` with full wine object.
- F00.2: User can retrieve any wine they own via `GET /api/v1/wines/:wine_id`. Returns full record including tasting notes, rating, and status. Errors: `400` (invalid UUID), `401`, `403` (not owner), `404`.
- F00.3: User can partially update any field (except `status`) via `PATCH /api/v1/wines/:wine_id`. Only supplied fields are updated. `date_updated` is refreshed. `bottle_count` on update accepts 0–9999.
- F00.4: User can hard-delete a wine after explicit confirmation dialog. `DELETE /api/v1/wines/:wine_id` permanently removes the record and all associated data. Client shows confirmation toast and removes wine from list.

**Key Validation Rules:**
- `name` required, non-blank, max 255 characters
- `vintage` must be integer in [1800, current_year + 5] if provided
- `bottle_count` 1–9999 at create time; 0–9999 at update time
- `producer`, `varietal`, `region` max 255 characters each
- `status` not settable via `PATCH /wines`; use dedicated `/status` endpoint

**TechArch Implementation:** `POST/PATCH/GET/DELETE /api/v1/wines`, `wines.controller.ts`, `wines.service.ts`, `wines.repo.ts`, `wines` table, `WineForm.tsx`, `ConfirmDialog.tsx`

**Linked User Stories:** US-0.1, US-0.2, US-0.3, US-0.4

---

### F1: Wine Inventory List View

**PRD Priority:** P0 — Critical MVP  
**FRD Reference:** §F01 (sub-features F01.1–F01.4)

**Functional Requirements:**
- F01.1: Paginated list of active wines via `GET /api/v1/wines`. Default `page=1`, `per_page=25`, `status=active`, `sort=name`, `direction=asc`. Returns `results` array + `pagination` metadata. Scoped strictly to authenticated user.
- F01.2: User can change sort key (name, vintage, producer, date_added) and direction (asc/desc). Invalid sort key returns `422 VALIDATION_ERROR`.
- F01.3: Empty state UI shown when `results` is empty with no active filters. Includes "Add your first wine" CTA. Filtered-empty state shows "No wines match your search" — distinct messaging from truly empty.
- F01.4: Each list row shows `+` and `−` bottle count buttons calling `PATCH /api/v1/wines/:wine_id/bottle-count`. Count updates without full page reload.

**Key Validation Rules:**
- `per_page` silently capped at 100
- `sort` must be `name`, `vintage`, `producer`, or `date_added`; else `422`
- `direction` must be `asc` or `desc`; else `422`

**TechArch Implementation:** `GET /api/v1/wines`, `search.service.ts`, `InventoryListPage.tsx`, `WineCard.tsx`, `EmptyState.tsx`, `Pagination.tsx`, `useWines.ts`, `idx_wines_user_status` index

**Linked User Stories:** US-1.1, US-1.2, US-1.3, US-1.4

---

### F2: Search & Filter

**PRD Priority:** P0 — Critical MVP  
**FRD Reference:** §F02 (sub-features F02.1–F02.5)

**Functional Requirements:**
- F02.1: Free-text search via `q` parameter. Case-insensitive partial match against `name`, `producer`, `region`. Debounced 300 ms client-side. Results update without page reload. Match count displayed.
- F02.2: Structured filters via `varietal` (partial match), `region` (partial match), `producer` (partial match), `vintage` (exact), `vintage_from`/`vintage_to` (inclusive range).
- F02.3: All filters combinable simultaneously with AND logic. `q` and structured filters can be active together.
- F02.4: Match count from `pagination.total` displayed as "X wines found" when any filter is active.
- F02.5: "Clear all" button visible when any filter active. Resets to default `GET /api/v1/wines` (no params).

**Key Validation Rules:**
- `q` max 255 characters; else `422`
- `vintage_from` must be ≤ `vintage_to` when both provided; else `422`
- Cannot combine `vintage` (exact) with `vintage_from`/`vintage_to` in same request; else `422`

**TechArch Implementation:** `GET /api/v1/wines?q=&varietal=&region=&vintage=`, `search.service.ts`, `SearchFilterBar.tsx`, `useWines.ts` (debounce), PostgreSQL `tsvector` + `GIN` index, `idx_wines_filter_varietal_vintage`

**Linked User Stories:** US-2.1, US-2.2, US-2.3, US-2.4

---

### F3: Bottle Count Tracking

**PRD Priority:** P0 — Critical MVP  
**FRD Reference:** §F03 (sub-features F03.1–F03.5)

**Functional Requirements:**
- F03.1: `+` button on list row and detail page sends `PATCH /api/v1/wines/:wine_id/bottle-count { "action": "increment" }`. Capped at 9999. Optimistic UI update.
- F03.2: `−` button sends `PATCH .../bottle-count { "action": "decrement" }`. Floor is 0; decrement at 0 returns `422 COUNT_BELOW_ZERO`. Response includes `zero_bottle_flag`.
- F03.3: Exact count input on detail page or edit form sends `PATCH /api/v1/wines/:wine_id { "bottle_count": n }`. Accepts integers 0–9999.
- F03.4: Wines with `bottle_count = 0` and `status = 'active'` are visually flagged (greyed out / "Empty" badge) client-side from API response value.
- F03.5: When `zero_bottle_flag: true` returned, client shows non-blocking prompt: "No bottles left. Mark as consumed or removed?" with quick-action links.

**Key Validation Rules:**
- `bottle_count` never below 0 (DB CHECK constraint + service layer)
- `bottle_count` never above 9999 (DB CHECK constraint + service layer)
- `action` must be exactly `increment` or `decrement`

**TechArch Implementation:** `PATCH /api/v1/wines/:wine_id/bottle-count`, `BottleCountControl.tsx`, `wines.service.ts` (count logic), `bottle_count CHECK (≥ 0 AND ≤ 9999)` DB constraint

**Linked User Stories:** US-3.1, US-3.2, US-3.3, US-3.4

---

### F4: Wine Detail Page

**PRD Priority:** P0 — Critical MVP  
**FRD Reference:** §F04 (sub-features F04.1–F04.5)

**Functional Requirements:**
- F04.1: Full record view via `GET /api/v1/wines/:wine_id`. Displays all fields: name, producer, vintage, varietal, region, bottle_count, status, tasting_notes, rating, date_added, date_updated. Status banner shown for consumed/removed wines.
- F04.2: Editable fields (name, producer, vintage, varietal, region) transition to inline inputs on click. Save via Enter/tap-away sends `PATCH /api/v1/wines/:wine_id` with single changed field. Inline error shown on validation failure.
- F04.3: `+`/`−` bottle count controls and exact-count input present on detail page. Identical behaviour to F03.
- F04.4: Status badge ("Active", "Consumed", "Removed") with context-appropriate transition actions. Active wines show "Mark as Consumed" / "Mark as Removed"; consumed/removed show "Revert to Active".
- F04.5: "Delete" button triggers `ConfirmDialog` then `DELETE /api/v1/wines/:wine_id`. Navigates back to list after successful deletion.

**Key Validation Rules:**
- `wine_id` must be valid UUID; else `400 INVALID_ID`
- Wine must belong to authenticated user; else `403 FORBIDDEN`
- Wine must exist; else `404 NOT_FOUND`
- Quick-edit follows same rules as F00.3 update

**TechArch Implementation:** `GET /api/v1/wines/:wine_id`, `WineDetailPage.tsx`, `useWine.ts`, `StatusBadge.tsx`, `BottleCountControl.tsx`, `TastingNotesEditor.tsx`, `RatingInput.tsx`, `ConfirmDialog.tsx`

**Linked User Stories:** US-4.1, US-4.2, US-4.3

---

### F5: Tasting Notes & Ratings

**PRD Priority:** P1 — High Value MVP  
**FRD Reference:** §F05 (sub-features F05.1–F05.5)

**Functional Requirements:**
- F05.1: Free-text notes entry on detail page. No character limit. Saves via `PATCH /api/v1/wines/:wine_id { "tasting_notes": "<text>" }`. Empty string treated as `null`.
- F05.2: 5-star rating selector on detail page. Accepts integers 1–5 (1 = one star, 5 = five stars). Saves via `PATCH /api/v1/wines/:wine_id { "rating": <n> }`. Rating of 0, decimals, or out-of-range rejected with `422`.
- F05.3: Notes and rating editable independently at any time via the same `PATCH` endpoint flow as creation.
- F05.4: "Clear notes" sends `{ "tasting_notes": null }`; "Clear rating" sends `{ "rating": null }`. Either clears independently without affecting the other.
- F05.5: Status transitions to `consumed`/`removed` do NOT clear `tasting_notes` or `rating`. Both remain accessible on history view and detail page for consumed/removed wines.

**Key Validation Rules:**
- `rating` must be integer 1–5 or null; else `422`
- `tasting_notes` empty string `""` treated as `null` server-side
- Notes and rating independent — set/clear one without affecting the other

**TechArch Implementation:** `PATCH /api/v1/wines/:wine_id`, `wines.tasting_notes TEXT` column, `wines.rating SMALLINT CHECK (1–5)`, `TastingNotesEditor.tsx`, `RatingInput.tsx`

**Linked User Stories:** US-5.1, US-5.2, US-5.3, US-5.4

---

### F6: Consumed / Removed Status

**PRD Priority:** P1 — High Value MVP  
**FRD Reference:** §F06 (sub-features F06.1–F06.5)

**Functional Requirements:**
- F06.1: "Mark as Consumed" action from list row or detail page sends `PATCH /api/v1/wines/:wine_id/status { "status": "consumed" }`. Wine must currently be `active`. Sets `status_changed_at = now()`. Wine removed from active list.
- F06.2: "Mark as Removed" sends `{ "status": "removed" }`. Same validation. Direct `consumed → removed` or `removed → consumed` transition blocked (`422 INVALID_TRANSITION`).
- F06.3: "Revert to Active" from history list or detail page sends `{ "status": "active" }`. Sets `status_changed_at = NULL`. Wine reappears in active inventory.
- F06.4: History view via `GET /api/v1/wines?status=consumed`, `?status=removed`, or `?status=all`. Same at-a-glance fields as active list plus status badge. Supports same sort/pagination controls.
- F06.5: Default `GET /api/v1/wines` (no status param or `status=active`) returns ONLY active wines. Server-enforced — client cannot bypass.

**Key Validation Rules (Status Transition Matrix):**

| From \ To | `active` | `consumed` | `removed` |
|---|---|---|---|
| `active` | ✗ (no-op, `422`) | ✓ | ✓ |
| `consumed` | ✓ (revert) | ✗ (no-op, `422`) | ✗ (`422 INVALID_TRANSITION`) |
| `removed` | ✓ (revert) | ✗ (`422 INVALID_TRANSITION`) | ✗ (no-op, `422`) |

**TechArch Implementation:** `PATCH /api/v1/wines/:wine_id/status`, `wine_status` ENUM, `status_changed_at TIMESTAMPTZ` column, `wines.service.ts` transition validation, `HistoryPage.tsx`, `StatusBadge.tsx`, `idx_wines_user_status` index

**Linked User Stories:** US-6.1, US-6.2, US-6.3, US-6.4

---

## 5. Test Case Coverage Matrix

### 5.1 Coverage Summary by Feature

| PRD Feature | Priority | User Stories | Test Cases | Acceptance Criteria | Coverage |
|---|---|---|---|---|---|
| F0: Wine Entry & Management | P0 | 4 (US-0.1–0.4) | 24 | 27 AC items | 100% |
| F1: Wine Inventory List View | P0 | 4 (US-1.1–1.4) | 19 | 22 AC items | 100% |
| F2: Search & Filter | P0 | 4 (US-2.1–2.4) | 20 | 22 AC items | 100% |
| F3: Bottle Count Tracking | P0 | 4 (US-3.1–3.4) | 19 | 21 AC items | 100% |
| F4: Wine Detail Page | P0 | 3 (US-4.1–4.3) | 18 | 18 AC items | 100% |
| F5: Tasting Notes & Ratings | P1 | 4 (US-5.1–5.4) | 20 | 22 AC items | 100% |
| F6: Consumed / Removed Status | P1 | 4 (US-6.1–6.4) | 22 | 25 AC items | 100% |
| **Total** | — | **27** | **142** | **157 AC items** | **100%** |

---

### 5.2 Test Case Detail by User Story

| Test Case ID | User Story | Test Description | Type | Pass Criteria |
|---|---|---|---|---|
| TEST-001 | US-0.1 | Add Wine form reachable in ≤ 2 taps from home screen | Integration | Form accessible from home |
| TEST-002 | US-0.1 | Submit with name only creates wine with `status='active'`, `bottle_count=1` | Integration | `201` returned; fields match |
| TEST-003 | US-0.1 | Whitespace-only name rejected with inline error | Unit/Integration | `422` + "name is required" |
| TEST-004 | US-0.1 | Form submission time < 20 s for first-time user | E2E | Measured under 20 s |
| TEST-005 | US-0.1 | Post-submit navigation to detail page or list | E2E | Correct page rendered |
| TEST-006 | US-0.2 | Full-detail add includes all 6 fields in form | Integration | All fields submittable |
| TEST-007 | US-0.2 | `bottle_count` defaults to 1 when blank | Unit | Default value applied |
| TEST-008 | US-0.2 | `vintage` outside 1800–(current year + 5) rejected | Unit | `422` + correct message |
| TEST-009 | US-0.2 | `bottle_count` at create: values 1–9999 accepted; 0 or 10000 rejected | Unit | Boundary tests pass |
| TEST-010 | US-0.2 | String fields > 255 chars rejected | Unit | `422 VALIDATION_ERROR` |
| TEST-011 | US-0.2 | `201` response includes `id`, `date_added`, `date_updated` | Integration | Fields present in response |
| TEST-012 | US-0.3 | Edit form accessible from list view and detail page | E2E | Both entry points work |
| TEST-013 | US-0.3 | Blank name on edit rejected with inline error | Unit/Integration | `422` + "name is required" |
| TEST-014 | US-0.3 | `bottle_count` on update accepts 0–9999 | Unit | Boundary tests pass |
| TEST-015 | US-0.3 | `status` not changeable via edit form | Unit | `status` field absent from `PATCH /wines` schema |
| TEST-016 | US-0.3 | `date_updated` refreshed on successful edit | Integration | Timestamp updated |
| TEST-017 | US-0.4 | Delete action available from detail and list | E2E | Both entry points show delete |
| TEST-018 | US-0.4 | Confirmation dialog shown before deletion | E2E | Dialog visible; wine not deleted until confirmed |
| TEST-019 | US-0.4 | Confirmed deletion removes wine and shows toast | Integration | `204` returned; wine absent from list |
| TEST-020 | US-0.4 | Deleted wine's detail URL returns "Wine not found" | Integration | `404 NOT_FOUND` |
| TEST-021 | US-1.1 | List view loads < 1 s for 10,000-wine dataset | Performance | Measured under 1 s (p95) |
| TEST-022 | US-1.1 | Each row shows name, producer, vintage, varietal, bottle count | E2E | All fields rendered |
| TEST-023 | US-1.1 | Only `status='active'` wines shown by default | Integration | Consumed/removed absent |
| TEST-024 | US-1.1 | Pagination metadata present in response | Integration | `total`, `page`, `per_page`, `total_pages` present |
| TEST-025 | US-1.1 | Cross-user data not returned | Security | Only authenticated user's wines |
| TEST-026 | US-1.2 | Sort by name, vintage, producer, date_added all work | Integration | Results correctly ordered |
| TEST-027 | US-1.2 | asc/desc direction toggles correctly | Integration | Order reverses |
| TEST-028 | US-1.2 | Invalid sort key returns `422` | Unit | Error code + message match |
| TEST-029 | US-1.2 | Default sort is name asc on first load | Integration | Correct default order |
| TEST-030 | US-1.3 | Empty state shown when inventory is empty | E2E | UI component rendered |
| TEST-031 | US-1.3 | Empty state includes CTA "Add your first wine" button | E2E | Button present and navigates to form |
| TEST-032 | US-1.3 | Filtered-empty state message differs from truly-empty | E2E | "No wines match" vs "Your cellar is empty" |
| TEST-033 | US-1.4 | `+` and `−` buttons present on each list row | E2E | Controls rendered per row |
| TEST-034 | US-1.4 | Count updates in row without full page reload | E2E | DOM updates without navigation |
| TEST-035 | US-1.4 | Zero-bottle wines visually flagged in list | E2E | Visual indicator applied |
| TEST-036 | US-2.1 | Search input visible on list view | E2E | Input rendered |
| TEST-037 | US-2.1 | Search debounced at 300 ms | Unit | Request fires after delay, not per keystroke |
| TEST-038 | US-2.1 | Search matches name, producer, region; case-insensitive | Integration | Partial matches returned |
| TEST-039 | US-2.1 | Clearing search restores full list | E2E | All active wines returned |
| TEST-040 | US-2.1 | `q` > 255 chars rejected with `422` | Unit | Error returned |
| TEST-041 | US-2.1 | Match count displayed when search active | E2E | "X wines found" visible |
| TEST-042 | US-2.2 | Varietal filter uses partial case-insensitive match | Integration | Correct results |
| TEST-043 | US-2.2 | Vintage exact match filter works | Integration | Only matching vintage returned |
| TEST-044 | US-2.2 | `vintage_from`/`vintage_to` range filter works | Integration | Range results correct |
| TEST-045 | US-2.2 | `vintage_from` > `vintage_to` returns `422` | Unit | Error returned |
| TEST-046 | US-2.2 | `vintage` combined with range params returns `422` | Unit | Error returned |
| TEST-047 | US-2.3 | Multiple filters active simultaneously (AND logic) | Integration | Combined results correct |
| TEST-048 | US-2.3 | `q` and structured filters combinable | Integration | Intersection returned |
| TEST-049 | US-2.4 | "Clear all" button visible when any filter active | E2E | Button rendered |
| TEST-050 | US-2.4 | "Clear all" resets all filters and restores full list | E2E | Full active list returned |
| TEST-051 | US-2.4 | "Clear all" hidden when no filters active | E2E | Button absent |
| TEST-052 | US-3.1 | `+` button on list row sends increment action | Integration | `bottle_count` increased by 1 |
| TEST-053 | US-3.1 | `+` button on detail page sends increment action | Integration | `bottle_count` increased by 1 |
| TEST-054 | US-3.1 | Optimistic UI updates count immediately | E2E | Count visible before server response |
| TEST-055 | US-3.1 | Increment at 9999 returns `422` | Unit | Error message correct |
| TEST-056 | US-3.2 | `−` button sends decrement action | Integration | `bottle_count` decreased by 1 |
| TEST-057 | US-3.2 | Decrement at 0 returns `422 COUNT_BELOW_ZERO` | Unit/Integration | Error code and message match |
| TEST-058 | US-3.2 | `zero_bottle_flag: true` returned when count hits 0 | Integration | Flag present in response |
| TEST-059 | US-3.2 | Prompt shown when count reaches 0 | E2E | Non-blocking prompt visible |
| TEST-060 | US-3.3 | Exact count input accepts integers 0–9999 | Unit | Boundary tests pass |
| TEST-061 | US-3.3 | Negative values rejected | Unit | `422 VALIDATION_ERROR` |
| TEST-062 | US-3.3 | Decimal values rejected | Unit | `422 VALIDATION_ERROR` |
| TEST-063 | US-3.4 | Zero-bottle flag applied from API response value | Unit (frontend) | `bottle_count=0` triggers visual flag |
| TEST-064 | US-3.4 | Visual flag shown on detail page too | E2E | Flag rendered on detail page |
| TEST-065 | US-3.4 | Non-zero bottle count has no flag | Unit (frontend) | Flag absent |
| TEST-066 | US-4.1 | Detail page shows all 11 fields | E2E | All fields rendered |
| TEST-067 | US-4.1 | Status banner shown for consumed/removed wines | E2E | Banner visible with correct status |
| TEST-068 | US-4.1 | Malformed UUID in path returns `400 INVALID_ID` | Integration | Error code matches |
| TEST-069 | US-4.1 | Non-existent wine returns `404 NOT_FOUND` | Integration | Error code matches |
| TEST-070 | US-4.1 | Another user's wine returns `403 FORBIDDEN` | Security/Integration | `403` returned (not `404`) |
| TEST-071 | US-4.2 | Editable fields enter inline mode on click/tap | E2E | Input rendered |
| TEST-072 | US-4.2 | Enter/tap-away saves change via `PATCH` | Integration | `200` returned; field updated |
| TEST-073 | US-4.2 | Validation failure shows inline error; value preserved | E2E | Error visible; original value retained |
| TEST-074 | US-4.3 | Detail page shows `+`/`−` controls and count input | E2E | Controls rendered |
| TEST-075 | US-4.3 | "Mark as Consumed" and "Mark as Removed" shown when active | E2E | Actions visible for active wine |
| TEST-076 | US-4.3 | "Revert to Active" shown when consumed/removed | E2E | Action visible |
| TEST-077 | US-4.3 | Delete button triggers confirmation dialog | E2E | Dialog shown |
| TEST-078 | US-5.1 | Tasting notes area visible on detail page | E2E | Area rendered |
| TEST-079 | US-5.1 | Notes saved via `PATCH` with `tasting_notes` field | Integration | `200`; notes in response |
| TEST-080 | US-5.1 | Empty string `""` stored as null | Unit | `null` in DB column |
| TEST-081 | US-5.2 | 5-star rating control visible on detail page | E2E | Control rendered |
| TEST-082 | US-5.2 | Rating 1–5 accepted; 0 and 6 rejected with `422` | Unit | Boundary tests pass |
| TEST-083 | US-5.2 | Decimal rating rejected | Unit | `422` + "must be a whole number" |
| TEST-084 | US-5.2 | Rating set independently of notes | Integration | Only `rating` field updated |
| TEST-085 | US-5.3 | Existing notes editable via same inline flow | E2E | Edit flow works |
| TEST-086 | US-5.3 | "Clear notes" sets `tasting_notes = null` | Integration | `null` in response |
| TEST-087 | US-5.3 | "Clear rating" sets `rating = null` | Integration | `null` in response |
| TEST-088 | US-5.3 | Clear notes does not affect rating | Unit | `rating` unchanged |
| TEST-089 | US-5.4 | Status change to consumed does not clear notes | Integration | `tasting_notes` present after transition |
| TEST-090 | US-5.4 | Status change to removed does not clear rating | Integration | `rating` present after transition |
| TEST-091 | US-5.4 | Detail page of consumed wine shows notes and rating | E2E | Both fields visible |
| TEST-092 | US-6.1 | "Mark as Consumed" available from list and detail | E2E | Action visible in both views |
| TEST-093 | US-6.1 | Transition from `active` → `consumed` succeeds | Integration | `200`; `status='consumed'` in response |
| TEST-094 | US-6.1 | Non-active wine marked consumed returns `422` | Unit/Integration | `422 INVALID_TRANSITION` |
| TEST-095 | US-6.1 | Wine removed from active list after consumed | E2E | Wine absent from default list |
| TEST-096 | US-6.1 | `date_updated` refreshed after transition | Integration | Timestamp updated |
| TEST-097 | US-6.2 | "Mark as Removed" available from list and detail | E2E | Action visible |
| TEST-098 | US-6.2 | Transition from `active` → `removed` succeeds | Integration | `200`; `status='removed'` |
| TEST-099 | US-6.2 | `consumed` → `removed` direct transition blocked | Unit/Integration | `422 INVALID_TRANSITION` |
| TEST-100 | US-6.2 | `removed` → `consumed` direct transition blocked | Unit/Integration | `422 INVALID_TRANSITION` |
| TEST-101 | US-6.3 | "Revert to Active" visible on history list and detail | E2E | Action present |
| TEST-102 | US-6.3 | Transition `consumed` → `active` succeeds | Integration | `200`; `status='active'` |
| TEST-103 | US-6.3 | Transition `removed` → `active` succeeds | Integration | `200`; `status='active'` |
| TEST-104 | US-6.3 | `active` → `active` no-op returns `422` | Unit | "Wine is already active" |
| TEST-105 | US-6.3 | Wine reappears in active list after revert | E2E | Wine visible in default list |
| TEST-106 | US-6.4 | History tab/toggle accessible from list view | E2E | Navigation element present |
| TEST-107 | US-6.4 | `GET /wines?status=consumed` returns consumed wines | Integration | Only consumed in results |
| TEST-108 | US-6.4 | `GET /wines?status=all` returns all wines | Integration | All statuses in results |
| TEST-109 | US-6.4 | History list shows status badge per row | E2E | Badge rendered |
| TEST-110 | US-6.4 | History list supports same sort/pagination as active list | Integration | Sort and pagination params work |

---

### 5.3 Non-Functional Test Cases

| Test Case ID | NFR Category | Test Description | Acceptance Threshold |
|---|---|---|---|
| TEST-NFR-001 | Performance | List view load time — 10,000 wines | < 1 s (p95) |
| TEST-NFR-002 | Performance | Search/filter response time — 10,000 wines | < 500 ms (p95) |
| TEST-NFR-003 | Scalability | Data model supports 50,000 records per user | No degradation; schema constraints hold |
| TEST-NFR-004 | Usability | New user adds wine with full details | ≤ 60 s median |
| TEST-NFR-005 | Usability | Core actions (add, search, count update) in ≤ 2 taps | Navigation audit passes |
| TEST-NFR-006 | Data Integrity | `bottle_count` cannot be set below 0 via any flow | DB constraint + service layer test |
| TEST-NFR-007 | Security | Authenticated user cannot access another user's wines | Cross-user request returns `403` |
| TEST-NFR-008 | Security | JWT without valid signature rejected | `401 UNAUTHORIZED` returned |
| TEST-NFR-009 | Security | All API traffic over HTTPS | No HTTP-only endpoints |
| TEST-NFR-010 | Accessibility | WCAG 2.1 AA on list, detail, add/edit, history screens | Automated a11y audit passes |
| TEST-NFR-011 | Responsiveness | All core screens functional on mobile viewport (375 px) | Manual device test passes |
| TEST-NFR-012 | Error Handling | API failure surfaces visible error; form input preserved | No silent failures; input intact |

---

## 6. Change Management

### 6.1 Document Revision History

| Version | Date | Author | Change Summary | Affected Sections |
|---|---|---|---|---|
| 1.0 | 2026-05-15 | Generated | Initial RTM creation from PRD v1.0, FRD v1.0, TechArch v1.0, UserStories v1.0 | All |

---

### 6.2 Requirement Change Log

| Change ID | Date | Change Type | Affected Requirement(s) | Description | Impact |
|---|---|---|---|---|---|
| — | — | — | — | No changes recorded in v1.0 | — |

---

### 6.3 Change Control Process

When a requirement, user story, or architectural decision changes after this RTM is baselined:

1. **Identify impact** — determine which RTM rows are affected (PRD, FRD, TechArch, and/or user story level).
2. **Update source document** — modify the originating spec document (PRD, FRD, TechArch, or UserStories) with a version bump and change note.
3. **Update this RTM** — revise the traceability row(s), test case coverage, and change log.
4. **Re-validate coverage** — confirm all PRD features still have FRD, TechArch, and user story coverage.
5. **Obtain sign-off** — get approval from the roles listed in Section 7 before re-baselining.

---

## 7. Traceability Coverage Gaps

As of v1.0, no coverage gaps have been identified. All seven PRD features (F0–F6) have:

- At least one FRD sub-feature
- At least one TechArch specification (API endpoint, DB schema, or frontend component)
- At least one user story with acceptance criteria
- At least one defined test case

**Out-of-scope items with no traceability (by design):**

| Item | Reason |
|---|---|
| Barcode scanning | Explicitly out of scope v1; deferred to v2 |
| Social / sharing features | Explicitly out of scope v1 |
| Wine purchasing / marketplace | Out of scope indefinitely |
| Cellar temperature / storage tracking | Hardware dependency; deferred |
| Analytics integration (Mixpanel, Amplitude) | Post-launch; deferred from v1 |
| Password reset email flow | Optional in v1; admin DB reset acceptable for early users |

---

## 8. Approval

| Role | Name | Signature | Date |
|---|---|---|---|
| Product Owner | — | ______________ | ________ |
| Lead Engineer | — | ______________ | ________ |
| QA Lead | — | ______________ | ________ |
| Project Sponsor | — | ______________ | ________ |

---

*Document generated: 2026-05-15 | Project: WineInventory | Version: 1.0*
