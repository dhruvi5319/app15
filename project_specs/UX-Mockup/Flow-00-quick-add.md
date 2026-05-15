---

## User Flows

---

### FLW-01: Quick-Add a Wine (Name Only)

**User Stories:** US-0.1, US-1.3
**Personas:** Priya Nair (primary), Marcus Webb
**Trigger:** User taps "Add Wine" from the home screen or the empty-state CTA button
**Exit:** Wine Detail Page OR back to List View with new wine visible

```
[Home / List View]
    │
    │  Tap "+ Add Wine" button (top-right, always visible)
    ▼
[Add Wine Form — SCR-02]
    │  Name field auto-focused
    │  User types name (required)
    │  Optional fields collapsed ("Add more details ▾")
    │
    ├── [Name is blank / whitespace only]
    │       │
    │       ▼
    │   Inline error: "Name is required"
    │   Submission blocked; user corrects
    │
    ├── [Name filled, tap "Save Wine"]
    │       │
    │       ▼
    │   POST /wines (optimistic)
    │       │
    │       ├── 201 Created ──▶ [Wine Detail Page — SCR-03]
    │       │                        │
    │       │                   Toast: "[Name] added to your cellar"
    │       │                   Prompt: "Want to add a rating?" (inline star tap)
    │       │
    │       └── 422 / 500 ──▶ Inline error on form
    │                          Previous values preserved
    │
    └── [Tap "Cancel" / navigate back]
            │
            ▼
        [List View — no change]
```

**Steps:**
1. User taps the persistent `+ Add Wine` button (max 1 tap from home screen — US-0.1 AC).
2. Add Wine form opens with **name field auto-focused**; keyboard appears immediately on mobile.
3. User types the wine name. All other fields are collapsed below a "Add more details ▾" toggle.
4. User taps "Save Wine". Client validates: name non-empty, non-whitespace.
5. On validation failure: inline error "Name is required" appears below the field; form stays open.
6. On success: `POST /wines` with `{ name, bottle_count: 1, status: "active" }`.
7. User is navigated to the Wine Detail Page. Toast appears: *"[Wine Name] added to your cellar."*
8. A soft prompt on the detail page: *"Want to add a rating while you remember?"* — one-tap star selector.

**Key UX Decisions:**
- Optional fields are **collapsed by default** (progressive disclosure) — Priya never sees vintage/varietal unless she wants to. This is the JRN-03.1 critical path.
- The `+ Add Wine` button is **always visible** on the list view header — no more than 1 tap to reach the form (US-0.1 AC: ≤ 2 taps from home screen).
- After save, user goes to **Wine Detail** rather than staying on the form, so they can immediately add a rating inline (JRN-03.1 delight moment).

---

### FLW-02: Full-Details Wine Entry

**User Stories:** US-0.2
**Personas:** Marcus Webb (primary)
**Trigger:** User opens Add Wine form and expands optional fields
**Exit:** Wine Detail Page with all fields populated

```
[Add Wine Form — SCR-02]
    │
    │  Name (required) filled
    │  Taps "Add more details ▾"
    │
    ▼
[Expanded Form Fields]
    │  Producer, Vintage, Varietal, Region, Bottle Count
    │  All optional; Bottle Count defaults to 1
    │
    ├── [Vintage out of range 1800–(year+5)]
    │       └── Inline error: "Vintage must be between 1800 and [year]"
    │
    ├── [Bottle count < 1 or > 9999]
    │       └── Inline error: "Bottle count must be between 1 and 9999"
    │
    ├── [String field > 255 chars]
    │       └── Inline error: "[Field] must be 255 characters or fewer"
    │
    └── [All valid → Save Wine]
            │
            ▼
        POST /wines (full payload)
            │
            ├── 201 Created ──▶ Wine Detail Page
            │                   Toast: "6 bottles of [Name] added"
            └── Error ──▶ Inline errors; values preserved
```

**Steps:**
1. From Add Wine form, user taps "Add more details ▾" to expand the optional fields section.
2. Fields revealed: Producer, Vintage (integer), Varietal, Region, Bottle Count (integer, default 1).
3. Client validates each field on blur (not on change, to avoid jarring errors while typing).
4. Vintage field: numeric keyboard on mobile; rejects non-integers and values outside 1800–(current year + 5).
5. Bottle Count: numeric keyboard; defaults to 1 if left empty; range 1–9999 on create.
6. On save: `POST /wines` with full payload. Server returns `201` with `id`, `date_added`, `date_updated`.
7. Navigation to Wine Detail Page. Toast: *"[N] bottle(s) of [Name] added."*

---
