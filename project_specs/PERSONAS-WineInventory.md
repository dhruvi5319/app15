# Personas — Wine Inventory App

| Field | Value |
|---|---|
| **Product Name** | Wine Inventory App |
| **Version** | 1.0 |
| **Date** | 2026-05-15 |
| **Related PRD** | `PRD-WineInventory.md` |
| **Status** | Draft |

---

## Persona Summary

| ID | Name | Role | Primary Goal |
|---|---|---|---|
| PER-01 | Marcus Webb | Home Wine Collector | Know exactly what is in his cellar and never duplicate a purchase |
| PER-02 | Sofia Reyes | Restaurant Floor Manager | Keep the wine list accurate and prevent 86'd bottles from reaching guests |
| PER-03 | Priya Nair | Casual Wine Gifter / Occasional Buyer | Log wines she has enjoyed so she can re-buy or recommend them confidently |

---

## PER-01: Marcus Webb

**Role & Context:**
Marcus is a 44-year-old software architect who has been building a home wine cellar for 12 years. His collection sits at roughly 300–400 bottles spread across two under-stair racks and a temperature-controlled cabinet in the garage. He shops at specialty retailers and on winery mailing lists, receiving 3–6 allocation emails per month. Marcus tracks his cellar today using a combination of a Google Sheet he built himself and paper tags on the racks — a system that requires manual reconciliation and frequently falls out of sync. He accesses his collection data mostly on mobile while standing at the rack, and occasionally on desktop when planning purchases.

**Goals:**
- Maintain a single, always-accurate source of truth for his cellar so he can stop reconciling his spreadsheet (F0, F3)
- Find any wine by producer or varietal in under 5 seconds without scrolling the whole list (F2)
- Log tasting impressions immediately after opening a bottle so notes are captured while the experience is fresh (F5)
- Mark a bottle as consumed and retain the tasting note for future reference (F5, F6)
- Know his exact bottle count per wine before placing a new allocation order (F3, F4)

**Pain Points:**
- Spreadsheet and rack tags fall out of sync after purchases and consumption — he routinely discovers bottles he forgot he had (PRD §2: no single source of truth)
- Entering a new wine in his spreadsheet takes 3–5 minutes on mobile due to formatting issues (PRD §2: slow data entry)
- No way to quickly confirm "do I already have this?" while standing in a wine shop (PRD §2: poor discoverability)
- Tasting notes live in a separate notes app, disconnected from inventory — he often cannot match a note back to the correct vintage (PRD §2: disconnected tasting notes)

**Technical Expertise:** High — daily software professional; comfortable with web apps, responsive to keyboard shortcuts and efficient UX patterns; does not want unnecessary friction or onboarding wizards.

**Top Tasks:**
1. Add a newly purchased wine on mobile while still at the shop or arriving home (daily/weekly, critical)
2. Decrement bottle count immediately after opening a bottle (weekly, critical)
3. Search collection by producer or varietal when planning a dinner or purchase (weekly, high)
4. Add a tasting note and rating after finishing a bottle (weekly, high)
5. Browse full inventory to plan upcoming purchases and spot gaps (monthly, medium)

**Success Criteria:**
- Adds a new wine — name, producer, vintage, varietal, region, bottle count — in under 45 seconds on mobile
- Finds any specific wine in under 10 seconds using search or filter
- Zero unsynchronised bottles after 30 days of consistent use (bottle counts match physical rack)
- Every consumed bottle has a retained tasting note accessible in history

---

## PER-02: Sofia Reyes

**Role & Context:**
Sofia is a 31-year-old floor manager at a 60-cover neighbourhood restaurant with a curated list of 80–120 wines. She is responsible for the wine program day-to-day: receiving deliveries, updating the by-the-glass list, briefing servers, and making sure the POS reflects actual stock. The head sommelier sets the list; Sofia keeps it accurate. She updates inventory after deliveries (2–3 times per week) and after service when bottles are 86'd. She works primarily on a tablet behind the bar and occasionally on a desktop in the back office. Speed is critical — she has 5 minutes between tasks, not 30. Her biggest operational risk is a server taking a bottle order to a guest that no longer exists in stock.

**Goals:**
- Update bottle counts after deliveries and consumption without leaving the floor or navigating a complex system (F3, F0)
- Find any wine by producer, varietal, or region within seconds for guest-facing Q&A (F2)
- Immediately flag zero-bottle wines so servers know not to sell them (F3, F1)
- Preserve records of consumed wines for the sommelier's end-of-month review and reorder planning (F6, F5)
- Edit wine records when producers change labels, vintage years turn over, or new allocations arrive (F0)

**Pain Points:**
- Current system (a shared spreadsheet) is edited by multiple people, causing version conflicts and incorrect counts (PRD §2: no single source of truth)
- No visual flag for zero-bottle wines — servers have sold bottles that were already out of stock (PRD §2: no consumption tracking)
- Finding a wine by region or varietal during service means scrolling a 120-row spreadsheet on a phone (PRD §2: poor discoverability)
- Tasting notes from the sommelier are in a separate document, not attached to the wine record (PRD §2: disconnected tasting notes)

**Technical Expertise:** Intermediate — comfortable with tablets and web apps used in hospitality; values simplicity and minimal training time for new staff; frustrated by tools with steep learning curves.

**Top Tasks:**
1. Decrement or zero-out bottle count directly from the list view after a bottle is sold or 86'd (daily, critical)
2. Check stock of a specific wine in under 10 seconds during service (daily, critical)
3. Add delivery wines to inventory after a shipment arrives (2–3× per week, high)
4. Mark depleted wines as consumed/removed so the active list stays clean (weekly, high)
5. Filter list by varietal or region to brief servers on current pours (weekly, medium)

**Success Criteria:**
- Can update a bottle count (single decrement or zero-out) in under 3 taps from the inventory list
- Active inventory list never shows a wine with zero bottles without a consumed/removed badge
- Any wine findable by producer or varietal in under 10 seconds on tablet
- End-of-month consumption history exportable or browsable for reorder planning (via consumed/removed view)

---

## PER-03: Priya Nair

**Role & Context:**
Priya is a 29-year-old marketing manager who has developed a genuine interest in wine over the past three years, mostly through dinner parties and travel. Her "cellar" is a rack of 20–35 bottles she keeps under her kitchen counter. She is not a systematic collector — she buys bottles she likes, gifts them, and occasionally impulse-buys at a restaurant or bottle shop. Her core frustration is that she cannot remember what she has bought, what she has enjoyed, and what she should reorder. She accesses any app entirely on her smartphone and has little patience for complex interfaces. She does not think of herself as a "wine person" yet and will abandon a tool that feels intimidating or requires wine expertise to use.

**Goals:**
- Log a wine she just bought or enjoyed in under 30 seconds on her phone without needing expert knowledge (F0)
- Look back at past tasting notes to decide whether to re-buy or recommend a wine (F5, F4)
- See at a glance what is currently in her rack without scrolling through consumed history (F1, F6)
- Give a wine a quick star rating so she can compare bottles later without writing a full review (F5)

**Pain Points:**
- Currently relies entirely on memory or Instagram stories to remember wines she has enjoyed — no persistent log (PRD §2: no single source of truth)
- Most wine tracking apps she has tried require too many fields and wine-specific knowledge to add a bottle quickly (PRD §2: slow data entry)
- No easy way to separate "bottles I still have" from "bottles I have finished" (PRD §2: no consumption tracking)

**Technical Expertise:** Basic-to-intermediate — uses smartphone apps daily; comfortable with consumer-grade mobile UIs; will not read documentation; expects the app to be self-explanatory on first use.

**Top Tasks:**
1. Add a wine by name only (partial entry) in under 30 seconds on mobile (as-needed, critical)
2. Give a quick star rating immediately after finishing a bottle (as-needed, high)
3. Add a short tasting note while the memory is fresh (as-needed, high)
4. Mark a bottle as consumed to clear it from her active rack view (as-needed, medium)
5. Browse her tasting history to find a wine worth re-buying (monthly, medium)

**Success Criteria:**
- Can add a wine with only the name field filled in within 20 seconds on first use
- Tasting history browsable without needing to toggle away from active inventory
- Star rating addable in one tap from the wine detail page
- Active rack view shows only bottles she still has, with consumed bottles accessible but not cluttering the default view

---

## Persona Relationships

| Interaction | PER-01 Marcus | PER-02 Sofia | PER-03 Priya |
|---|---|---|---|
| **PER-01 Marcus** | — | Independent users; Marcus may inspire Sofia's adoption | Marcus may recommend the app to Priya |
| **PER-02 Sofia** | Independent users | — | Different use context; no direct interaction |
| **PER-03 Priya** | — | — | — |

> Note: v1 is a personal, private inventory tool. All three personas are independent users with no cross-user data access. Relationships reflect adoption patterns, not in-product interaction.

---

## Feature-Persona Matrix

| Feature | Description | PER-01 Marcus | PER-02 Sofia | PER-03 Priya |
|---|---|---|---|---|
| **F0** | Wine Entry & Management | Primary | Primary | Primary |
| **F1** | Wine Inventory List View | Primary | Primary | Primary |
| **F2** | Search & Filter | Primary | Primary | Secondary |
| **F3** | Bottle Count Tracking | Primary | Primary | Secondary |
| **F4** | Wine Detail Page | Primary | Secondary | Secondary |
| **F5** | Tasting Notes & Ratings | Primary | Secondary | Primary |
| **F6** | Consumed / Removed Status | Primary | Primary | Primary |

**Key:**
- **Primary** — Core to this persona's daily use; drives adoption and retention
- **Secondary** — Used by this persona but not a primary driver
- **None** — Not relevant to this persona's use case

---

## Persona Priority Notes

| Persona | Design Priority | Rationale |
|---|---|---|
| PER-01 Marcus | P0 — Lead persona | Highest-frequency user; validates core inventory loop (add → track → consume → note) |
| PER-02 Sofia | P0 — Co-lead persona | Stresses count accuracy and speed under real operational pressure; validates F3 and F6 |
| PER-03 Priya | P1 — Secondary persona | Validates low-friction onboarding and mobile-first partial-entry; critical for activation metric (≥80% add wine in first session) |

---

*Document generated: 2026-05-15 | Project: WineInventory | Version: 1.0*
