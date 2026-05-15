# UX Mockup — Wine Inventory App

**Project:** WineInventory
**Generated:** 2026-05-15
**Based on:** UserStories-WineInventory.md v1.0, PRD-WineInventory.md v1.0, FRD-WineInventory.md v1.0, JOURNEYS-WineInventory.md v1.0

---

## Overview

### UX Approach

The Wine Inventory App serves three distinct personas with different urgency profiles:

- **Marcus Webb** (home collector) — thoughtful, desktop-comfortable, wants completeness
- **Sofia Reyes** (restaurant floor manager) — high-pressure, tablet-first, needs sub-5-second actions
- **Priya Nair** (casual buyer) — low commitment, mobile, must not be blocked by friction

The design philosophy derives from six cross-journey patterns identified in the Journey Maps:

1. **Speed-of-capture is the make-or-break moment** (CP-01) — the app must be usable within 2 seconds of opening; any screen that requires navigation before the first useful action will cause abandonment.
2. **Bottle count on every list row** (CP-02) — eliminates a navigation step in 5 of 7 journeys. Non-negotiable.
3. **Search spans active and consumed inventory** (CP-03) — if search only covers active wines, the re-buy use case (JRN-03.2) breaks entirely.
4. **Inline controls eliminate navigation tax** (CP-04) — decrement, star rating, and note quick-add must all be reachable within 1–2 taps without a separate form.
5. **The Empty badge as a trust signal** (CP-05) — zero-bottle wines must display a bold, high-contrast badge the moment count hits zero.
6. **History one tap away** (CP-06) — consumed/removed view reachable in exactly 1 additional tap from the main screen.

### Design Principles

| Principle | Rationale |
|-----------|-----------|
| **Progressive disclosure** | Name is all that's required; optional fields are accessible but never block save |
| **Optimistic UI** | Bottle count changes reflect immediately; rollback only on server error |
| **Inline over navigate** | Every mutation accessible without leaving the current screen where possible |
| **Visual status at a glance** | Zero-bottle "EMPTY" badge, status banner on consumed/removed wines, match count on search |
| **Mobile-first, tablet-aware** | Tap targets ≥ 44px; search bar persistent; layout adapts to tablet (Sofia's primary device) |

### Screen Inventory

| Screen ID | Screen Name | Primary Feature |
|-----------|-------------|-----------------|
| SCR-01 | Inventory List View | F1, F2, F3 |
| SCR-02 | Add Wine Form | F0 |
| SCR-03 | Wine Detail Page | F4, F3, F5, F6 |
| SCR-04 | Edit Wine Form | F0 |
| SCR-05 | Search & Filter Panel | F2 |
| SCR-06 | History View | F6 |
| SCR-07 | Delete Confirmation Dialog | F0 |
| SCR-08 | Empty State | F1 |

### Flow Inventory

| Flow ID | Flow Name | Primary Stories |
|---------|-----------|-----------------|
| FLW-01 | Quick-Add a Wine (name only) | US-0.1, US-1.1, US-1.3 |
| FLW-02 | Full-Details Wine Entry | US-0.2 |
| FLW-03 | Search & Filter Inventory | US-2.1, US-2.2, US-2.3, US-2.4 |
| FLW-04 | Bottle Count Update (inline) | US-3.1, US-3.2, US-3.4 |
| FLW-05 | Open Bottle & Capture Note | US-5.1, US-5.2, US-6.1 |
| FLW-06 | Mark Consumed / Removed | US-6.1, US-6.2, US-6.3 |
| FLW-07 | Browse History & Retrieve Note | US-6.4, US-4.1, US-5.4 |

---
