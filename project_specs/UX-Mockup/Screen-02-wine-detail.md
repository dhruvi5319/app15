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
