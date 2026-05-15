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
