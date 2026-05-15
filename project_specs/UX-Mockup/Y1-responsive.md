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
