# Story Map — Wine Inventory App

| Field | Value |
|---|---|
| **Product Name** | Wine Inventory App |
| **Version** | 1.0 |
| **Date** | 2026-05-15 |
| **Related Artifacts** | `PERSONAS-WineInventory.md`, `JOURNEYS-WineInventory.md`, `JTBD-WineInventory.md`, `UserStories-WineInventory.md`, `PRD-WineInventory.md` |
| **Status** | Draft |

---

## Overview

This Story Map organises all 27 user stories (US-0.1 – US-6.4) across two axes:

- **X-axis (columns):** Journey stages derived from `JOURNEYS-WineInventory.md` — representing what users do in chronological order within each scenario.
- **Y-axis (rows):** Activities and stories at increasing levels of detail within each stage.

**NaC (Natural Acceptance Criteria)** bridge JTBD outcomes to testable story criteria. Each NaC is derived from:

1. A specific JTBD outcome (the "what matters") from `JTBD-WineInventory.md`
2. The journey stage context (the "when/where") from `JOURNEYS-WineInventory.md`
3. The user story (the "what is built") from `UserStories-WineInventory.md`

NaC are **not invented** — they are derived from the intersection of the above three sources and verified against each story's acceptance criteria.

**Release Strategy:**
- **R1 (MVP Core):** Complete the end-to-end inventory loop for all personas — add, view, search, count, detail. Every persona can complete their primary journey.
- **R2 (Enrichment):** Layer in tasting notes, ratings, consumed/removed status, and history — turning the ledger into a personal wine journal.

---

## Story Map Matrix

The map is organised by journey stage across all personas. Stage column headers match journey IDs from JOURNEYS.md. Stories appear at their primary stage; multi-stage stories are placed at the stage where they deliver the most value.

### Persona: PER-01 Marcus Webb — Home Wine Collector

| Journey Stage | Activity | Epic | Story ID | Story Title | NaC (derived from JTBD) | Release |
|---|---|---|---|---|---|---|
| **Trigger / App Open** | Lands on home screen; first session | Epic 1 (F1) | US-1.3 | See an Empty State When No Wines Are Logged | JTBD-03.1 → JRN-03.1:Trigger — First-time user sees a clear "Add your first wine" CTA within 2 seconds of opening the app; no blank/broken screen | R1 |
| **Add Wine** | Fills in full wine details on mobile | Epic 0 (F0) | US-0.2 | Add a Wine with Full Details | JTBD-01.1 → JRN-01.1:Add Wine — All six fields (name, producer, vintage, varietal, region, bottle count) are accepted in a single form and saved in ≤ 45 seconds on mobile | R1 |
| **Add Wine** | Needs to edit a mistaken entry | Epic 0 (F0) | US-0.3 | Edit an Existing Wine Record | JTBD-01.1 → JRN-01.1:Add Wine — An incorrect field can be corrected from the list or detail page without re-entering the full record | R1 |
| **Add Wine** | Removes a wine entered by mistake | Epic 0 (F0) | US-0.4 | Delete a Wine Record | JTBD-01.1 → JRN-01.1:Add Wine — A wine added in error can be permanently deleted with a single confirmation step; deletion completes without page error | R1 |
| **Save & Confirm** | Sees new wine appear in list | Epic 1 (F1) | US-1.1 | Browse the Active Inventory List | JTBD-01.1 → JRN-01.1:Save & Confirm — Inventory list loads in ≤ 1 second and shows the newly added wine with correct bottle count immediately after save | R1 |
| **Save & Confirm** | Sorts list to locate the new entry | Epic 1 (F1) | US-1.2 | Sort the Inventory List | JTBD-01.1 → JRN-01.1:Save & Confirm — Sort by name or date_added re-renders the list immediately so Marcus can confirm the entry is present | R1 |
| **Verify Count** | Confirms bottle count on list row | Epic 3 (F3) | US-3.1 | Increment a Bottle Count | JTBD-01.1 → JRN-01.1:Verify Count — A single `+` tap on the list row increases the count immediately (optimistic update) without navigating away | R1 |
| **Verify Count** | Decrements count when opening a bottle | Epic 3 (F3) | US-3.2 | Decrement a Bottle Count | JTBD-01.1 → JRN-01.2:Decrement Count — A single `−` tap decrements the count from the list or detail view; count updates are visible instantly on the same screen | R1 |
| **Verify Count** | Bulk-corrects count after stocktake | Epic 3 (F3) | US-3.3 | Set an Exact Bottle Count | JTBD-01.1 → JRN-01.1:Verify Count — An exact integer 0–9999 can be typed on the detail page to bulk-correct after a delivery without tapping `+` repeatedly | R1 |
| **Verify Count** | Notices zero-bottle wines flagged | Epic 3 (F3) | US-3.4 | See a Visual Flag on Zero-Bottle Wines | JTBD-02.1 → JRN-02.1:Confirm Empty Badge — Wines with bottle_count = 0 display an "Empty" badge immediately; no additional API call required | R1 |
| **Search by Producer** | Types producer name to check stock | Epic 2 (F2) | US-2.1 | Search by Free Text | JTBD-01.3 → JRN-01.3:Search by Producer — Partial producer name entered in the search field returns all matching wines with bottle counts visible within 500ms | R1 |
| **Refine Filter** | Adds varietal filter to narrow results | Epic 2 (F2) | US-2.2 | Filter by Varietal, Region, Vintage, or Producer | JTBD-01.3 → JRN-01.3:Refine Filter — Varietal and region filters are combinable in a single interaction; results update in real time without a page reload | R1 |
| **Refine Filter** | Combines free text + structured filters | Epic 2 (F2) | US-2.3 | Apply Multiple Filters Simultaneously | JTBD-01.3 → JRN-01.3:Refine Filter — Free-text search and structured filters (e.g., producer + varietal) can be active simultaneously; combined result count is shown | R1 |
| **Assess & Decide** | Clears all filters to return to full list | Epic 2 (F2) | US-2.4 | Clear All Filters | JTBD-01.3 → JRN-01.3:Return to Email — All active filters clear in one tap; the full active inventory list is restored to default state | R1 |
| **Assess & Decide** | Opens wine detail for full picture | Epic 4 (F4) | US-4.1 | View All Details of a Wine | JTBD-01.3 → JRN-01.3:Assess & Decide — All wine fields (name, producer, vintage, varietal, region, bottle count, notes, rating, status, dates) are visible on the detail page in ≤ 1 second | R1 |
| **Assess & Decide** | Quick-edits a field on the detail page | Epic 4 (F4) | US-4.2 | Quick-Edit a Field on the Detail Page | JTBD-01.1 → JRN-01.3:Assess & Decide — A field can be edited inline (click/tap → edit → confirm) without navigating to a separate form; the updated value is displayed immediately | R1 |
| **Assess & Decide** | Accesses all actions from one place | Epic 4 (F4) | US-4.3 | Access All Actions from the Detail Page | JTBD-01.1 → JRN-01.2:Find the Wine — Bottle count controls, status transitions, and delete are all accessible from the detail page without additional navigation | R1 |
| **Add Tasting Note** | Writes a note while wine is open | Epic 5 (F5) | US-5.1 | Add a Tasting Note | JTBD-01.2 → JRN-01.2:Add Tasting Note — A free-text note is entered inline on the detail page and saved in ≤ 30 seconds; no navigation to a separate edit form required | R2 |
| **Add Tasting Note** | Rates the wine with stars | Epic 5 (F5) | US-5.2 | Rate a Wine | JTBD-01.2 → JRN-03.1:Add a Quick Rating — A star rating is addable in 1 tap from the detail page or add-confirmation screen without navigating away | R2 |
| **Add Tasting Note** | Updates or clears an existing note | Epic 5 (F5) | US-5.3 | Edit or Delete Tasting Notes and Rating | JTBD-01.2 → JRN-01.2:Add Tasting Note — An existing tasting note or rating can be edited or cleared at any time regardless of the wine's current status | R2 |
| **Mark as Consumed** | Marks the finished bottle as consumed | Epic 6 (F6) | US-6.1 | Mark a Wine as Consumed | JTBD-01.2 → JRN-01.2:Mark as Consumed — "Mark as Consumed" is reachable in ≤ 2 taps from the detail page; the wine exits the active list immediately | R2 |
| **Mark as Consumed** | Confirms note persists in history | Epic 5 (F5) | US-5.4 | Retain Tasting Notes and Rating After Status Change | JTBD-01.2 → JRN-01.2:Mark as Consumed — Marking a wine consumed does not clear the tasting note or rating; both are visible on the consumed wine's detail page in history | R2 |
| **Mark as Consumed** | Corrects a mistaken status change | Epic 6 (F6) | US-6.3 | Revert a Wine Back to Active | JTBD-03.3 → JRN-03.2:Navigate to History — A wine marked consumed or removed in error can be reverted to active from its detail page; it reappears in the active list immediately | R2 |

---

### Persona: PER-02 Sofia Reyes — Restaurant Floor Manager

| Journey Stage | Activity | Epic | Story ID | Story Title | NaC (derived from JTBD) | Release |
|---|---|---|---|---|---|---|
| **Trigger / App Open** | Opens app on tablet during service | Epic 1 (F1) | US-1.1 | Browse the Active Inventory List | JTBD-02.1 → JRN-02.1:Trigger — Active inventory list is visible and scrollable in ≤ 1 second on a tablet without re-authentication during an active session | R1 |
| **Locate Wine** | Searches for a wine during service | Epic 2 (F2) | US-2.1 | Search by Free Text | JTBD-02.2 → JRN-02.1:Locate Wine — Typing a partial wine name in the persistent search bar returns matching results within 500ms; search bar is visible without scrolling | R1 |
| **Locate Wine** | Filters by varietal at tableside | Epic 2 (F2) | US-2.2 | Filter by Varietal, Region, Vintage, or Producer | JTBD-02.2 → JRN-02.2:Enter Search Terms — Varietal and region filters are combinable in ≤ 2 taps; results include bottle counts per row so availability is confirmed without opening detail | R1 |
| **Decrement to Zero** | Taps `−` on list row to sell a bottle | Epic 3 (F3) | US-3.2 | Decrement a Bottle Count | JTBD-02.1 → JRN-02.1:Decrement to Zero — Count decrements in ≤ 3 taps from the inventory list view without navigating to a detail or edit page | R1 |
| **Confirm Empty Badge** | Sees "Empty" badge appear instantly | Epic 3 (F3) | US-3.4 | See a Visual Flag on Zero-Bottle Wines | JTBD-02.1 → JRN-02.1:Confirm Empty Badge — "Empty" badge is displayed immediately when bottle_count hits 0; badge is high-contrast and visible at a glance on the list row | R1 |
| **Confirm Empty Badge** | Reviews results with counts visible | Epic 1 (F1) | US-1.4 | See Inline Bottle Count Controls on Each List Row | JTBD-02.1 → JRN-02.1:Confirm Empty Badge — Each list row shows `+`, `−`, and current count; `−` is disabled at 0; zero-bottle wines are visually flagged without leaving the list | R1 |
| **Add Delivery Wines** | Adds new wines from a delivery | Epic 0 (F0) | US-0.2 | Add a Wine with Full Details | JTBD-01.1 → JRN-02.1:Trigger — A delivery wine with full details is saved from the add form in ≤ 60 seconds; bottle_count defaults to 1 if left blank | R1 |
| **Add Delivery Wines** | Corrects a wine record after delivery | Epic 0 (F0) | US-0.3 | Edit an Existing Wine Record | JTBD-01.1 → JRN-02.1:Add Delivery Wines — Any field on a wine record (e.g., producer label change, vintage update) is editable from the list or detail page without re-entering all data | R1 |
| **Mark as Removed** | Marks a sold/gifted wine as removed | Epic 6 (F6) | US-6.2 | Mark a Wine as Removed | JTBD-02.3 → JRN-02.1:Resume Service — "Mark as Removed" is available from the list row and detail page; on success the wine exits the active list immediately | R2 |
| **View History** | Browses consumption history for reorders | Epic 6 (F6) | US-6.4 | View Consumed and Removed History | JTBD-02.3 → JRN-02.2:Review Results — History tab is accessible in ≤ 1 additional tap from the main inventory screen; history list shows status badge, tasting notes, and supports the same sort/filter controls as the active list | R2 |

---

### Persona: PER-03 Priya Nair — Casual Wine Gifter / Occasional Buyer

| Journey Stage | Activity | Epic | Story ID | Story Title | NaC (derived from JTBD) | Release |
|---|---|---|---|---|---|---|
| **Trigger / Open App** | Opens app for the first time | Epic 1 (F1) | US-1.3 | See an Empty State When No Wines Are Logged | JTBD-03.1 → JRN-03.1:Trigger — First-time user sees a prominent "Add your first wine" CTA; empty state includes a motivating message; no wine-expert jargon in UI labels | R1 |
| **Add Wine by Name** | Types only the wine name to log it fast | Epic 0 (F0) | US-0.1 | Quick-Add a Wine by Name Only | JTBD-03.1 → JRN-03.1:Add Wine by Name — Wine is saved with name only (all other fields optional) in ≤ 20 seconds on first use; add form is a single screen with no multi-step wizard | R1 |
| **See It in the List** | Sees the wine appear in inventory | Epic 1 (F1) | US-1.1 | Browse the Active Inventory List | JTBD-03.3 → JRN-03.1:See It in the List — Newly logged wine appears in the active inventory list immediately after save; only active wines are shown by default (no consumed/removed clutter) | R1 |
| **Add a Quick Rating** | Rates the wine immediately | Epic 5 (F5) | US-5.2 | Rate a Wine | JTBD-03.1 → JRN-03.1:Add a Quick Rating — Star rating is addable in 1 tap from the wine detail page or add-confirmation prompt; no separate navigation to an edit form required | R2 |
| **Navigate to History** | Opens the history tab to find a finished wine | Epic 6 (F6) | US-6.4 | View Consumed and Removed History | JTBD-03.3 → JRN-03.2:Navigate to History — Consumed wine history is reachable in ≤ 1 additional tap from the main screen via a clearly labelled "History" tab; no settings navigation required | R2 |
| **Search History** | Searches consumed wines by partial name or varietal | Epic 2 (F2) | US-2.1 | Search by Free Text | JTBD-03.2 → JRN-03.2:Search History — Free-text search works against consumed/removed wines in addition to active inventory; varietal filter applies to the history view | R2 |
| **Review Rating & Note** | Reads her note and rating for a consumed wine | Epic 4 (F4) | US-4.1 | View All Details of a Wine | JTBD-03.2 → JRN-03.2:Review Rating & Note — Tasting note and star rating are prominently displayed on the consumed wine detail page; "consumed on" date is visible | R2 |
| **Mark as Consumed** | Marks a finished bottle to clear active list | Epic 6 (F6) | US-6.1 | Mark a Wine as Consumed | JTBD-03.3 → JRN-03.2:Navigate to History — Marking a wine consumed requires ≤ 2 taps from the list view; the active list immediately reflects the change with zero consumed bottles visible | R2 |
| **Clear Filters** | Resets to full list after browsing | Epic 2 (F2) | US-2.4 | Clear All Filters | JTBD-03.3 → JRN-03.1:See It in the List — All filters reset in one tap; the full active inventory is restored with the default "no consumed wines" view | R1 |

---

## NaC Derivation Table

Full traceability: JTBD outcome → journey stage → NaC → story.

| JTBD-ID | Outcome Statement | Journey Stage | NaC (Testable Criterion) | Story |
|---|---|---|---|---|
| JTBD-01.1 | Mobile add in ≤ 45 seconds | JRN-01.1:Add Wine | All six fields accepted and saved in ≤ 45 seconds on mobile | US-0.2 |
| JTBD-01.1 | Zero reconciliation after 30 days | JRN-01.1:Verify Count | Bottle count on every list row matches physical count; counts persist across sessions without manual reconciliation | US-3.1, US-3.2, US-3.3 |
| JTBD-01.1 | Single-source record always accurate | JRN-01.1:Save & Confirm | Active inventory list loads ≤ 1 second and reflects the most recent add/edit immediately | US-1.1 |
| JTBD-01.1 | Correction without re-entry | JRN-01.1:Add Wine | Edit form accessible from list and detail; corrected value shown without losing other fields | US-0.3 |
| JTBD-01.1 | Safe deletion of wrong entries | JRN-01.1:Add Wine | Deletion requires explicit confirmation; record and all notes are permanently removed after confirm | US-0.4 |
| JTBD-01.2 | Note captured inline in ≤ 30 seconds | JRN-01.2:Add Tasting Note | Free-text note field opens inline on detail page; no separate edit navigation; saved on blur | US-5.1 |
| JTBD-01.2 | Rating addable in 1 tap | JRN-01.2:Add Tasting Note | Star/numeric rating selectable from detail page in a single interaction | US-5.2 |
| JTBD-01.2 | Note and rating editable at any time | JRN-01.2:Add Tasting Note | Edit and clear actions available regardless of wine status (active, consumed, removed) | US-5.3 |
| JTBD-01.2 | Note preserved after consume | JRN-01.2:Mark as Consumed | Marking consumed does NOT clear tasting_notes or rating; both visible on history detail page | US-5.4 |
| JTBD-01.2 | Consumed action reachable in ≤ 2 taps | JRN-01.2:Mark as Consumed | "Mark as Consumed" available from list row and detail page; wine exits active list on success | US-6.1 |
| JTBD-01.3 | Producer search returns results in ≤ 500ms | JRN-01.3:Search by Producer | Partial producer name entered in search returns all matching wines with bottle counts within 500ms | US-2.1 |
| JTBD-01.3 | Varietal + region filters combinable | JRN-01.3:Refine Filter | Varietal and region filters active simultaneously; results update in real time; match count shown | US-2.2, US-2.3 |
| JTBD-01.3 | Bottle count visible per row | JRN-01.3:Assess & Decide | Each list row shows current bottle count without opening the detail page | US-1.1, US-1.4 |
| JTBD-01.3 | Full detail in ≤ 1 second | JRN-01.3:Assess & Decide | Detail page loads all wine fields in ≤ 1 second; shows status banner if consumed/removed | US-4.1 |
| JTBD-02.1 | Count decremented in ≤ 3 taps | JRN-02.1:Decrement to Zero | `−` tap on list row decrements count; count update saved without leaving the list view | US-3.2 |
| JTBD-02.1 | "Empty" badge appears immediately at count = 0 | JRN-02.1:Confirm Empty Badge | Wines with bottle_count = 0 display "Empty" badge on the list row with no additional API call | US-3.4 |
| JTBD-02.1 | Inline controls on every list row | JRN-02.1:Decrement to Zero | `+` and `−` buttons visible on each row; `−` disabled at 0; prompt to mark consumed at 0 | US-1.4 |
| JTBD-02.2 | Any wine findable in ≤ 10 seconds | JRN-02.2:Enter Search Terms | Varietal + region filter combinable in ≤ 2 taps; matching wines with bottle counts returned in ≤ 10 seconds on tablet | US-2.2, US-2.3 |
| JTBD-02.2 | Search accessible in ≤ 2 taps from any screen | JRN-02.2:Trigger | Persistent search bar visible on inventory list; no extra navigation tap required to reach it | US-2.1 |
| JTBD-02.3 | Consumption history fully browsable | JRN-02.3:View History | History tab accessible in ≤ 1 tap from main screen; shows status badge, supports sort + pagination | US-6.4 |
| JTBD-02.3 | Consumed/removed action available from list + detail | JRN-02.1:Resume Service | "Mark as Removed" available from list row and detail page; wine exits active list on success | US-6.2 |
| JTBD-03.1 | Name-only add in ≤ 20 seconds on first use | JRN-03.1:Add Wine by Name | Wine name is the only required field; all others optional; save completes in ≤ 20 seconds on first session | US-0.1 |
| JTBD-03.1 | First-time CTA visible immediately | JRN-03.1:Trigger | Empty state shows illustration, message, and "Add your first wine" button; no login gate before first wine | US-1.3 |
| JTBD-03.1 | Star rating in 1 tap on first add | JRN-03.1:Add a Quick Rating | Rating available from add-confirmation or detail page in a single tap with no navigation | US-5.2 |
| JTBD-03.2 | Rating and note retrievable in ≤ 15 seconds | JRN-03.2:Review Rating & Note | Consumed wine detail shows rating and tasting note; accessible from history tap in ≤ 15 seconds total | US-4.1, US-5.4 |
| JTBD-03.2 | Search works across consumed wines | JRN-03.2:Search History | Free-text search and varietal filter apply to consumed/removed wines in the history view | US-2.1, US-2.2 |
| JTBD-03.3 | Default view shows only active bottles | JRN-03.2:Navigate to History | Default GET /wines returns only status=active wines; consumed wines absent from default list | US-1.1 |
| JTBD-03.3 | History accessible in ≤ 1 tap | JRN-03.2:Navigate to History | "History" tab prominently labelled on main screen; consumed wine view reached in exactly 1 additional tap | US-6.4 |
| JTBD-03.3 | Revert in error supported | JRN-03.2:Navigate to History | "Revert to Active" available on consumed/removed detail and history list; wine reappears in active list | US-6.3 |
| JTBD-03.3 | Filters reset in one tap | JRN-03.1:See It in the List | "Clear all filters" button visible when any filter active; one tap restores full default active list | US-2.4 |

---

## Release Planning

### R1: "Core Inventory Loop" (MVP)

**Theme:** Every persona can complete their primary journey — add a wine, find it, check the count, and update it — without any R2 features. The app is deployable and valuable at R1 completion.

**JTBD Addressed:** JTBD-01.1, JTBD-01.3, JTBD-02.1, JTBD-02.2, JTBD-03.1, JTBD-03.3 (partial)

| Story ID | Title | Persona(s) Served | Priority |
|---|---|---|---|
| US-0.1 | Quick-Add a Wine by Name Only | PER-03 (Priya) | P0 |
| US-0.2 | Add a Wine with Full Details | PER-01 (Marcus), PER-02 (Sofia) | P0 |
| US-0.3 | Edit an Existing Wine Record | PER-02 (Sofia) | P0 |
| US-0.4 | Delete a Wine Record | PER-01 (Marcus) | P0 |
| US-1.1 | Browse the Active Inventory List | PER-01, PER-02, PER-03 | P0 |
| US-1.2 | Sort the Inventory List | PER-01 (Marcus) | P0 |
| US-1.3 | See an Empty State When No Wines Are Logged | PER-03 (Priya) | P0 |
| US-1.4 | See Inline Bottle Count Controls on Each List Row | PER-02 (Sofia) | P0 |
| US-2.1 | Search by Free Text | PER-01, PER-02, PER-03 | P0 |
| US-2.2 | Filter by Varietal, Region, Vintage, or Producer | PER-01 (Marcus), PER-02 (Sofia) | P0 |
| US-2.3 | Apply Multiple Filters Simultaneously | PER-01 (Marcus) | P0 |
| US-2.4 | Clear All Filters | PER-03 (Priya) | P0 |
| US-3.1 | Increment a Bottle Count | PER-01 (Marcus) | P0 |
| US-3.2 | Decrement a Bottle Count | PER-02 (Sofia) | P0 |
| US-3.3 | Set an Exact Bottle Count | PER-02 (Sofia) | P0 |
| US-3.4 | See a Visual Flag on Zero-Bottle Wines | PER-02 (Sofia) | P0 |
| US-4.1 | View All Details of a Wine | PER-01 (Marcus) | P0 |
| US-4.2 | Quick-Edit a Field on the Detail Page | PER-01 (Marcus) | P0 |
| US-4.3 | Access All Actions from the Detail Page | PER-01 (Marcus) | P0 |

**R1 Story Count:** 19 (all P0)

**R1 Journey Coverage:**
- JRN-01.1 (Marcus: add purchase) — **Complete**
- JRN-01.3 (Marcus: pre-purchase check) — **Complete**
- JRN-02.1 (Sofia: decrement during service) — **Complete**
- JRN-02.2 (Sofia: look up wine at tableside) — **Complete**
- JRN-03.1 (Priya: log a wine fast) — **Complete** (rating prompt deferred to R2)

**Persona Coverage at R1:**

| Persona | Primary Journey Complete? | Critical JTBD Met? |
|---|---|---|
| PER-01 Marcus | Yes (JRN-01.1, JRN-01.3) | JTBD-01.1 ✓, JTBD-01.3 ✓ |
| PER-02 Sofia | Yes (JRN-02.1, JRN-02.2) | JTBD-02.1 ✓, JTBD-02.2 ✓ |
| PER-03 Priya | Partial (JRN-03.1 core) | JTBD-03.1 ✓, JTBD-03.2 ✗ (R2), JTBD-03.3 partial |

---

### R2: "Wine Journal & History" (Enrichment)

**Theme:** Layer tasting notes, ratings, and the full consume/remove/history lifecycle onto the R1 core. Transforms the cellar ledger into a personal wine journal. Completes all remaining journeys.

**JTBD Addressed:** JTBD-01.2, JTBD-02.3, JTBD-03.2, JTBD-03.3 (full)

| Story ID | Title | Persona(s) Served | Priority |
|---|---|---|---|
| US-5.1 | Add a Tasting Note | PER-01 (Marcus) | P1 |
| US-5.2 | Rate a Wine | PER-03 (Priya), PER-01 (Marcus) | P1 |
| US-5.3 | Edit or Delete Tasting Notes and Rating | PER-01 (Marcus) | P1 |
| US-5.4 | Retain Tasting Notes and Rating After Status Change | PER-01 (Marcus) | P1 |
| US-6.1 | Mark a Wine as Consumed | PER-01 (Marcus), PER-03 (Priya) | P1 |
| US-6.2 | Mark a Wine as Removed | PER-02 (Sofia) | P1 |
| US-6.3 | Revert a Wine Back to Active | PER-01 (Marcus) | P1 |
| US-6.4 | View Consumed and Removed History | PER-02 (Sofia), PER-03 (Priya) | P1 |

**R2 Story Count:** 8 (all P1)

**R2 Journey Coverage:**
- JRN-01.2 (Marcus: tasting note after opening) — **Complete**
- JRN-02.3 (Sofia: reorder planning from history) — **Complete**
- JRN-03.2 (Priya: revisit history to re-buy) — **Complete**

**Persona Coverage at R2 (cumulative):**

| Persona | All Journeys Complete? | All JTBD Met? |
|---|---|---|
| PER-01 Marcus | Yes (JRN-01.1, JRN-01.2, JRN-01.3) | JTBD-01.1 ✓, JTBD-01.2 ✓, JTBD-01.3 ✓ |
| PER-02 Sofia | Yes (JRN-02.1, JRN-02.2, JRN-02.3) | JTBD-02.1 ✓, JTBD-02.2 ✓, JTBD-02.3 ✓ |
| PER-03 Priya | Yes (JRN-03.1, JRN-03.2) | JTBD-03.1 ✓, JTBD-03.2 ✓, JTBD-03.3 ✓ |

---

## Coverage Analysis

### Persona Coverage per Release

| Persona | R1 | R2 |
|---|---|---|
| PER-01 Marcus Webb | Primary add/search/count loop | Full journal + consume lifecycle |
| PER-02 Sofia Reyes | Service-critical count + search ops | History + removal for reorder planning |
| PER-03 Priya Nair | Name-only add + empty state + search | Rating, history, consume, re-buy lookup |

All three personas have at least one complete journey at R1. No persona is left without functional value until R2.

---

### JTBD Coverage per Release

| JTBD-ID | Description | R1 | R2 |
|---|---|---|---|
| JTBD-01.1 | Eliminate spreadsheet reconciliation | ✓ Full | — |
| JTBD-01.2 | Capture tasting impressions in the moment | ✗ | ✓ Full |
| JTBD-01.3 | Assess collection before allocation order | ✓ Full | — |
| JTBD-02.1 | Keep bottle counts accurate during service | ✓ Full | — |
| JTBD-02.2 | Find any wine in seconds during service | ✓ Full | — |
| JTBD-02.3 | Maintain consumption history for reorders | ✗ | ✓ Full |
| JTBD-03.1 | Log a wine before the moment passes | ✓ Full | — |
| JTBD-03.2 | Revisit past impressions for re-buy decision | ✗ | ✓ Full |
| JTBD-03.3 | Keep active rack view clean | Partial (default active list) | ✓ Full (consume/history) |

---

### Gap Analysis

**Journey stages with no mapped stories:**
- None. All seven journeys (JRN-01.1 through JRN-03.2) have at least one story mapped to each stage.

**JTBD outcomes with no derived NaC:**
- None. All 9 JTBD IDs have at least one NaC derived in the NaC Derivation Table above.

**Orphan stories (not mapped to any journey stage):**
- None. All 27 stories (US-0.1 through US-6.4) are placed in the story map matrix.

**Cross-journey pattern coverage:**

| Pattern | Stories Addressing It | Release |
|---|---|---|
| CP-01: App usable in < 2 seconds | US-1.1 (list loads ≤ 1s), US-2.1 (search ≤ 500ms) | R1 |
| CP-02: Bottle count visible on list row | US-1.1, US-1.4, US-3.4 | R1 |
| CP-03: Search spans active + consumed | US-2.1 (search with status scope), US-6.4 (history view) | R1 + R2 |
| CP-04: Inline controls eliminate navigation | US-1.4, US-3.2, US-5.2 | R1 + R2 |
| CP-05: Empty badge as trust signal | US-3.4, US-1.4 | R1 |
| CP-06: History one tap away | US-6.4, US-6.1 | R2 |

**R1 Partial Gap (noted for R2 readiness):**
- CP-03 (search across consumed wines) and CP-06 (history one tap away) are only fully addressed at R2 when US-6.4 ships. The R1 search (US-2.1) covers active inventory. The R2 history view extends search scope to consumed/removed records.

---

## NaC-to-Acceptance Criteria Mapping

Verifies that each NaC is grounded in the UserStory acceptance criteria from `UserStories-WineInventory.md`.

| Story | NaC | Verified Against AC |
|---|---|---|
| US-0.1 | Wine saved with name only in ≤ 20 seconds; no required fields beyond name | AC: "Only the `name` field is required; submits in under 30 seconds for a first-time user" ✓ |
| US-0.2 | All six fields saved in ≤ 45 seconds on mobile | AC: "Full-details entry completes in under 60 seconds for a first-time user" — NaC tightens to JTBD-01.1's 45s mobile target ✓ |
| US-0.3 | Field correctable from list or detail without re-entry | AC: "Edit form is accessible from both the List View and the Wine Detail Page; validation errors preserve previous values" ✓ |
| US-0.4 | Deletion requires explicit confirmation; all notes removed | AC: "Clicking Delete shows confirmation dialog; confirmed deletion permanently removes the wine record and all associated tasting notes" ✓ |
| US-1.1 | List loads ≤ 1 second; default shows only active wines | AC: "List view loads in under 1 second for collections up to 10,000 wines; Only wines with `status = 'active'` are shown by default" ✓ |
| US-1.2 | Sort re-renders immediately; default name ascending | AC: "Changing the sort key or direction re-fetches and re-renders the list immediately; Default sort is name ascending on first load" ✓ |
| US-1.3 | Empty state shows CTA; no blank/error screen | AC: "Empty state includes an illustration or icon, message, and prominent 'Add your first wine' button" ✓ |
| US-1.4 | `+`/`−` on every row; `−` disabled at 0; Empty badge shown | AC: "Each list row shows `+` and `−` buttons; `−` button is disabled or shows an error if count is already 0; Zero-bottle wines are visually flagged" ✓ |
| US-2.1 | Partial text returns matches within 500ms; case-insensitive | AC: "Search is debounced (300ms delay); matches against `name`, `producer`, and `region` using case-insensitive partial matching; Results update without a page reload" ✓ |
| US-2.2 | Varietal + region filters combinable; results in real time | AC: "Filter controls available for varietal, region, vintage, producer; Filters are case-insensitive; Match count updates" ✓ |
| US-2.3 | Free-text + structured filters simultaneously (AND logic) | AC: "Free-text search and structured filters can be active at the same time; Multiple structured filters can be active simultaneously (AND logic)" ✓ |
| US-2.4 | All filters cleared in one tap; full list restored | AC: "A 'Clear all filters' or 'Reset' button clears all search terms and filter values in one action; full active inventory restored" ✓ |
| US-3.1 | Single `+` tap increments count; capped at 9999 | AC: "Tapping `+` sends an increment action and updates `bottle_count` by 1; UI updates immediately; capped at 9999" ✓ |
| US-3.2 | Single `−` tap decrements from list; prompt at 0; no negative counts | AC: "Tapping `−` decrements; rejected if count = 0; `zero_bottle_flag: true` returned; non-blocking prompt shown" ✓ |
| US-3.3 | Exact integer 0–9999 typed on detail page | AC: "Accepts integers 0–9999 inclusive; Decimal values are rejected; `bottle_count` and `date_updated` updated server-side" ✓ |
| US-3.4 | "Empty" badge on list row when count = 0; also on detail page | AC: "Wines with `bottle_count = 0` and `status = 'active'` are visually distinguished in the list; flag also shown on wine detail page" ✓ |
| US-4.1 | All fields + status banner visible on detail page | AC: "Detail page displays all fields; consumed/removed wines show prominent status banner" ✓ |
| US-4.2 | Inline field edit on detail; saves with Enter/tap-away | AC: "Field transitions to text input; confirming with Enter or tap-away saves; On success, field reverts to display mode" ✓ |
| US-4.3 | Count controls + status transitions + delete all on detail | AC: "Detail page shows `+`/`−` controls, exact-count input, status badge, 'Mark as Consumed', 'Mark as Removed', 'Revert to Active', and Delete button" ✓ |
| US-5.1 | Inline note field on detail; no character limit; autosave | AC: "Tapping the area opens an inline text area; No character limit; Saving sends PATCH with tasting_notes" ✓ |
| US-5.2 | Rating in 1 tap; integers 1–100; independent of notes | AC: "Rating accepts integers 1–100 inclusive; Rating can be set independently of tasting notes" ✓ |
| US-5.3 | Note and rating editable/clearable at any status | AC: "Edit and delete actions are available regardless of the wine's status (active, consumed, removed)" ✓ |
| US-5.4 | Marking consumed does not clear note or rating | AC: "Marking a wine as consumed or removed does NOT clear `tasting_notes` or `rating`; Notes and rating visible in the history view" ✓ |
| US-6.1 | "Mark as Consumed" in ≤ 2 taps; wine exits active list | AC: "Triggering the action sends PATCH status=consumed; on success wine is removed from active inventory list; tasting notes and rating intact" ✓ |
| US-6.2 | "Mark as Removed" available; exits active list | AC: "Mark as Removed available from list row and detail page; wine removed from active inventory; direct consumed→removed transition rejected" ✓ |
| US-6.3 | "Revert to Active" from history detail; wine reappears | AC: "Triggering sends PATCH status=active; on success wine reappears in active list; `date_updated` refreshed" ✓ |
| US-6.4 | History tab ≤ 1 tap; same sort/pagination as active list | AC: "A 'History' tab accessible from inventory list; supports same sort and pagination controls as active list; clicking navigates to full detail page" ✓ |

**Alignment result:** All 27 stories have NaC fully aligned with their UserStory acceptance criteria. No NaC contradicts or exceeds the scope defined in `UserStories-WineInventory.md`.

---

## Story Map ID Index

| SM-ID | Story | Epic | Release |
|---|---|---|---|
| SM-0.1 | US-0.1 Quick-Add a Wine by Name Only | Epic 0 (F0) | R1 |
| SM-0.2 | US-0.2 Add a Wine with Full Details | Epic 0 (F0) | R1 |
| SM-0.3 | US-0.3 Edit an Existing Wine Record | Epic 0 (F0) | R1 |
| SM-0.4 | US-0.4 Delete a Wine Record | Epic 0 (F0) | R1 |
| SM-1.1 | US-1.1 Browse the Active Inventory List | Epic 1 (F1) | R1 |
| SM-1.2 | US-1.2 Sort the Inventory List | Epic 1 (F1) | R1 |
| SM-1.3 | US-1.3 See an Empty State When No Wines Are Logged | Epic 1 (F1) | R1 |
| SM-1.4 | US-1.4 See Inline Bottle Count Controls on Each List Row | Epic 1 (F1) | R1 |
| SM-2.1 | US-2.1 Search by Free Text | Epic 2 (F2) | R1 |
| SM-2.2 | US-2.2 Filter by Varietal, Region, Vintage, or Producer | Epic 2 (F2) | R1 |
| SM-2.3 | US-2.3 Apply Multiple Filters Simultaneously | Epic 2 (F2) | R1 |
| SM-2.4 | US-2.4 Clear All Filters | Epic 2 (F2) | R1 |
| SM-3.1 | US-3.1 Increment a Bottle Count | Epic 3 (F3) | R1 |
| SM-3.2 | US-3.2 Decrement a Bottle Count | Epic 3 (F3) | R1 |
| SM-3.3 | US-3.3 Set an Exact Bottle Count | Epic 3 (F3) | R1 |
| SM-3.4 | US-3.4 See a Visual Flag on Zero-Bottle Wines | Epic 3 (F3) | R1 |
| SM-4.1 | US-4.1 View All Details of a Wine | Epic 4 (F4) | R1 |
| SM-4.2 | US-4.2 Quick-Edit a Field on the Detail Page | Epic 4 (F4) | R1 |
| SM-4.3 | US-4.3 Access All Actions from the Detail Page | Epic 4 (F4) | R1 |
| SM-5.1 | US-5.1 Add a Tasting Note | Epic 5 (F5) | R2 |
| SM-5.2 | US-5.2 Rate a Wine | Epic 5 (F5) | R2 |
| SM-5.3 | US-5.3 Edit or Delete Tasting Notes and Rating | Epic 5 (F5) | R2 |
| SM-5.4 | US-5.4 Retain Tasting Notes and Rating After Status Change | Epic 5 (F5) | R2 |
| SM-6.1 | US-6.1 Mark a Wine as Consumed | Epic 6 (F6) | R2 |
| SM-6.2 | US-6.2 Mark a Wine as Removed | Epic 6 (F6) | R2 |
| SM-6.3 | US-6.3 Revert a Wine Back to Active | Epic 6 (F6) | R2 |
| SM-6.4 | US-6.4 View Consumed and Removed History | Epic 6 (F6) | R2 |

**Total: 27 stories mapped | R1: 19 | R2: 8 | Orphans: 0**

---

*Document generated: 2026-05-15 | Project: WineInventory | Version: 1.0*
