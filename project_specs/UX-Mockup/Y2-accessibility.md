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
