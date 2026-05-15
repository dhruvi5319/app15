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
