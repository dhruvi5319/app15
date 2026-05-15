# User Stories — Wine Inventory App

**Project:** WineInventory
**Version:** 1.0
**Date:** 2026-05-15
**Status:** Draft
**Based on:** PRD-WineInventory.md v1.0, FRD-WineInventory.md v1.0, PERSONAS-WineInventory.md v1.0

---

## Priority Definitions

| Priority | Label | Description |
|---|---|---|
| **P0** | Critical — MVP | Must ship in v1; product does not work without it |
| **P1** | High value — MVP target | High-value feature; planned for v1 but not blocking launch |
| **P2** | Nice to have | Desirable; defer if timeline is tight |
| **P3** | Future / v2 | Out of scope for v1 |

---

## Personas

| ID | Name | Role |
|---|---|---|
| PER-01 | Marcus Webb | Home Wine Collector |
| PER-02 | Sofia Reyes | Restaurant Floor Manager |
| PER-03 | Priya Nair | Casual Wine Gifter / Occasional Buyer |

---

## Epic 0: Wine Entry & Management (F0)

The core CRUD flow that allows users to add, edit, and delete wine records. Every other feature depends on wines being correctly recorded here. Only the wine name is required; all other fields are optional for rapid partial entry.

---

### US-0.1: Quick-Add a Wine by Name Only
**As a** Priya Nair, **I want to** add a wine by typing only its name, **so that** I can log a bottle I just bought or enjoyed in under 30 seconds without needing wine expertise.

**Acceptance Criteria:**
- [ ] Add Wine form is accessible in no more than 2 taps/clicks from the home screen
- [ ] Only the `name` field is required; all other fields (producer, vintage, varietal, region, bottle count) are optional
- [ ] Submitting with only a name creates a valid wine record with `status = 'active'` and `bottle_count = 1`
- [ ] A whitespace-only name is rejected with an inline error: "name is required"
- [ ] The form submits successfully in under 30 seconds for a first-time user
- [ ] After submission, the user is navigated to the Wine Detail Page or back to the List View

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.2: Add a Wine with Full Details
**As a** Marcus Webb, **I want to** add a new wine with name, producer, vintage, varietal, region, and bottle count in a single form, **so that** my cellar record is complete from the moment I log it.

**Acceptance Criteria:**
- [ ] Add Wine form includes fields: name, producer, vintage, varietal, region, bottle count
- [ ] `bottle_count` defaults to 1 if left blank
- [ ] `vintage` accepts integers only; values outside 1800–(current year + 5) are rejected with "vintage must be between 1800 and [year]"
- [ ] `bottle_count` at creation accepts positive integers 1–9999 only
- [ ] String fields (producer, varietal, region) are rejected if they exceed 255 characters
- [ ] On success, a `201 Created` response returns the full wine object including server-generated `id`, `date_added`, and `date_updated`
- [ ] Full-details entry completes in under 60 seconds for a first-time user

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.3: Edit an Existing Wine Record
**As a** Sofia Reyes, **I want to** edit any field on a wine record, **so that** I can correct mistakes or update details when producers change labels or new vintage years arrive.

**Acceptance Criteria:**
- [ ] Edit form is accessible from both the List View and the Wine Detail Page
- [ ] All fields (name, producer, vintage, varietal, region, bottle count) are editable
- [ ] `name` cannot be set to blank or whitespace-only; an inline error is shown
- [ ] `vintage` and `bottle_count` updates use the same validation rules as creation
- [ ] `bottle_count` on update accepts values 0–9999 (allows setting to zero)
- [ ] `status` cannot be changed via the edit form (status changes use the dedicated status endpoint)
- [ ] On success, `date_updated` is refreshed and the updated wine object is returned
- [ ] Validation errors are shown inline; the previous values are preserved until the user corrects them

**Priority:** P0 | **Feature Ref:** F0

---

### US-0.4: Delete a Wine Record
**As a** Marcus Webb, **I want to** permanently delete a wine record with a confirmation step, **so that** I can remove wines I entered by mistake without accidentally deleting important records.

**Acceptance Criteria:**
- [ ] Delete action is available from both the Wine Detail Page and the List View
- [ ] Clicking Delete shows a confirmation dialog: "Delete [wine name]? This cannot be undone."
- [ ] The user must explicitly confirm before deletion proceeds
- [ ] Confirmed deletion permanently removes the wine record and all associated tasting notes and ratings
- [ ] A brief confirmation toast is shown after successful deletion
- [ ] The wine is immediately removed from the List View after deletion
- [ ] Attempting to access the deleted wine's detail page returns a "Wine not found" error

**Priority:** P0 | **Feature Ref:** F0

---

## Epic 1: Wine Inventory List View (F1)

The primary screen users return to repeatedly — a scrollable, sortable, paginated list of all active wines. Must feel fast and clear for collections from one bottle to tens of thousands.

---

### US-1.1: Browse the Active Inventory List
**As a** Sofia Reyes, **I want to** see all my active wines in a clear, scrollable list, **so that** I can quickly assess current stock during service.

**Acceptance Criteria:**
- [ ] List view loads in under 1 second for collections up to 10,000 wines
- [ ] Each row displays: name, producer, vintage, varietal, and bottle count
- [ ] Only wines with `status = 'active'` are shown by default
- [ ] List is paginated (default 25 per page) or uses infinite scroll
- [ ] Pagination metadata (total, page, per_page, total_pages) is available
- [ ] The list is scoped strictly to the authenticated user; no cross-user data is returned

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.2: Sort the Inventory List
**As a** Marcus Webb, **I want to** sort my wine list by name, vintage, producer, or date added, **so that** I can find what I am looking for without using search.

**Acceptance Criteria:**
- [ ] Sort controls are visible and accessible on the list view
- [ ] Supported sort keys: name, vintage, producer, date_added
- [ ] Each sort key supports ascending and descending direction
- [ ] Changing the sort key or direction re-fetches and re-renders the list immediately
- [ ] An invalid sort key returns a 422 error: "sort must be one of: name, vintage, producer, date_added"
- [ ] Default sort is name ascending on first load

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.3: See an Empty State When No Wines Are Logged
**As a** Priya Nair, **I want to** see a clear message and call-to-action when my inventory is empty, **so that** I know how to get started and the blank screen does not feel like an error.

**Acceptance Criteria:**
- [ ] When the inventory has zero active wines, the empty state UI is shown
- [ ] Empty state includes an illustration or icon, a message ("Your cellar is empty" or similar), and a prominent "Add your first wine" button
- [ ] Clicking the call-to-action button navigates directly to the Add Wine form
- [ ] Empty state also appears when active filters produce zero results (with appropriate messaging like "No wines match your search")
- [ ] Empty state does not appear if wines exist but are filtered out — the messaging must distinguish between truly empty and filtered-empty

**Priority:** P0 | **Feature Ref:** F1

---

### US-1.4: See Inline Bottle Count Controls on Each List Row
**As a** Sofia Reyes, **I want to** increment or decrement a bottle count directly from the list view, **so that** I can update stock in under 3 taps without navigating away from my overview.

**Acceptance Criteria:**
- [ ] Each list row shows `+` and `−` buttons alongside the bottle count
- [ ] Tapping `+` increments the count immediately (optimistic UI update)
- [ ] Tapping `−` decrements the count immediately; the `−` button is disabled or shows an error if count is already 0
- [ ] Count update is reflected in the row without a full page reload
- [ ] Zero-bottle wines are visually flagged (e.g., greyed out or "Empty" badge)

**Priority:** P0 | **Feature Ref:** F1

---

## Epic 2: Search & Filter (F2)

Fast, flexible lookup across the collection by any key dimension. Results update in real time (debounced, no page reload). Multiple filters can be combined, and a single action resets to the full list.

---

### US-2.1: Search by Free Text
**As a** Sofia Reyes, **I want to** type a search term and see matching wines instantly, **so that** I can locate a specific wine in under 10 seconds during service.

**Acceptance Criteria:**
- [ ] A search input field is visible and accessible from the list view
- [ ] Search is debounced (300ms delay after last keystroke) to avoid excessive requests
- [ ] Search matches against `name`, `producer`, and `region` fields using case-insensitive partial matching
- [ ] Results update without a page reload
- [ ] Clearing the search field restores the full active inventory list
- [ ] Search queries exceeding 255 characters are rejected with "Search query must be 255 characters or fewer"
- [ ] Search results show a match count ("X wines found")

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.2: Filter by Varietal, Region, Vintage, or Producer
**As a** Marcus Webb, **I want to** filter my wines by varietal, region, vintage year, or producer, **so that** I can quickly see all the Pinot Noirs from a specific region or all wines from a particular vintage.

**Acceptance Criteria:**
- [ ] Filter controls are available for: varietal (exact match), region (partial match), vintage year (exact or range: vintage_from / vintage_to), producer (partial match)
- [ ] Filters are case-insensitive
- [ ] Vintage filters accept integers in range 1800–(current year + 5) only
- [ ] `vintage_from` must be ≤ `vintage_to` when both are supplied; otherwise a 422 error is shown
- [ ] Combining `vintage` (exact) with `vintage_from`/`vintage_to` in the same request returns a 422 error
- [ ] Match count updates to reflect the filtered result set

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.3: Apply Multiple Filters Simultaneously
**As a** Marcus Webb, **I want to** combine a free-text search with one or more structured filters, **so that** I can narrow my collection to exactly the subset I need in one action.

**Acceptance Criteria:**
- [ ] Free-text search and structured filters can be active at the same time
- [ ] Multiple structured filters can be active simultaneously (AND logic)
- [ ] Combined filter results update in real time without a page reload
- [ ] The match count reflects the combined filter result

**Priority:** P0 | **Feature Ref:** F2

---

### US-2.4: Clear All Filters
**As a** Priya Nair, **I want to** clear all active search terms and filters in one action, **so that** I can return to my full inventory without manually removing each filter.

**Acceptance Criteria:**
- [ ] A "Clear all filters" or "Reset" button is visible when any filter or search term is active
- [ ] Clicking the button clears all search terms and filter values in one action
- [ ] After reset, the full active inventory list is restored (default: status=active, sort=name, direction=asc)
- [ ] The "Clear all filters" button is hidden when no filters are active

**Priority:** P0 | **Feature Ref:** F2

---

## Epic 3: Bottle Count Tracking (F3)

Lightweight, friction-free mechanism to keep bottle counts accurate as wines are opened, purchased, or corrected. Users can increment or decrement from the list or detail view in two taps.

---

### US-3.1: Increment a Bottle Count
**As a** Marcus Webb, **I want to** add one bottle to a wine record with a single tap, **so that** I can update my inventory immediately when a new purchase arrives.

**Acceptance Criteria:**
- [ ] `+` button is available on both the list view row and the wine detail page
- [ ] Tapping `+` sends an increment action and updates `bottle_count` by 1
- [ ] The UI updates immediately (optimistic update)
- [ ] `bottle_count` is capped at 9999; incrementing at the cap is rejected with "bottle_count cannot exceed 9999"
- [ ] `date_updated` is refreshed on the server on every count change

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.2: Decrement a Bottle Count
**As a** Sofia Reyes, **I want to** subtract one bottle from a wine record with a single tap, **so that** I can mark a bottle as used immediately after it is opened or sold.

**Acceptance Criteria:**
- [ ] `−` button is available on both the list view row and the wine detail page
- [ ] Tapping `−` sends a decrement action and updates `bottle_count` by 1
- [ ] The UI updates immediately (optimistic update)
- [ ] Decrementing when `bottle_count = 0` is rejected with "Bottle count cannot go below zero"
- [ ] When the new count reaches 0, a `zero_bottle_flag: true` is returned in the response
- [ ] When count reaches 0, a non-blocking prompt is shown: "No bottles left. Mark as consumed or removed?" with quick-action links

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.3: Set an Exact Bottle Count
**As a** Sofia Reyes, **I want to** type an exact number into the bottle count field, **so that** I can make a bulk correction after a delivery or stocktake without tapping `+` dozens of times.

**Acceptance Criteria:**
- [ ] An exact-count input field is available on the wine detail page and/or edit form
- [ ] Accepts integers 0–9999 inclusive
- [ ] Values below 0 or above 9999 are rejected with appropriate validation errors
- [ ] Decimal values are rejected
- [ ] On success, `bottle_count` and `date_updated` are updated server-side

**Priority:** P0 | **Feature Ref:** F3

---

### US-3.4: See a Visual Flag on Zero-Bottle Wines
**As a** Sofia Reyes, **I want to** see zero-bottle wines clearly flagged in the inventory list, **so that** servers never attempt to sell a wine that is out of stock.

**Acceptance Criteria:**
- [ ] Wines with `bottle_count = 0` and `status = 'active'` are visually distinguished in the list (e.g., greyed out row, "Empty" badge)
- [ ] The flag is applied based on `bottle_count` value in the API response — no extra API call required
- [ ] The visual flag is also shown on the wine detail page
- [ ] Wines with a count above 0 do not show the zero-bottle flag

**Priority:** P0 | **Feature Ref:** F3

---

## Epic 4: Wine Detail Page (F4)

A dedicated full-record view for each wine. Surfaces all stored information in a clean, readable layout and provides entry points for all mutations: quick-edit, full edit, bottle count changes, status transitions, and deletion.

---

### US-4.1: View All Details of a Wine
**As a** Marcus Webb, **I want to** open a wine's detail page and see all stored information in one place, **so that** I have the complete picture of a specific bottle before deciding whether to open it or reorder.

**Acceptance Criteria:**
- [ ] Detail page displays all fields: name, producer, vintage, varietal, region, bottle count, status, tasting notes, rating, date added, date last updated
- [ ] Page loads the wine object via `GET /wines/{wine_id}`
- [ ] If the wine has `status = 'consumed'` or `status = 'removed'`, a prominent status banner is shown at the top
- [ ] A malformed wine ID (non-UUID) returns a 400 error: "Invalid wine ID format"
- [ ] A wine that does not exist returns a 404 error: "Wine not found"
- [ ] A wine belonging to another user returns a 403 error: "Access denied"

**Priority:** P0 | **Feature Ref:** F4

---

### US-4.2: Quick-Edit a Field on the Detail Page
**As a** Marcus Webb, **I want to** edit a field directly on the detail page without navigating to a separate form, **so that** I can correct a typo or update a detail in one step.

**Acceptance Criteria:**
- [ ] Editable fields (name, producer, vintage, varietal, region) can be clicked/tapped to enter inline edit mode
- [ ] The field transitions to a text or number input; confirming with Enter or tap-away saves the change
- [ ] Client sends a `PATCH /wines/{wine_id}` with only the changed field
- [ ] On success, the field reverts to display mode showing the updated value
- [ ] On validation failure, an inline error is shown and the previous value is preserved
- [ ] Validation rules match the full edit form (name required, vintage range, max lengths)

**Priority:** P0 | **Feature Ref:** F4

---

### US-4.3: Access All Actions from the Detail Page
**As a** Marcus Webb, **I want to** access bottle count controls, status transition actions, and the delete action all from the detail page, **so that** the detail page is the single place I need to manage a wine fully.

**Acceptance Criteria:**
- [ ] Detail page shows `+` and `−` bottle count controls and an exact-count input
- [ ] Detail page shows a "Status" badge ("Active", "Consumed", or "Removed")
- [ ] If status is `active`, "Mark as Consumed" and "Mark as Removed" actions are visible
- [ ] If status is `consumed` or `removed`, a "Revert to Active" action is visible
- [ ] A "Delete" button is present and triggers the confirmation dialog before deleting
- [ ] A "Edit full record" link navigates to the full edit form

**Priority:** P0 | **Feature Ref:** F4

---

## Epic 5: Tasting Notes & Ratings (F5)

Allow users to capture their impressions of a wine alongside its inventory record, turning the app into a personal wine journal as well as a cellar ledger. Notes and ratings persist even after a wine is marked as consumed.

---

### US-5.1: Add a Tasting Note
**As a** Marcus Webb, **I want to** write free-text tasting notes for a wine on its detail page, **so that** I can capture my impressions immediately after opening a bottle while they are still fresh.

**Acceptance Criteria:**
- [ ] A tasting notes area is visible on the wine detail page
- [ ] Tapping/clicking the area opens an inline text area or modal for free-text entry
- [ ] No character limit is enforced on tasting notes
- [ ] Saving the note sends `PATCH /wines/{wine_id}` with `{ "tasting_notes": "<text>" }`
- [ ] On success, the note is displayed on the detail page
- [ ] An empty string `""` for `tasting_notes` is treated as null (no note stored)

**Priority:** P1 | **Feature Ref:** F5

---

### US-5.2: Rate a Wine
**As a** Priya Nair, **I want to** give a wine a quick numeric rating on its detail page, **so that** I can compare bottles later without writing a full review.

**Acceptance Criteria:**
- [ ] A rating control (star selector or numeric input) is visible on the wine detail page
- [ ] Rating accepts integers 1–100 inclusive (or equivalent star scale as configured)
- [ ] Rating of 0, decimals, or values outside 1–100 are rejected with "rating must be between 1 and 100" or "rating must be a whole number"
- [ ] Saving a rating sends `PATCH /wines/{wine_id}` with `{ "rating": <value> }`
- [ ] On success, the rating is displayed on the detail page
- [ ] Rating can be set independently of tasting notes in separate requests

**Priority:** P1 | **Feature Ref:** F5

---

### US-5.3: Edit or Delete Tasting Notes and Rating
**As a** Marcus Webb, **I want to** update or clear my tasting notes and rating at any time, **so that** I can refine my impressions or correct a mistake.

**Acceptance Criteria:**
- [ ] Existing tasting notes can be edited inline on the detail page (same flow as adding)
- [ ] Existing rating can be changed by interacting with the rating control
- [ ] A "Clear notes" action sets `tasting_notes` to null; detail page shows the cleared state
- [ ] A "Clear rating" action sets `rating` to null; detail page shows the cleared state
- [ ] Clearing notes does not affect the rating, and vice versa
- [ ] Edit and delete actions are available regardless of the wine's status (active, consumed, removed)

**Priority:** P1 | **Feature Ref:** F5

---

### US-5.4: Retain Tasting Notes and Rating After Status Change
**As a** Marcus Webb, **I want to** access my tasting notes and rating even after marking a wine as consumed, **so that** I have a permanent record of every bottle I have opened.

**Acceptance Criteria:**
- [ ] Marking a wine as consumed or removed does NOT clear `tasting_notes` or `rating`
- [ ] The detail page for a consumed or removed wine still displays tasting notes and rating
- [ ] Tasting notes and rating are visible in the history view alongside the wine record
- [ ] Notes and rating are only permanently removed if the wine record itself is hard-deleted

**Priority:** P1 | **Feature Ref:** F5

---

## Epic 6: Consumed / Removed Status (F6)

Let users mark wines as consumed or removed without deleting the historical record. Preserves tasting notes and ratings while keeping the active inventory clean. Status transitions are reversible.

---

### US-6.1: Mark a Wine as Consumed
**As a** Marcus Webb, **I want to** mark a wine as consumed after I have finished the last bottle, **so that** it disappears from my active inventory while the tasting note and record are preserved for future reference.

**Acceptance Criteria:**
- [ ] "Mark as Consumed" action is available from both the list view row and the wine detail page
- [ ] Triggering the action sends `PATCH /wines/{wine_id}/status` with `{ "status": "consumed" }`
- [ ] Server validates that the wine is currently `active`; non-active wines return 422
- [ ] On success, the wine is removed from the active inventory list
- [ ] The wine remains accessible in the history view with its tasting notes and rating intact
- [ ] `date_updated` is refreshed after the status change

**Priority:** P1 | **Feature Ref:** F6

---

### US-6.2: Mark a Wine as Removed
**As a** Sofia Reyes, **I want to** mark a wine as removed when a bottle is sold, gifted, or broken, **so that** the active inventory stays accurate without losing the record of what we had.

**Acceptance Criteria:**
- [ ] "Mark as Removed" action is available from both the list view row and the wine detail page
- [ ] Triggering the action sends `PATCH /wines/{wine_id}/status` with `{ "status": "removed" }`
- [ ] Server validates that the wine is currently `active`; non-active wines return 422
- [ ] On success, the wine is removed from the active inventory list
- [ ] The wine remains accessible in the history view
- [ ] Direct transition from `consumed` → `removed` or `removed` → `consumed` without reverting first is rejected with "Revert to active before changing to [status]"

**Priority:** P1 | **Feature Ref:** F6

---

### US-6.3: Revert a Wine Back to Active
**As a** Marcus Webb, **I want to** revert a wine from consumed or removed back to active, **so that** I can correct a status change I made by mistake.

**Acceptance Criteria:**
- [ ] "Revert to Active" action is visible on the detail page and history list for consumed/removed wines
- [ ] Triggering the action sends `PATCH /wines/{wine_id}/status` with `{ "status": "active" }`
- [ ] Server validates the wine is currently `consumed` or `removed`
- [ ] On success, the wine reappears in the active inventory list
- [ ] No-op transitions (e.g., active → active) are rejected with "Wine is already active"
- [ ] `date_updated` is refreshed after the revert

**Priority:** P1 | **Feature Ref:** F6

---

### US-6.4: View Consumed and Removed History
**As a** Sofia Reyes, **I want to** browse wines I have marked as consumed or removed, **so that** I can review what we have gone through and plan reorders.

**Acceptance Criteria:**
- [ ] A "History" tab or toggle is accessible from the inventory list view
- [ ] Activating the history view sends `GET /wines?status=consumed`, `status=removed`, or `status=all`
- [ ] History list displays the same at-a-glance fields as the active list, plus a status badge (Consumed / Removed) per row
- [ ] History wines are excluded from the default active list (`GET /wines` with no status param defaults to `status=active`)
- [ ] The history list supports the same sort and pagination controls as the active list
- [ ] Clicking a wine in history navigates to its full detail page

**Priority:** P1 | **Feature Ref:** F6

---

## Story Index

| Story ID | Title | Persona(s) | Priority | Feature Ref |
|---|---|---|---|---|
| US-0.1 | Quick-Add a Wine by Name Only | Priya Nair | P0 | F0 |
| US-0.2 | Add a Wine with Full Details | Marcus Webb | P0 | F0 |
| US-0.3 | Edit an Existing Wine Record | Sofia Reyes | P0 | F0 |
| US-0.4 | Delete a Wine Record | Marcus Webb | P0 | F0 |
| US-1.1 | Browse the Active Inventory List | Sofia Reyes | P0 | F1 |
| US-1.2 | Sort the Inventory List | Marcus Webb | P0 | F1 |
| US-1.3 | See an Empty State When No Wines Are Logged | Priya Nair | P0 | F1 |
| US-1.4 | See Inline Bottle Count Controls on Each List Row | Sofia Reyes | P0 | F1 |
| US-2.1 | Search by Free Text | Sofia Reyes | P0 | F2 |
| US-2.2 | Filter by Varietal, Region, Vintage, or Producer | Marcus Webb | P0 | F2 |
| US-2.3 | Apply Multiple Filters Simultaneously | Marcus Webb | P0 | F2 |
| US-2.4 | Clear All Filters | Priya Nair | P0 | F2 |
| US-3.1 | Increment a Bottle Count | Marcus Webb | P0 | F3 |
| US-3.2 | Decrement a Bottle Count | Sofia Reyes | P0 | F3 |
| US-3.3 | Set an Exact Bottle Count | Sofia Reyes | P0 | F3 |
| US-3.4 | See a Visual Flag on Zero-Bottle Wines | Sofia Reyes | P0 | F3 |
| US-4.1 | View All Details of a Wine | Marcus Webb | P0 | F4 |
| US-4.2 | Quick-Edit a Field on the Detail Page | Marcus Webb | P0 | F4 |
| US-4.3 | Access All Actions from the Detail Page | Marcus Webb | P0 | F4 |
| US-5.1 | Add a Tasting Note | Marcus Webb | P1 | F5 |
| US-5.2 | Rate a Wine | Priya Nair | P1 | F5 |
| US-5.3 | Edit or Delete Tasting Notes and Rating | Marcus Webb | P1 | F5 |
| US-5.4 | Retain Tasting Notes and Rating After Status Change | Marcus Webb | P1 | F5 |
| US-6.1 | Mark a Wine as Consumed | Marcus Webb | P1 | F6 |
| US-6.2 | Mark a Wine as Removed | Sofia Reyes | P1 | F6 |
| US-6.3 | Revert a Wine Back to Active | Marcus Webb | P1 | F6 |
| US-6.4 | View Consumed and Removed History | Sofia Reyes | P1 | F6 |

---

## Priority Summary

| Priority | Story Count | Features |
|---|---|---|
| P0 — Critical MVP | 19 | F0, F1, F2, F3, F4 |
| P1 — High value MVP | 8 | F5, F6 |
| **Total** | **27** | **F0–F6** |

---

*Document generated: 2026-05-15 | Project: WineInventory | Version: 1.0*
