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
