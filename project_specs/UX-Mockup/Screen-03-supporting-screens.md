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
