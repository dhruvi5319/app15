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
