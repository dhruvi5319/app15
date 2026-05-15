# UX Mockup — Wine Inventory App

**Project:** WineInventory
**Generated:** 2026-05-15
**Based on:** UserStories-WineInventory.md v1.0, PRD-WineInventory.md v1.0, FRD-WineInventory.md v1.0, JOURNEYS-WineInventory.md v1.0

---

## Overview

### UX Approach

The Wine Inventory App serves three distinct personas with different urgency profiles:

- **Marcus Webb** (home collector) — thoughtful, desktop-comfortable, wants completeness
- **Sofia Reyes** (restaurant floor manager) — high-pressure, tablet-first, needs sub-5-second actions
- **Priya Nair** (casual buyer) — low commitment, mobile, must not be blocked by friction

The design philosophy derives from six cross-journey patterns identified in the Journey Maps:

1. **Speed-of-capture is the make-or-break moment** (CP-01) — the app must be usable within 2 seconds of opening; any screen that requires navigation before the first useful action will cause abandonment.
2. **Bottle count on every list row** (CP-02) — eliminates a navigation step in 5 of 7 journeys. Non-negotiable.
3. **Search spans active and consumed inventory** (CP-03) — if search only covers active wines, the re-buy use case (JRN-03.2) breaks entirely.
4. **Inline controls eliminate navigation tax** (CP-04) — decrement, star rating, and note quick-add must all be reachable within 1–2 taps without a separate form.
5. **The Empty badge as a trust signal** (CP-05) — zero-bottle wines must display a bold, high-contrast badge the moment count hits zero.
6. **History one tap away** (CP-06) — consumed/removed view reachable in exactly 1 additional tap from the main screen.

### Design Principles

| Principle | Rationale |
|-----------|-----------|
| **Progressive disclosure** | Name is all that's required; optional fields are accessible but never block save |
| **Optimistic UI** | Bottle count changes reflect immediately; rollback only on server error |
| **Inline over navigate** | Every mutation accessible without leaving the current screen where possible |
| **Visual status at a glance** | Zero-bottle "EMPTY" badge, status banner on consumed/removed wines, match count on search |
| **Mobile-first, tablet-aware** | Tap targets ≥ 44px; search bar persistent; layout adapts to tablet (Sofia's primary device) |

### Screen Inventory

| Screen ID | Screen Name | Primary Feature |
|-----------|-------------|-----------------|
| SCR-01 | Inventory List View | F1, F2, F3 |
| SCR-02 | Add Wine Form | F0 |
| SCR-03 | Wine Detail Page | F4, F3, F5, F6 |
| SCR-04 | Edit Wine Form | F0 |
| SCR-05 | Search & Filter Panel | F2 |
| SCR-06 | History View | F6 |
| SCR-07 | Delete Confirmation Dialog | F0 |
| SCR-08 | Empty State | F1 |

### Flow Inventory

| Flow ID | Flow Name | Primary Stories |
|---------|-----------|-----------------|
| FLW-01 | Quick-Add a Wine (name only) | US-0.1, US-1.1, US-1.3 |
| FLW-02 | Full-Details Wine Entry | US-0.2 |
| FLW-03 | Search & Filter Inventory | US-2.1, US-2.2, US-2.3, US-2.4 |
| FLW-04 | Bottle Count Update (inline) | US-3.1, US-3.2, US-3.4 |
| FLW-05 | Open Bottle & Capture Note | US-5.1, US-5.2, US-6.1 |
| FLW-06 | Mark Consumed / Removed | US-6.1, US-6.2, US-6.3 |
| FLW-07 | Browse History & Retrieve Note | US-6.4, US-4.1, US-5.4 |

---
---

## User Flows

---

### FLW-01: Quick-Add a Wine (Name Only)

**User Stories:** US-0.1, US-1.3
**Personas:** Priya Nair (primary), Marcus Webb
**Trigger:** User taps "Add Wine" from the home screen or the empty-state CTA button
**Exit:** Wine Detail Page OR back to List View with new wine visible

```
[Home / List View]
    │
    │  Tap "+ Add Wine" button (top-right, always visible)
    ▼
[Add Wine Form — SCR-02]
    │  Name field auto-focused
    │  User types name (required)
    │  Optional fields collapsed ("Add more details ▾")
    │
    ├── [Name is blank / whitespace only]
    │       │
    │       ▼
    │   Inline error: "Name is required"
    │   Submission blocked; user corrects
    │
    ├── [Name filled, tap "Save Wine"]
    │       │
    │       ▼
    │   POST /wines (optimistic)
    │       │
    │       ├── 201 Created ──▶ [Wine Detail Page — SCR-03]
    │       │                        │
    │       │                   Toast: "[Name] added to your cellar"
    │       │                   Prompt: "Want to add a rating?" (inline star tap)
    │       │
    │       └── 422 / 500 ──▶ Inline error on form
    │                          Previous values preserved
    │
    └── [Tap "Cancel" / navigate back]
            │
            ▼
        [List View — no change]
```

**Steps:**
1. User taps the persistent `+ Add Wine` button (max 1 tap from home screen — US-0.1 AC).
2. Add Wine form opens with **name field auto-focused**; keyboard appears immediately on mobile.
3. User types the wine name. All other fields are collapsed below a "Add more details ▾" toggle.
4. User taps "Save Wine". Client validates: name non-empty, non-whitespace.
5. On validation failure: inline error "Name is required" appears below the field; form stays open.
6. On success: `POST /wines` with `{ name, bottle_count: 1, status: "active" }`.
7. User is navigated to the Wine Detail Page. Toast appears: *"[Wine Name] added to your cellar."*
8. A soft prompt on the detail page: *"Want to add a rating while you remember?"* — one-tap star selector.

**Key UX Decisions:**
- Optional fields are **collapsed by default** (progressive disclosure) — Priya never sees vintage/varietal unless she wants to. This is the JRN-03.1 critical path.
- The `+ Add Wine` button is **always visible** on the list view header — no more than 1 tap to reach the form (US-0.1 AC: ≤ 2 taps from home screen).
- After save, user goes to **Wine Detail** rather than staying on the form, so they can immediately add a rating inline (JRN-03.1 delight moment).

---

### FLW-02: Full-Details Wine Entry

**User Stories:** US-0.2
**Personas:** Marcus Webb (primary)
**Trigger:** User opens Add Wine form and expands optional fields
**Exit:** Wine Detail Page with all fields populated

```
[Add Wine Form — SCR-02]
    │
    │  Name (required) filled
    │  Taps "Add more details ▾"
    │
    ▼
[Expanded Form Fields]
    │  Producer, Vintage, Varietal, Region, Bottle Count
    │  All optional; Bottle Count defaults to 1
    │
    ├── [Vintage out of range 1800–(year+5)]
    │       └── Inline error: "Vintage must be between 1800 and [year]"
    │
    ├── [Bottle count < 1 or > 9999]
    │       └── Inline error: "Bottle count must be between 1 and 9999"
    │
    ├── [String field > 255 chars]
    │       └── Inline error: "[Field] must be 255 characters or fewer"
    │
    └── [All valid → Save Wine]
            │
            ▼
        POST /wines (full payload)
            │
            ├── 201 Created ──▶ Wine Detail Page
            │                   Toast: "6 bottles of [Name] added"
            └── Error ──▶ Inline errors; values preserved
```

**Steps:**
1. From Add Wine form, user taps "Add more details ▾" to expand the optional fields section.
2. Fields revealed: Producer, Vintage (integer), Varietal, Region, Bottle Count (integer, default 1).
3. Client validates each field on blur (not on change, to avoid jarring errors while typing).
4. Vintage field: numeric keyboard on mobile; rejects non-integers and values outside 1800–(current year + 5).
5. Bottle Count: numeric keyboard; defaults to 1 if left empty; range 1–9999 on create.
6. On save: `POST /wines` with full payload. Server returns `201` with `id`, `date_added`, `date_updated`.
7. Navigation to Wine Detail Page. Toast: *"[N] bottle(s) of [Name] added."*

---
---

### FLW-03: Search & Filter Inventory

**User Stories:** US-2.1, US-2.2, US-2.3, US-2.4
**Personas:** Sofia Reyes (primary), Marcus Webb
**Trigger:** User taps the search bar or a filter chip on the Inventory List View
**Exit:** Filtered results visible; or filters cleared and full list restored

```
[Inventory List View — SCR-01]
    │
    │  Persistent search bar at top of list
    │
    ├── [User types in search bar]
    │       │  300ms debounce
    │       ▼
    │   GET /wines?q={term}
    │       │
    │       ├── Results found ──▶ List updates in place
    │       │                     Match count: "X wines found"
    │       │
    │       └── 0 results ──▶ Filtered empty state
    │                          "No wines match your search"
    │                          [Clear search ×]
    │
    ├── [User taps "Filters" button]
    │       │
    │       ▼
    │   [Filter Panel slides up — SCR-05]
    │       │  Varietal (dropdown/select)
    │       │  Region (text input, partial match)
    │       │  Producer (text input, partial match)
    │       │  Vintage From / Vintage To (integer inputs)
    │       │
    │       ├── [Vintage From > Vintage To]
    │       │       └── Inline error: "Start year must be ≤ end year"
    │       │
    │       └── [Apply Filters]
    │               │
    │               ▼
    │           GET /wines?varietal=…&region=…&vintage_from=…
    │               │
    │               ▼
    │           Filter chips appear below search bar
    │           Match count updates: "X wines found"
    │
    ├── [Search + Filters active simultaneously]
    │       │  All params combined in single GET /wines request (AND logic)
    │       ▼
    │   Match count reflects combined result
    │
    └── [User taps "Clear all filters" button]
            │  Visible only when any filter/search active
            ▼
        GET /wines (defaults: status=active, sort=name, asc)
        All filter chips removed; match count hidden
        Full list restored
```

**Steps:**
1. Search bar is always visible at the top of the list — never hidden behind a menu (Sofia's tablet tableside use case, JRN-02.2).
2. As user types, results update after 300ms debounce. No page reload (US-2.1 AC).
3. "Filters" button is a secondary action next to the search bar. Opens the filter panel (SCR-05) as a bottom sheet on mobile or an inline panel on desktop.
4. Applied filters appear as **dismissible chips** below the search bar: e.g., `Varietal: Pinot Noir ×`, `Region: Burgundy ×`.
5. Each chip can be individually dismissed, or all cleared via the "Clear all" button (US-2.4).
6. The "Clear all" button is **hidden when no filters or search are active** (US-2.4 AC).
7. Match count ("X wines found") displays whenever any filter or search term is active.
8. When no results match: filtered empty state with message distinguishing "no wines in cellar" vs. "no wines match filters" (US-1.3 AC).

**Key UX Decisions:**
- Filter panel is a **bottom sheet** on mobile (one thumb reach), **inline collapsible panel** on desktop. Never a separate page — eliminates navigation tax (CP-04).
- Vintage range uses two separate integer inputs (`From` / `To`), not a slider — allows fast keyboard entry for Marcus's pre-purchase check (JRN-01.3).
- Filter chips remain visible after the filter panel is closed, so users always know what's active.

---

### FLW-04: Bottle Count Update (Inline)

**User Stories:** US-3.1, US-3.2, US-3.4
**Personas:** Sofia Reyes (primary), Marcus Webb
**Trigger:** User taps `+` or `−` on a list row or detail page
**Exit:** Count updated in place; zero-bottle badge shown if applicable

```
[List Row or Detail Page]
    │
    ├── [Tap "+"]
    │       │  Optimistic: count +1 in UI immediately
    │       ▼
    │   PATCH /wines/{id}/bottle-count { action: "increment" }
    │       │
    │       ├── 200 OK ──▶ Count confirmed; no visual change
    │       │               (already showing new value)
    │       │
    │       └── Error ──▶ Revert to previous count
    │                      Toast: "Could not update count"
    │
    └── [Tap "−"]
            │  Optimistic: count -1 in UI immediately
            │
            ├── [Count was 0] ──▶ "−" button disabled; no action
            │                      Tooltip: "Cannot go below zero"
            │
            ▼
        PATCH /wines/{id}/bottle-count { action: "decrement" }
            │
            ├── 200 OK, count > 0 ──▶ Count updated; no further action
            │
            ├── 200 OK, zero_bottle_flag: true
            │       │
            │       ▼
            │   Row applies "EMPTY" badge (amber/high-contrast)
            │   Non-blocking prompt appears (banner or snackbar):
            │   "No bottles left. Mark as Consumed or Removed?"
            │   [Mark Consumed]  [Mark Removed]  [Dismiss]
            │
            └── 422 COUNT_BELOW_ZERO ──▶ Revert; "−" disabled
```

**Steps:**
1. `+` and `−` buttons are visible on **every list row** and on the detail page (US-1.4, US-3.1, US-3.2 AC).
2. Tapping either button triggers an optimistic UI update before the server responds.
3. The `−` button is **visually disabled** (greyed, no pointer) when `bottle_count = 0` (US-3.2 AC).
4. On decrement to zero: the row immediately displays the **"EMPTY" badge** — bold amber background, white text — without a page reload (US-3.4, CP-05).
5. A non-blocking snackbar/bottom banner appears: *"No bottles left. Mark as Consumed or Removed?"* with two quick-action links and a Dismiss option (US-3.2 AC).
6. Server errors revert the optimistic update and show a brief error toast.

---
---

### FLW-05: Open Bottle & Capture Tasting Note

**User Stories:** US-5.1, US-5.2, US-3.2, US-6.1
**Personas:** Marcus Webb (primary)
**Trigger:** Marcus opens a bottle; navigates to wine detail to log it
**Exit:** Note and rating saved; wine marked consumed; accessible in history

```
[Inventory List View — SCR-01]
    │
    │  Search for wine (JRN-01.2)
    │  Tap wine row
    │
    ▼
[Wine Detail Page — SCR-03]
    │
    ├── [Tap "−" button]  ── Decrement count (FLW-04)
    │       │
    │       └── If count → 0: "EMPTY" badge + zero-bottle prompt shown
    │
    ├── [Tap tasting notes area]
    │       │
    │       ▼
    │   Inline textarea expands (no navigation)
    │   User types note; no character limit
    │   Autosave on blur OR explicit "Save note" tap
    │       │
    │       ▼
    │   PATCH /wines/{id} { tasting_notes: "..." }
    │   Note displayed inline on detail page
    │
    ├── [Tap star rating control]
    │       │
    │       ▼
    │   Star selector (1–5 visual; maps to 1–100 API scale)
    │   Tap to set; tap same star to deselect/clear
    │       │
    │       ▼
    │   PATCH /wines/{id} { rating: <value> }
    │   Stars filled; numeric equivalent shown (e.g. "★★★★ 80/100")
    │
    └── [Tap "Mark as Consumed"]
            │
            ▼
        PATCH /wines/{id}/status { status: "consumed" }
            │
            ├── 200 OK ──▶ Wine removed from active list
            │               Status banner: "CONSUMED" (shown if user revisits detail)
            │               Toast: "Moved to history. Your note and rating are saved."
            │               [View in History] link in toast
            │
            └── 422 (wine not active) ──▶ Error toast; status badge refreshed
```

**Steps:**
1. User navigates to Wine Detail Page via search or list tap.
2. Decrements bottle count via the `−` button (inline, no navigation needed).
3. Taps the tasting notes area — an **inline textarea expands in place** below the field label. No modal, no page navigation (CP-04 / JRN-01.2 decision point).
4. User types their note. Textarea autosaves on blur (losing focus). There is also an explicit "Save" button for clarity.
5. User taps the star rating control — 5-star visual UI maps to the 1–100 API scale. Stars fill as user taps. A secondary label shows the numeric equivalent.
6. User taps "Mark as Consumed". Toast confirms: *"Moved to history. Your note and rating are saved."* with a [View in History] shortcut (JRN-01.2 delight moment).

---

### FLW-06: Mark Consumed / Removed / Revert

**User Stories:** US-6.1, US-6.2, US-6.3
**Personas:** Marcus Webb, Sofia Reyes
**Trigger:** Wine is finished, sold, gifted, or broken; or a status change was made in error
**Exit:** Wine removed from active list; accessible in history; OR wine restored to active

```
[Wine Detail Page OR List Row context menu — SCR-03 / SCR-01]
    │
    ├── [Status is "active"]
    │       │
    │       ├── Tap "Mark as Consumed"
    │       │       └── PATCH /wines/{id}/status { status: "consumed" }
    │       │               200 ──▶ Wine hidden from active list
    │       │                        Toast: "Moved to history"
    │       │
    │       └── Tap "Mark as Removed"
    │               └── PATCH /wines/{id}/status { status: "removed" }
    │                       200 ──▶ Wine hidden from active list
    │                                Toast: "Marked as removed"
    │
    └── [Status is "consumed" or "removed" — viewed from History]
            │
            └── Tap "Revert to Active"
                    └── PATCH /wines/{id}/status { status: "active" }
                            │
                            ├── 200 ──▶ Wine reappears in active list
                            │           Toast: "Restored to active inventory"
                            │
                            └── 422 (already active) ──▶ Error toast;
                                                          status badge refreshed
```

**Steps:**
1. From the Wine Detail Page, the **status section** shows the current status badge and available transition actions.
2. Active wines show two buttons: "Mark as Consumed" and "Mark as Removed".
3. Consumed/removed wines show one button: "Revert to Active".
4. Status changes are **not reversible between consumed ↔ removed** directly — the UI only shows valid transitions. If a user is in consumed state, they only see "Revert to Active" — they cannot jump to "removed" without reverting first. This matches the transition matrix in FRD F06.
5. From the List View, these actions are accessible via a **row action menu** (swipe on mobile, right-click or kebab `⋮` on desktop) to keep the list row uncluttered.

---

### FLW-07: Browse History & Retrieve Tasting Note

**User Stories:** US-6.4, US-4.1, US-5.4
**Personas:** Priya Nair (primary), Sofia Reyes
**Trigger:** User wants to find a consumed wine to check their rating/note, or review reorder needs
**Exit:** User views the full detail page of a consumed wine including note and rating

```
[Inventory List View — SCR-01]
    │
    │  Tap "History" tab (top of screen, next to "Active")
    │
    ▼
[History View — SCR-06]
    │  GET /wines?status=consumed (default) or status=all
    │  Same list layout; "CONSUMED" / "REMOVED" badge per row
    │  Sort and pagination controls same as active list
    │
    ├── [User types in search bar]
    │       │  Search covers consumed+removed wines in this view
    │       ▼
    │   GET /wines?status=consumed&q={term}
    │   Results update; match count shown
    │
    ├── [User applies varietal filter]
    │       │
    │       ▼
    │   Filtered history results (CP-03: search spans all inventory)
    │
    └── [Tap wine row]
            │
            ▼
        [Wine Detail Page — SCR-03]
            │  Status banner at top: "CONSUMED" or "REMOVED"
            │  All fields displayed: name, producer, vintage, etc.
            │  Tasting notes displayed (preserved after status change — US-5.4)
            │  Star rating displayed
            │  "Revert to Active" button visible
            │
            └── User reads note and rating ──▶ Makes re-buy decision (JRN-03.2)
```

**Steps:**
1. "History" tab is always visible at the top of the main screen — one tap from the active list (CP-06 / US-6.4 AC).
2. History view defaults to showing consumed wines. A secondary toggle shows "Removed" or "All".
3. Search and filter work identically to the active list, but scoped to history status (CP-03).
4. Each history row shows: name, producer, vintage, varietal, bottle count at time of status change, and a status badge (Consumed / Removed) in muted tones.
5. Tapping a row opens the Wine Detail Page. A **prominent status banner** at the top reads "CONSUMED" or "REMOVED" in appropriate color.
6. Tasting notes and rating are displayed prominently — preserved even after status change (US-5.4).
7. The "Revert to Active" button is visible for correction scenarios (US-6.3).

---
---

## Screen Designs

---

### SCR-01: Inventory List View

**Purpose:** Primary screen — browsable, sortable, searchable list of all active wines. This is the screen users return to repeatedly and must feel fast and clear.
**User Stories:** US-1.1, US-1.2, US-1.3, US-1.4, US-2.1, US-2.2, US-2.3, US-2.4, US-3.1, US-3.2, US-3.4, US-6.4

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🍷 WineInventory                           [User Menu ▾]   │
├─────────────────────────────────────────────────────────────┤
│  [ Active ]  [ History ]                  [ + Add Wine ]    │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search wines...                        [ Filters  ▾]   │
│  ─────────────────────────────────────────────────────────  │
│  Varietal: Pinot Noir ×   Region: Burgundy ×  [Clear all]  │
│  14 wines found                                             │
│  ─────────────────────────────────────────────────────────  │
│  Sort: Name ▾  Direction: A→Z ▾                            │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Gevrey-Chambertin 1er Cru           Pinot Noir     │   │
│  │  Rossignol-Trapet · 2019             Burgundy       │   │
│  │                          [−]  [ 3 ]  [+]  [⋮]      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Chambolle-Musigny                   Pinot Noir     │   │
│  │  Roumier · 2018                      Burgundy       │   │
│  │                          [−]  [ 1 ]  [+]  [⋮]      │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Gevrey-Chambertin                   Pinot Noir  ░░░│   │
│  │  Rousseau · 2017                     Burgundy    ░░░│   │
│  │              ░░ EMPTY ░░  [−]  [ 0 ]  [+]  [⋮]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ ← Prev ]   Page 1 of 3   [ Next → ]                     │
└─────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Wine name | Row — top line, large, bold |
| Primary | Bottle count + `−`/`+` controls | Row — right side, always visible |
| Secondary | Producer · Vintage | Row — second line, muted |
| Secondary | Varietal / Region | Row — top line right, muted label |
| Tertiary | Date added, status | Accessible via detail page only |
| Critical signal | "EMPTY" badge (amber) | Row — replaces count area when count=0 |

#### Row Design — States

| Row State | Visual Treatment | Notes |
|-----------|-----------------|-------|
| Default (count > 0) | White background; full opacity | Normal |
| Zero-bottle (EMPTY) | Light amber tint on row; amber "EMPTY" badge; `−` disabled | CP-05; US-3.4 |
| Hover / focus (desktop) | Subtle background highlight | Keyboard navigable |
| Loading (optimistic) | Count field shows spinner briefly | Reverts on error |

#### Interactive Elements

| Element | Type | Behavior |
|---------|------|----------|
| `+ Add Wine` button | Primary CTA — top right | Opens Add Wine Form (SCR-02) |
| `Active` / `History` tabs | Tab navigation | Switches between active list and history view (SCR-06) |
| Search bar | Text input, persistent | Debounced 300ms; clears on `×`; US-2.1 |
| `Filters ▾` button | Secondary button | Opens filter panel (SCR-05) as bottom sheet / inline |
| Filter chips | Dismissible tags | Each `×` removes that filter; US-2.4 |
| `Clear all` link | Text action | Removes all filters + search; hidden when none active |
| Sort / Direction dropdowns | Inline selects | Triggers re-fetch immediately; US-1.2 |
| `−` button (per row) | Icon button (44px) | Decrement; disabled at 0; US-3.2 |
| `+` button (per row) | Icon button (44px) | Increment; US-3.1 |
| Count display | Non-editable inline field | Shows current count; tap to go to detail for exact-set |
| `⋮` row menu | Kebab menu | Reveals: Edit, Mark Consumed, Mark Removed, Delete |
| Row tap (name area) | Navigation | Opens Wine Detail Page (SCR-03) |
| Pagination controls | Button group | Previous / page indicator / Next |

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default (wines present) | Sorted list rows | N/A |
| Loading initial | Skeleton rows (3–5 placeholder blocks) | List animates in on load |
| Loading sort/filter change | Brief shimmer overlay on list area | Preserves scroll position |
| Empty (no wines) | Empty state illustration + CTA — SCR-08 | "Your cellar is empty. Add your first wine." |
| Filtered empty | Empty state with filter context | "No wines match your search. Try different terms or clear filters." |
| Optimistic count update | Count changes instantly; subtle pulse | Error toast + revert if server fails |
| Error loading list | Error banner with retry button | "Couldn't load your wines. Tap to retry." |

---
---

### SCR-02: Add Wine Form

**Purpose:** Fast wine entry with name-only as the minimum. Optional fields collapse below the fold so first-time users are not intimidated and power users can fill in everything.
**User Stories:** US-0.1, US-0.2

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Add Wine                             │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Wine Name *                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Château Margaux                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ⚠ Name is required   (shown only on validation failure)   │
│                                                             │
│  ▾ Add more details                                         │
│  ──────────────────────────────────────────────────────    │
│  (collapsed by default — tap to expand)                     │
│                                                             │
│  ═══ [Expanded optional fields] ══════════════════════════  │
│                                                             │
│  Producer                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Château Margaux                                     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Vintage          Bottle Count                              │
│  ┌───────────┐    ┌───────────┐                            │
│  │ 2019      │    │ 6         │                            │
│  └───────────┘    └───────────┘                            │
│  ⚠ 1800–2031     ⚠ 1–9999                                  │
│                                                             │
│  Varietal                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Cabernet Sauvignon                                  │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Region                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Bordeaux                                            │   │
│  └─────────────────────────────────────────────────────┘   │
│  ═══ [End optional fields] ═══════════════════════════════  │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [     Cancel     ]      [     Save Wine ▶    ]             │
└─────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Wine Name field (required) | Top of form; auto-focused on open |
| Primary | Save Wine CTA | Bottom sticky button bar; always visible |
| Secondary | Optional fields (collapsed) | Expandable section below name |
| Tertiary | Cancel | Secondary button, bottom left |

#### Form Fields

| Field | Type | Required | Validation | Default |
|-------|------|----------|-----------|---------|
| Wine Name | Text input | Yes | Non-empty, non-whitespace; max 255 chars | — |
| Producer | Text input | No | Max 255 chars | — |
| Vintage | Number input | No | Integer 1800–(current year+5) | — |
| Bottle Count | Number input | No | Integer 1–9999 | 1 |
| Varietal | Text input | No | Max 255 chars | — |
| Region | Text input | No | Max 255 chars | — |

#### Validation UX

- Validation fires **on blur** (when user leaves a field), not on every keystroke — avoids jarring red states mid-entry.
- Required field (`name`) also validates on **submit attempt**.
- Errors appear **inline below the field** in amber/red text, never as alert dialogs.
- Previous values are **preserved** on all validation failures — the user corrects in place.
- The "Save Wine" button remains **tappable** even with validation errors (submit triggers validation, doesn't silently block).

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default | Name field focused; optional section collapsed | Keyboard open on mobile |
| Optional fields expanded | Section reveals 5 additional fields | Smooth expand animation |
| Validation error (name) | Red border on name field; inline error text | "Name is required" |
| Validation error (vintage) | Red border; inline error | "Vintage must be between 1800 and [year]" |
| Validation error (bottle count) | Red border; inline error | "Bottle count must be between 1 and 9999" |
| Submitting | "Save Wine" button shows spinner; disabled | "Saving…" |
| Success | Form closes; navigate to Wine Detail | Toast: "[Name] added to your cellar" |
| Server error | Error banner at top of form | "Couldn't save. Please try again." |

#### Mobile Considerations

- On mobile, the optional fields section opens **below the fold** — user must scroll to see them. Name and Save button always visible above the keyboard.
- Vintage and Bottle Count use `inputmode="numeric"` to trigger the numeric keyboard.
- "Save Wine" button is **sticky to the bottom** of the viewport, accessible without scrolling.
- The "Add more details ▾" toggle has a minimum 44px tap target height.

---
---

### SCR-03: Wine Detail Page

**Purpose:** The single place to see everything about a wine and perform all mutations — bottle count, status change, inline edit, tasting note, rating, and delete.
**User Stories:** US-4.1, US-4.2, US-4.3, US-5.1, US-5.2, US-5.3, US-5.4, US-6.1, US-6.2, US-6.3, US-3.1, US-3.2, US-3.3

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back to Cellar                    [Edit full record] [⋮] │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌── STATUS BANNER (shown only if not active) ───────────┐ │
│  │  🔴 CONSUMED  ·  Last updated: 14 May 2026            │ │
│  │  [Revert to Active]                                   │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│  ── RECORD HEADER ──────────────────────────────────────── │
│  Gevrey-Chambertin 1er Cru               [Quick-edit ✎]   │
│  Rossignol-Trapet                        Producer          │
│  2019 · Pinot Noir · Burgundy                              │
│                                                             │
│  ── BOTTLE COUNT ───────────────────────────────────────── │
│  Bottles in Cellar                                         │
│       [−]    [ 3 ]    [+]                                  │
│       Set exact: [___] [Apply]                             │
│  (Zero-bottle: "EMPTY" badge replaces count when = 0)      │
│                                                             │
│  ── STATUS & ACTIONS ───────────────────────────────────── │
│  Status:  ● Active                                         │
│  [Mark as Consumed]    [Mark as Removed]                   │
│                                                             │
│  ── TASTING NOTES ──────────────────────────────────────── │
│  Tasting Notes                        [Clear notes ×]      │
│  ┌────────────────────────────────────────────────────┐    │
│  │ Tap to add tasting notes…                          │    │
│  │ (textarea expands inline on tap; autosaves on blur)│    │
│  └────────────────────────────────────────────────────┘    │
│                                                             │
│  ── RATING ─────────────────────────────────────────────── │
│  Your Rating                          [Clear rating ×]     │
│  ★ ★ ★ ★ ☆   80/100                                       │
│  (tap a star to rate; tap filled star to lower)            │
│                                                             │
│  ── METADATA ───────────────────────────────────────────── │
│  Added: 1 March 2024                                       │
│  Last Updated: 14 May 2026                                 │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [🗑 Delete Wine]   (danger zone — bottom of page)         │
└─────────────────────────────────────────────────────────────┘
```

#### Information Hierarchy

| Priority | Content | Placement |
|----------|---------|-----------|
| Primary | Wine name | Large heading — record header |
| Primary | Bottle count with `−`/`+` controls | Prominent mid-card section |
| Primary | Status banner | Top of page (only when consumed/removed) |
| Secondary | Producer, vintage, varietal, region | Record header, sub-line |
| Secondary | Tasting notes | Dedicated section, expandable textarea |
| Secondary | Rating | Star control, always visible |
| Tertiary | Date added / last updated | Metadata section, bottom of main content |
| Destructive | Delete button | Bottom of page — visually separated |

#### Quick-Edit UX (US-4.2)

- Editable fields: name, producer, vintage, varietal, region.
- Each field has a small **edit pencil icon (✎)** appearing on hover (desktop) or always visible (mobile).
- Tapping the field OR the pencil transitions it to an **inline text/number input**.
- Confirmation: pressing **Enter** or tapping anywhere outside the field saves.
- Cancel: pressing **Escape** reverts to the previous value without saving.
- On validation failure: inline error below the field; previous value restored on Escape.
- Send: `PATCH /wines/{id}` with only the changed field.

#### Bottle Count Exact-Set (US-3.3)

- A small text input labeled "Set exact:" sits below the `+`/`−` controls.
- Accepts integers 0–9999. Shows error on invalid values.
- Requires an explicit "Apply" tap (not autosave) — prevents accidental changes.

#### Rating Control (US-5.2)

- 5-star visual rating (each star = 20 points on the 1–100 scale).
- A numeric label shows the equivalent score (e.g., ★★★★☆ = 80/100).
- Tapping a star that is already filled **lowers** the rating to that star's value.
- "Clear rating ×" link sets rating to null (US-5.3).
- Rating is stored on `PATCH /wines/{id}` with `{ "rating": <value> }`.

#### Tasting Notes (US-5.1, US-5.3)

- Default state: shows placeholder text "Tap to add tasting notes…" in a muted style.
- Tapping opens the field as an **inline growing textarea** — no navigation, no modal.
- Saves on blur (autosave) and via an explicit "Save note" button that appears inside the expanded textarea.
- "Clear notes ×" link visible when notes are present; sets notes to null (US-5.3).
- Notes area remains **fully editable regardless of wine status** (active, consumed, removed — US-5.3 AC).

#### Status Section (US-6.1, US-6.2, US-6.3)

| Wine Status | Status badge | Actions shown |
|-------------|-------------|---------------|
| Active | ● Active (green) | [Mark as Consumed] [Mark as Removed] |
| Consumed | 🔴 Consumed (red banner top) | [Revert to Active] |
| Removed | 🟡 Removed (amber banner top) | [Revert to Active] |

Status transitions are validated client-side to only show valid next states (no direct consumed↔removed).

#### States

| State | Appearance | User Feedback |
|-------|------------|---------------|
| Default (active wine) | No status banner; all action buttons visible | N/A |
| Consumed wine | Red "CONSUMED" banner at top | Banner text + Revert button |
| Removed wine | Amber "REMOVED" banner at top | Banner text + Revert button |
| Zero-bottle active | "EMPTY" badge on count section; zero-bottle prompt | Snackbar: "No bottles left..." |
| Field being quick-edited | Field shows text input; other fields dimmed slightly | Focus ring on input |
| Note being edited | Textarea expanded; "Save note" button visible | Autosave note on blur |
| Loading (page load) | Skeleton layout matching sections | Smooth fade in on data ready |
| Not found (404) | Error page | "Wine not found" + back button |
| Access denied (403) | Error page | "Access denied" + back button |
| Invalid wine ID (400) | Error page | "Invalid wine ID" + back button |

#### Delete Action (US-0.4)

- Delete button is at the **bottom of the page**, visually separated in a danger zone.
- Red/danger color to communicate destructive intent.
- Tapping opens the confirmation dialog (SCR-07).

---
---

### SCR-04: Edit Wine Form (Full Edit)

**Purpose:** Full-record edit accessible from the Wine Detail Page's "Edit full record" link. Identical field set to Add Wine, but pre-populated with current values.
**User Stories:** US-0.3

#### Layout

Same layout structure as SCR-02 (Add Wine Form), but:
- Title bar reads "Edit Wine" instead of "Add Wine"
- All fields pre-populated with existing values
- "Save Changes" button instead of "Save Wine"
- No "cancel" goes back without saving (no auto-save)
- `bottle_count` on edit accepts 0–9999 (vs. 1–9999 on create — US-0.3 AC)
- `status` field is **not present** — status is changed via SCR-03 status section, not the edit form

```
┌─────────────────────────────────────────────────────────────┐
│  ← Back                Edit Wine                            │
├─────────────────────────────────────────────────────────────┤
│  Wine Name *                                                │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Gevrey-Chambertin 1er Cru           (pre-filled)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Producer                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Rossignol-Trapet                                    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Vintage          Bottle Count                              │
│  ┌───────────┐    ┌───────────┐                            │
│  │ 2019      │    │ 3         │  ← 0–9999 on edit          │
│  └───────────┘    └───────────┘                            │
│                                                             │
│  Varietal                   Region                         │
│  ┌──────────────────┐  ┌──────────────────────────────┐   │
│  │ Pinot Noir       │  │ Burgundy                     │   │
│  └──────────────────┘  └──────────────────────────────┘   │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [     Cancel     ]      [    Save Changes ▶   ]            │
└─────────────────────────────────────────────────────────────┘
```

**Differences from SCR-02 (Add Wine):**
- Fields are always expanded (no "Add more details" toggle since the record already exists).
- Bottle count minimum is **0** (not 1) on edit.
- `status` cannot be changed here — directs user to the detail page status section if attempted.
- On success: returns to Wine Detail Page with `date_updated` refreshed.

---

### SCR-05: Filter Panel

**Purpose:** Structured filters for varietal, region, producer, and vintage range. Applied on top of free-text search (AND logic).
**User Stories:** US-2.2, US-2.3

#### Layout (bottom sheet on mobile, inline panel on desktop)

```
┌─────────────────────────────────────────────────────────────┐
│  ── Filters ────────────────────────────────── [✕ Close]   │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  Varietal                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Pinot Noir                                  (exact) │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Region                                                     │
│  ┌─────────────────────────────────────────────────────┐   │
│  │ Burgundy                               (partial)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Producer                                                   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │                                        (partial)    │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  Vintage Range                                              │
│  From ┌────────┐   To  ┌────────┐                          │
│       │ 2015   │        │ 2022   │                          │
│       └────────┘        └────────┘                          │
│  ⚠ Start year must be ≤ end year (shown on error only)     │
│                                                             │
├─────────────────────────────────────────────────────────────┤
│  [   Reset filters   ]     [   Apply Filters (14)   ]       │
└─────────────────────────────────────────────────────────────┘
```

**Filter Panel Behaviors:**
- **Live preview**: The "Apply Filters" button shows a match count preview as the user types (e.g., "Apply Filters (14)") — no need to apply before knowing results exist.
- **Varietal** uses exact match (case-insensitive). On mobile, it could be a dropdown of known varietals from the user's collection.
- **Region** and **Producer** use partial match — typing "Burg" matches "Burgundy".
- **Vintage Range**: Two number inputs. If only one is filled, it acts as a lower or upper bound. If both are filled and From > To, inline error appears and Apply is blocked.
- **Reset filters**: Clears all filter inputs in this panel (does not clear the search bar).
- **Apply Filters**: Closes the panel; filter chips appear in the list view; results update.

---

### SCR-06: History View

**Purpose:** Browse wines marked as consumed or removed. Same list layout as active inventory, with status badges. Entry point for tasting note retrieval (JRN-03.2).
**User Stories:** US-6.4, US-5.4

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  🍷 WineInventory                           [User Menu ▾]   │
├─────────────────────────────────────────────────────────────┤
│  [ Active ]  [● History ]                 [ + Add Wine ]    │
├─────────────────────────────────────────────────────────────┤
│  🔍 Search history...                      [ Filters  ▾]   │
│  ─────────────────────────────────────────────────────────  │
│  Show: [Consumed ▾]  /  [Removed]  /  [All]                │
│  Sort: Date Added ▾  Direction: Newest ▾                    │
├─────────────────────────────────────────────────────────────┤
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Barolo Riserva                     Nebbiolo        │   │
│  │  Giacomo Conterno · 2015            Piedmont        │   │
│  │  ● CONSUMED  ·  Finished: 12 May 2026      [⋮]     │   │
│  └─────────────────────────────────────────────────────┘   │
│  ┌─────────────────────────────────────────────────────┐   │
│  │  Château Lynch-Bages                Cab. Sauvignon  │   │
│  │  Pauillac · 2016                    Bordeaux        │   │
│  │  ■ REMOVED  ·  Removed: 3 Apr 2026         [⋮]     │   │
│  └─────────────────────────────────────────────────────┘   │
│                                                             │
│  [ ← Prev ]   Page 1 of 2   [ Next → ]                     │
└─────────────────────────────────────────────────────────────┘
```

**History View Differences from Active List:**
- Status badge per row: `● CONSUMED` (burgundy/dark red) or `■ REMOVED` (amber).
- Date shown is the status-change date, not bottle count controls (no inline `+`/`−`).
- A "Show" toggle above the list filters by `consumed`, `removed`, or `all`.
- Row `⋮` menu offers: View Detail, Revert to Active.
- Search spans all history wines (CP-03 — not scoped to active only).
- Filters (varietal, region, vintage) work identically to the active list.

---

### SCR-07: Delete Confirmation Dialog

**Purpose:** Destructive action guard — prevents accidental permanent deletion.
**User Stories:** US-0.4

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│                                                             │
│                ⚠️  Delete Wine?                             │
│                                                             │
│  "Gevrey-Chambertin 1er Cru"                               │
│                                                             │
│  This will permanently delete this wine and all            │
│  its tasting notes and ratings.                            │
│  This cannot be undone.                                    │
│                                                             │
│  [       Cancel       ]   [  Delete permanently  ]         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Delete Dialog Behaviors:**
- Wine name displayed in quotes to confirm which wine is being deleted.
- "Delete permanently" button is styled in destructive red.
- "Cancel" is the **visually dominant** button — larger or left-positioned — to make cancel the path of least resistance.
- On confirm: `DELETE /wines/{id}`. On success: wine removed from list, toast: *"[Name] deleted."*
- If the user is on the detail page, they are navigated back to the list.
- Attempting to navigate to the deleted wine's URL returns a "Wine not found" error state.

---

### SCR-08: Empty State

**Purpose:** First-use orientation and guidance when no wines are in the inventory.
**User Stories:** US-1.3

#### Layout

```
┌─────────────────────────────────────────────────────────────┐
│  [ Active ]  [ History ]                  [ + Add Wine ]    │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│                                                             │
│               🍷  (illustration — wine bottle)              │
│                                                             │
│            Your cellar is empty.                           │
│                                                             │
│       Start building your collection by logging             │
│       your first wine — it takes under 20 seconds.         │
│                                                             │
│           [ + Add your first wine ]                        │
│                                                             │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

**Empty State Variants:**

| Trigger | Illustration | Headline | Sub-text | CTA |
|---------|-------------|----------|---------|-----|
| No wines at all (new user) | Wine bottle icon | "Your cellar is empty." | "Add your first wine…" | `+ Add your first wine` |
| Filters produce no results | Magnifying glass | "No wines match your search." | "Try different terms or clear your filters." | `Clear all filters` |
| History tab, no consumed wines | Clock icon | "No wines in history yet." | "Wines you mark as consumed or removed will appear here." | `Back to active cellar` |

---
---

## Interaction Patterns

---

### PAT-01: Optimistic Bottle Count Update

**When to use:** Every `+` or `−` tap on any bottle count control (list row or detail page).
**User Stories:** US-3.1, US-3.2

**Behavior:**
1. User taps `+` or `−`.
2. UI immediately updates the displayed count (optimistic — no wait for server).
3. `PATCH /wines/{id}/bottle-count` request fires in the background.
4. **Success:** Server confirms; UI count stays as updated. `date_updated` refreshed server-side.
5. **Error (network/server):** UI reverts to previous count. Error toast appears: *"Couldn't update count. Please try again."*
6. **Error (422 — count at 0):** `−` button was already disabled, so this should not be reachable via the button. If the response returns 422 (race condition), revert and disable the button.

**Design Notes:**
- The `−` button must be **visually disabled** (opacity reduced, no pointer cursor) when count = 0 — prevents the 422 scenario entirely for single users.
- On tablets (Sofia's device), the `+` and `−` buttons must be **≥ 44px × 44px** tap targets.
- Show a very brief animation on the count number (scale pulse) to confirm the action registered.

---

### PAT-02: Inline Quick-Edit Field

**When to use:** Editable fields on the Wine Detail Page (name, producer, vintage, varietal, region).
**User Stories:** US-4.2

**Behavior:**
1. Display mode: Field shown as read-only text with a subtle `✎` edit icon.
2. User taps the field text or the `✎` icon.
3. Field transitions to an `<input>` or `<textarea>` with the current value pre-filled. Focus placed at end of text.
4. **Save triggers:**
   - Press **Enter** (single-line fields)
   - Tap/click **outside the field** (blur)
   - Tap an explicit **"Save" mini-button** appearing adjacent (optional for clarity)
5. **Cancel trigger:** Press **Escape**. Field reverts to previous value; no API call.
6. **On save:** `PATCH /wines/{id}` sent with only the changed field. Field returns to display mode showing updated value.
7. **On validation failure:** Inline error appears below the field. Previous value NOT restored until user presses Escape.
8. **On server error:** Inline error with retry prompt. Previous display value preserved.

**Design Notes:**
- Never transition more than one field into edit mode simultaneously.
- Fields being edited should have a visible focus ring (accessibility).
- On mobile, the keyboard should not obscure the field — scroll the page to keep the active field above the keyboard.

---

### PAT-03: Inline Textarea Expansion (Tasting Notes)

**When to use:** Tasting notes area on the Wine Detail Page.
**User Stories:** US-5.1, US-5.3

**Behavior:**
1. Default state: a single-line preview area with placeholder text *"Tap to add tasting notes…"* or the first ~100 chars of existing notes.
2. Tapping expands to a **full multi-line textarea** in place — no navigation.
3. No character limit enforced (no counter shown).
4. **Autosave on blur:** When user taps away from the textarea, `PATCH /wines/{id}` fires with the updated `tasting_notes`.
5. An explicit **"Save note"** button appears inside the expanded textarea for users who want explicit confirmation.
6. **Loading state while saving:** The textarea shows a subtle save indicator (e.g., spinning dots or "Saving…" text). Clears on success.
7. Sending `tasting_notes: ""` (empty string) is treated as null by the server — notes cleared.
8. "Clear notes ×" link sends `PATCH /wines/{id}` with `{ tasting_notes: null }`.

---

### PAT-04: Star Rating Control

**When to use:** Rating control on the Wine Detail Page.
**User Stories:** US-5.2, US-5.3

**Behavior:**
1. 5-star visual display. Each star represents 20 points on the 1–100 scale.
2. Current rating shown as filled stars + numeric label: *"★★★★☆  80/100"*.
3. **Setting a rating:** User taps a star. That star and all stars to its left fill. Rating saves immediately (`PATCH /wines/{id}` with `{ rating: <value> }`).
4. **Lowering a rating:** User taps a filled star to set the rating to that star's value.
5. **Clearing:** User taps "Clear rating ×" link (only visible when rating is set). Sends `{ rating: null }`.
6. **Hover state (desktop):** Stars preview the would-be rating as the cursor moves over them.
7. **Save confirmation:** Brief star animation on save (pulse effect). No separate toast unless there's an error.

**Scale mapping:**
| Stars | API Rating |
|-------|-----------|
| ★☆☆☆☆ | 20 |
| ★★☆☆☆ | 40 |
| ★★★☆☆ | 60 |
| ★★★★☆ | 80 |
| ★★★★★ | 100 |

---

### PAT-05: Filter Chip System

**When to use:** When any structured filter is active on the Inventory List or History View.
**User Stories:** US-2.2, US-2.3, US-2.4

**Behavior:**
1. When a filter is applied from the Filter Panel (SCR-05), a **dismissible chip** appears below the search bar.
2. Chip format: `[Label: Value ×]` — e.g., `Varietal: Pinot Noir ×`.
3. Tapping `×` on a chip removes that single filter; list re-fetches automatically.
4. Multiple chips can be active simultaneously (AND logic).
5. "Clear all" text button appears to the right of the last chip — removes all chips and search term at once.
6. "Clear all" is **hidden** when no filters or search are active (US-2.4 AC).
7. The match count ("X wines found") updates whenever any chip is added or removed.

---

### PAT-06: Toast Notification System

**When to use:** Confirming mutations — add, update, delete, status change.

**Behavior:**
- Toasts appear at the **bottom of the screen** (above any fixed footer, safe from thumb zone).
- Auto-dismiss after **3 seconds** (non-destructive actions).
- Destructive actions (delete) show a toast with **no undo** — delete is permanent.
- One toast at a time. New toast replaces any currently showing.
- Toasts are announced to screen readers via `role="status"` / `aria-live="polite"`.

**Toast Templates:**
| Action | Message | Variant |
|--------|---------|---------|
| Wine added | "[Name] added to your cellar." | Success |
| Wine updated | "Changes saved." | Success |
| Wine deleted | "[Name] deleted." | Neutral |
| Status → consumed | "Moved to history. Note and rating saved." | Success |
| Status → removed | "Marked as removed." | Neutral |
| Status reverted | "Restored to active inventory." | Success |
| Count update failed | "Couldn't update count. Please try again." | Error |
| Save failed (generic) | "Couldn't save. Please try again." | Error |

---

### PAT-07: Zero-Bottle Prompt (Non-blocking)

**When to use:** When a decrement brings a wine's bottle count to zero.
**User Stories:** US-3.2

**Behavior:**
1. Snackbar/bottom banner appears: *"No bottles left. Mark as Consumed or Removed?"*
2. Two quick-action buttons in the banner: `[Mark Consumed]` and `[Mark Removed]`.
3. `[Dismiss]` or swiping the banner away closes it without action.
4. The wine remains `active` with `bottle_count = 0` until the user explicitly transitions it.
5. The "EMPTY" badge on the row/detail page persists regardless of whether the prompt is dismissed.
6. The prompt is shown only **once per decrement-to-zero event** — not persistently on every page view.

---
---

## Responsive Considerations

The app is **web-first, mobile-responsive** (no native app in v1 — PRD §4). Three primary form factors must be supported:

---

### Desktop (> 1024px)

**Primary persona:** Marcus Webb (pre-purchase inventory check at desk — JRN-01.3).

| Component | Desktop Treatment |
|-----------|------------------|
| App layout | Two-column option: persistent left nav/sidebar (logo, Active/History tabs) + main content area |
| Inventory list | Full table-like rows; more data visible per row (can show Region column) |
| Add Wine form | Centered modal or slide-over panel (600px max-width); optional fields always expanded (desktop users expect full forms) |
| Wine Detail Page | Two-column layout: left = record info + quick-edit; right = tasting notes + rating |
| Filter panel | Inline collapsible panel above the list (not a bottom sheet) |
| Bottle count controls | `−` `3` `+` inline in the row; exact-set input visible on hover |
| Row actions | Hover reveals edit icon, kebab menu, and bottle count controls |
| Sort controls | Clickable column headers (name, producer, vintage, date added) |
| Search | Persistent top bar; filter panel opens to the right of the search bar |

**Desktop-specific interactions:**
- Column header click cycles: asc → desc → asc (with sort direction indicator arrow).
- Hover states on all interactive elements.
- Keyboard navigation through list rows (Tab, Arrow keys).
- Inline quick-edit on the detail page: single-click to activate; Escape to cancel.

---

### Tablet (768px – 1024px)

**Primary persona:** Sofia Reyes (live service on tablet — JRN-02.1, JRN-02.2).

| Component | Tablet Treatment |
|-----------|-----------------|
| App layout | Single column; top tab bar (Active / History); sticky header with search |
| Inventory list | Full-width rows; bottle count controls prominent (44px targets) |
| Bottle count `+`/`−` | Large tap targets (min 48px × 48px) — primary action during service |
| Filter panel | Bottom sheet (slides up from bottom of screen) — one thumb reach |
| Add Wine form | Full-screen slide-up panel; optional fields expanded by default for professional users |
| Wine Detail Page | Single column scroll; sections stacked vertically |
| Sort controls | Dropdown selects below the search bar |
| Search bar | Full width; keyboard opens without layout shift |

**Tablet-specific UX priorities:**
- Sofia uses the app under time pressure — every tap target must be **reachable one-handed**.
- The `−` button is the most critical action — must be **impossible to mis-tap** (adequate spacing from `+`).
- Empty badge must be visible without scrolling on common screen heights.
- The app should work in **both landscape and portrait** orientation on tablet.

---

### Mobile (< 768px)

**Primary persona:** Priya Nair (logging at a restaurant table — JRN-03.1) and Marcus Webb (parking lot add — JRN-01.1).

| Component | Mobile Treatment |
|-----------|-----------------|
| App layout | Single column; bottom tab bar (Active / History) OR top tabs |
| Inventory list | Compact rows; name + producer + count + controls; varietal/region in sub-line |
| Bottle count controls | Inline on row; `−` and `+` are 44px circles; count shown between them |
| Filter panel | Full-screen bottom sheet with handle; individual sections collapsible |
| Add Wine form | Full-screen with sticky CTA at bottom; optional fields below the fold |
| Wine name field | Auto-focused on form open; keyboard immediately visible |
| Optional fields toggle | "Add more details ▾" — collapsed; single tap to expand |
| Wine Detail Page | Single column scroll; sticky "Back to Cellar" header |
| Tasting notes | Textarea expands to take most of the viewport when active |
| Star rating | Large tap targets (min 48px per star) |
| Toasts | Bottom of screen, above the keyboard safe area |
| Delete confirmation | Bottom sheet modal (not a native alert dialog) |

**Mobile-specific UX priorities:**
- The **first useful action** (adding a wine) reachable in 1 tap with no scroll.
- No required field beyond wine name — Priya must be able to save in under 20 seconds.
- `inputmode="numeric"` on vintage and bottle count fields (triggers numeric keyboard).
- Consider `autocomplete` hints on producer/varietal fields to reduce mobile typing.
- Swipe-to-dismiss on filter chips and toast notifications.
- No hover-dependent interactions — all states accessible via tap.

---

### Breakpoint Summary

| Breakpoint | Width | Key Changes |
|------------|-------|-------------|
| Mobile | < 768px | Single column; bottom sheet panels; compact rows; bottom nav |
| Tablet | 768–1024px | Single column; larger tap targets; bottom sheet filters; top nav |
| Desktop | > 1024px | Two-column option; hover states; column sort headers; inline filter panel |

---
---

## Accessibility Notes

Target standard: **WCAG 2.1 Level AA** (PRD §6 non-functional requirement).

---

### Color Contrast

| Element | Foreground | Background | Minimum Ratio | Notes |
|---------|-----------|-----------|---------------|-------|
| Body text | Dark gray (#1a1a1a) | White (#ffffff) | 4.5:1 (AA) | All list row text |
| Secondary text (producer, vintage) | Medium gray (#6b6b6b) | White | 4.5:1 (AA) | Must not fall below AA |
| "EMPTY" badge | White (#ffffff) | Amber (#d97706) | ≥ 4.5:1 (AA) | Critical trust signal — high visibility |
| "CONSUMED" status banner | White | Dark red (#b91c1c) | ≥ 4.5:1 (AA) | |
| "REMOVED" status banner | White | Dark amber (#92400e) | ≥ 4.5:1 (AA) | |
| Error text | Error red (#dc2626) | White | 4.5:1 (AA) | Inline validation errors |
| Primary button | White | Brand color (TBD) | 4.5:1 (AA) | |
| Disabled button | Gray (#9ca3af) | Light gray (#f3f4f6) | 3:1 (AA for UI components) | `−` button at count 0 |
| Star rating (filled) | Gold (#d97706) | White | 3:1 (AA for non-text) | |

**Note:** Do not rely on color alone to communicate status — use text badges, icons, and shapes in addition to color (e.g., "EMPTY" text in the badge, not just an amber background).

---

### Keyboard Navigation

| Screen / Component | Keyboard Support Required |
|-------------------|--------------------------|
| Inventory list rows | Tab to focus each row; Enter to open detail page |
| `−` / `+` buttons | Tab-focusable; Enter/Space to activate; disabled state communicated via `aria-disabled="true"` |
| Sort controls | Tab to select; Space/Enter to open dropdown; arrow keys for options |
| Search bar | Tab to focus; Escape to clear |
| Filter panel | Escape to close; Tab through all filter inputs; Enter on Apply |
| Filter chips | Tab-focusable; Enter/Space to dismiss |
| Add Wine form | Tab order: Name → optional fields (if expanded) → Cancel → Save |
| Wine Detail Page | Tab through quick-edit fields, bottle count controls, status buttons, notes area, rating, delete |
| Star rating | Tab to first star; arrow keys to change rating; Enter to confirm |
| Inline quick-edit field | Enter to save; Escape to cancel |
| Delete confirmation dialog | Focus trapped in dialog; Escape = Cancel; Enter on focused button |
| Toast notifications | Focus not moved to toast; content announced via `aria-live` |

**Focus management rules:**
- When a modal or bottom sheet opens (filter panel, delete confirmation), **focus moves to the first focusable element inside** the overlay.
- When an overlay closes, **focus returns to the element that triggered it**.
- Skip-to-main-content link at the top of every page (visible on focus only).

---

### Screen Reader (ARIA)

| Element | ARIA Implementation |
|---------|-------------------|
| Wine list | `<ul>` or `role="list"` with `<li>` items |
| List row | `aria-label="[Wine Name], [Producer], [Vintage], [Bottle Count] bottles"` |
| `−` button | `aria-label="Remove one bottle of [Wine Name]"`, `aria-disabled="true"` when count=0 |
| `+` button | `aria-label="Add one bottle of [Wine Name]"` |
| Bottle count display | `aria-live="polite"` region so screen readers announce count changes |
| "EMPTY" badge | `aria-label="Empty — no bottles remaining"` |
| Status banner | `role="status"`, `aria-live="polite"` |
| Search input | `aria-label="Search wines"`, `aria-controls="wine-list"` |
| Match count | `aria-live="polite"` — announces "X wines found" on filter change |
| Filter chips | `role="group"` labeled "Active filters"; each chip has `aria-label="Remove [filter] filter"` |
| Star rating | `role="radiogroup"` with `role="radio"` stars; `aria-label="Rating: 4 out of 5 stars"` |
| Tasting notes textarea | `aria-label="Tasting notes"`, `aria-describedby` pointing to save status |
| Delete confirmation dialog | `role="dialog"`, `aria-modal="true"`, `aria-labelledby` pointing to dialog title |
| Toast notifications | `role="status"`, `aria-live="polite"` (or `"assertive"` for errors) |
| Loading skeleton | `aria-busy="true"` on the list container while loading |
| Inline validation errors | `aria-describedby` on the input pointing to the error message element; `aria-invalid="true"` on the input |

---

### Motion & Animation

- All animations respect `prefers-reduced-motion`. If the user prefers reduced motion:
  - Skip expand/collapse animations on optional fields section.
  - Skip count pulse animation.
  - Skip skeleton shimmer — show static gray blocks.
  - Keep transitions instant (no easing/duration).

---

### Forms

- All form inputs have visible, persistent `<label>` elements — not just placeholder text.
- Required fields are marked with a visible asterisk `*` and `aria-required="true"`.
- Error messages are associated with their inputs via `aria-describedby`.
- The "Save Wine" button is not disabled during form entry — validation fires on submit for accessibility (disabled buttons are not discoverable by some screen readers).

---

### Target Sizes

- All interactive elements: minimum **44px × 44px** touch target (WCAG 2.5.5 Target Size).
- `+` and `−` bottle count buttons: minimum **48px × 48px** (Sofia's tablet use case — service pressure).
- Star rating stars: minimum **44px × 44px** each (Priya's mobile use case — social setting).
- Filter chip dismiss `×` buttons: minimum **44px × 44px** hit area (larger than visual size if needed).

---

*Document generated: 2026-05-15 | Project: WineInventory | UX Mockup v1.0*
