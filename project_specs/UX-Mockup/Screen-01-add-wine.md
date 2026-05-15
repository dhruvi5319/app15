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
