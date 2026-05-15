# Jobs-to-be-Done — Wine Inventory App

| Field | Value |
|---|---|
| **Product Name** | Wine Inventory App |
| **Version** | 1.0 |
| **Date** | 2026-05-15 |
| **Related Personas** | `PERSONAS-WineInventory.md` |
| **Related PRD** | `PRD-WineInventory.md` |
| **Status** | Draft |

---

## JTBD Summary Table

| JTBD-ID | Persona | Job Statement (abbreviated) | Priority |
|---|---|---|---|
| JTBD-01.1 | PER-01 Marcus Webb | Maintain a single, always-current cellar record to eliminate spreadsheet reconciliation | P0 |
| JTBD-01.2 | PER-01 Marcus Webb | Capture tasting impressions the moment a bottle is opened so notes stay tied to the wine | P1 |
| JTBD-01.3 | PER-01 Marcus Webb | Assess inventory gaps before placing allocation orders to avoid duplicates | P0 |
| JTBD-02.1 | PER-02 Sofia Reyes | Keep bottle counts accurate in real time during service to prevent selling out-of-stock wines | P0 |
| JTBD-02.2 | PER-02 Sofia Reyes | Surface any wine by varietal or region within seconds to answer guest questions confidently | P0 |
| JTBD-02.3 | PER-02 Sofia Reyes | Preserve a clean consumption history so reorder planning and sommelier reviews are effortless | P1 |
| JTBD-03.1 | PER-03 Priya Nair | Log a wine she just tried or bought before the moment passes without needing wine expertise | P0 |
| JTBD-03.2 | PER-03 Priya Nair | Revisit past impressions to decide confidently whether to re-buy or gift a bottle | P1 |
| JTBD-03.3 | PER-03 Priya Nair | See only bottles she currently owns so her rack view stays clear and actionable | P1 |

---

## PER-01: Marcus Webb — Home Wine Collector

### JTBD-01.1: Eliminate Spreadsheet Reconciliation

**Job Statement:**
When I return home with a new purchase or open a bottle from the rack, I want to update my cellar record in under a minute on my phone, so I can maintain a single always-accurate source of truth and stop cross-referencing two out-of-sync systems.

**Current Alternatives:**
- Manually updates a Google Sheet on desktop, then re-checks paper rack tags — takes 3–5 minutes per wine on mobile due to formatting friction
- Periodically does a full physical-vs-spreadsheet reconciliation that takes 30+ minutes and still produces errors

**Hiring Criteria:**
- Accepts a new wine entry with name, producer, vintage, varietal, region, and bottle count in under 45 seconds on mobile
- All required fields are pre-validated; only wine name is mandatory (partial entry allowed)
- Single tap to decrement a bottle count directly from the inventory list without opening the full edit screen
- Collection data is persistent, cloud-backed, and never requires manual reconciliation across devices

**Success Measure:** After 30 days of consistent use, zero discrepancies between app bottle counts and physical rack count.

**Related Features:** F0, F1, F3
**Priority:** P0

---

### JTBD-01.2: Capture Tasting Impressions In the Moment

**Job Statement:**
When I finish a bottle and the flavours are still fresh, I want to add a tasting note and rating directly on the wine record in under 30 seconds, so I can build a searchable personal journal that travels with the inventory and not in a disconnected notes app.

**Current Alternatives:**
- Dictates or types a note into Apple Notes or a generic notes app, then loses the link back to the specific wine and vintage
- Relies on memory; reviews a bottle weeks later with no reference point, leading to repeated misjudgements on repurchases

**Hiring Criteria:**
- Free-text note field and star rating accessible from the wine detail page without navigating to an edit form
- Notes and ratings persist on the record after the wine is marked as consumed or removed
- Note entry is reachable in no more than 2 taps from the inventory list

**Success Measure:** ≥ 90% of wines Marcus marks as consumed have a tasting note attached, measured at 60-day cohort review.

**Related Features:** F4, F5, F6
**Priority:** P1

---

### JTBD-01.3: Assess Collection Before Placing an Allocation Order

**Job Statement:**
When I receive a winery allocation email and need to decide how many bottles to order, I want to see my current count for that producer and varietal in under 10 seconds, so I can make a purchase decision based on fact rather than guesswork and avoid duplicating a wine I already have plenty of.

**Current Alternatives:**
- Searches his Google Sheet on desktop while the email is open on his phone — two devices, slow context-switch
- Eyeballs the rack and estimates; frequently orders duplicates he discovers weeks later

**Hiring Criteria:**
- Free-text search returns matching wines (by producer, varietal, or region) in under 500ms with real-time results
- Search and filter combinable — can narrow to a producer AND a specific varietal simultaneously
- Bottle count per wine visible on the list row without needing to open the detail page

**Success Measure:** Marcus can identify his current stock for any producer and varietal combination in under 10 seconds from the inventory list on mobile.

**Related Features:** F2, F1, F3
**Priority:** P0

---

## PER-02: Sofia Reyes — Restaurant Floor Manager

### JTBD-02.1: Keep Bottle Counts Accurate During Live Service

**Job Statement:**
When a bottle is sold, 86'd, or received in a delivery during a service shift, I want to update the count in under 3 taps from the inventory list without leaving the floor, so I can prevent servers from selling bottles that no longer exist and keep the POS aligned with physical stock.

**Current Alternatives:**
- Edits a shared Google Sheet on a phone or tablet — multiple staff editing simultaneously causes version conflicts and incorrect counts
- Uses a paper count clipboard during service, then reconciles with the spreadsheet later — counts drift between updates, causing stock-out incidents

**Hiring Criteria:**
- Single-tap increment/decrement directly on the inventory list row — no navigation to a detail or edit page required
- Zero-bottle wines are immediately and visibly flagged (e.g. "Empty" badge or greyed-out row) so servers can see stock status at a glance
- System enforces that bottle counts cannot go below zero, preventing negative-count data corruption

**Success Measure:** Zero incidents of a server presenting a wine to a guest that shows zero stock in the app, measured over a 30-day operational period.

**Related Features:** F1, F3
**Priority:** P0

---

### JTBD-02.2: Find Any Wine in Seconds During Guest Service

**Job Statement:**
When a guest asks about a specific varietal, region, or wine while I am on the floor, I want to find a matching wine record in under 10 seconds on my tablet, so I can give a confident, accurate answer without fumbling through a 120-row spreadsheet or leaving the table.

**Current Alternatives:**
- Scrolls a 120-row shared spreadsheet on a phone, filtering manually by eye — takes 30–60 seconds and is error-prone under service pressure
- Asks the head sommelier for help, creating bottlenecks during busy service periods

**Hiring Criteria:**
- Free-text search across wine name, producer, and region with results updating in real time (no page reload)
- Filter by varietal and region combinable in a single interaction
- Search results display bottle count per match so Sofia can confirm availability immediately
- Accessible in no more than 2 taps from the main inventory screen

**Success Measure:** Any wine findable by varietal or region in under 10 seconds on a tablet during a simulated service scenario.

**Related Features:** F2, F1
**Priority:** P0

---

### JTBD-02.3: Maintain Consumption History for Reorder Planning

**Job Statement:**
When the end-of-month reorder review arrives or the head sommelier asks what has been consumed, I want to browse or export a complete history of wines that have been marked as consumed or removed, so I can support purchasing decisions and staff briefings without reconstructing data from memory or paper logs.

**Current Alternatives:**
- Reconstructs consumption from memory and scattered spreadsheet edits — unreliable and time-consuming
- Cross-references paper delivery notes with the spreadsheet — labour-intensive, error-prone, and dependent on finding the physical documents

**Hiring Criteria:**
- Consumed and removed wines are preserved in a dedicated history view, separate from the active inventory list
- History view browsable by date marked consumed, producer, or varietal
- Tasting notes and ratings attached to consumed wines remain accessible in the history view
- History accessible from the main inventory screen in no more than 2 taps

**Success Measure:** End-of-month consumption history is fully browsable without manual reconstruction; sommelier review requires zero supplementary spreadsheet lookups.

**Related Features:** F5, F6, F4
**Priority:** P1

---

## PER-03: Priya Nair — Casual Wine Gifter / Occasional Buyer

### JTBD-03.1: Log a Wine Before the Moment Passes

**Job Statement:**
When I am at a restaurant, a friend's dinner, or just opening a bottle at home, I want to log the wine by name alone in under 30 seconds on my phone without needing to know the varietal or region, so I have a persistent record I can revisit later instead of relying on Instagram stories and memory that fade within days.

**Current Alternatives:**
- Posts a photo of the bottle to Instagram Stories — disappears after 24 hours and is unsearchable
- Types a reminder into her phone's Notes app — unstructured, not linked to any wine data, and forgotten within weeks
- Tries full-featured wine apps that require varietal, region, and vintage before saving — abandons the entry halfway through

**Hiring Criteria:**
- Wine name is the only required field; all other fields (producer, vintage, varietal, region) are optional
- New wine addable in under 20 seconds on first use with no prior onboarding required
- Add flow is a single screen on mobile — no multi-step wizard or mandatory field validation beyond name
- Entry form is self-explanatory with no wine-specific jargon in required field labels

**Success Measure:** ≥ 80% of first-time users successfully add a wine in their first session (activation metric); median time-to-first-wine ≤ 20 seconds for Priya-profile users.

**Related Features:** F0
**Priority:** P0

---

### JTBD-03.2: Revisit Past Impressions to Decide Whether to Re-buy

**Job Statement:**
When I am at a bottle shop or considering a wine for a dinner party, I want to look up what I thought of a bottle I had months ago including my rating and any note I wrote, so I can make a confident re-buy or gift recommendation without second-guessing my memory.

**Current Alternatives:**
- Tries to recall impressions of a bottle she had 3 months ago — usually cannot remember beyond "I liked it"
- Texts friends who were at the dinner to ask if they remember the wine — unreliable and slow
- Re-buys bottles she is unsure about, sometimes disappointed when they do not match her memory

**Hiring Criteria:**
- Tasting history browsable as a distinct view without toggling away from the active inventory
- Star rating visible on the wine list row without opening the detail page
- Tasting note and rating persist after a wine is marked as consumed
- Search works against consumed history as well as active inventory so she can find a bottle by partial name recall

**Success Measure:** Priya can retrieve a rating and tasting note for any wine she logged in under 15 seconds from her tasting history view.

**Related Features:** F4, F5, F6
**Priority:** P1

---

### JTBD-03.3: Keep Her Active Rack View Clean and Uncluttered

**Job Statement:**
When I open the app to check what I have at home, I want to see only the bottles I currently own without finished or gifted wines cluttering the list, so I can make a quick decision about what to open tonight without mentally filtering out bottles I no longer have.

**Current Alternatives:**
- Has no inventory system — guesses what is under the counter until she physically checks
- Uses a generic list app that mixes current and finished bottles, requiring manual scrolling and mental filtering

**Hiring Criteria:**
- Default inventory view shows only active (unconsumed) bottles
- Marking a bottle as consumed or removed requires no more than 2 taps from the list view
- Consumed wines are accessible in a history view but do not appear in the default list
- Option to revert a consumed wine to active if marked in error (undo / restore)

**Success Measure:** After one month of use, Priya's default inventory list contains zero bottles she no longer owns; consumed history is accessible with one additional tap.

**Related Features:** F1, F3, F6
**Priority:** P1

---

## Outcome-to-Feature Traceability

| JTBD-ID | Related Feature(s) | Expected Outcome |
|---|---|---|
| JTBD-01.1 | F0, F1, F3 | Single cellar record always matches physical rack; zero reconciliation effort |
| JTBD-01.2 | F4, F5, F6 | Every consumed wine has a tasting note retained in history |
| JTBD-01.3 | F1, F2, F3 | Pre-purchase stock lookup completes in under 10 seconds |
| JTBD-02.1 | F1, F3 | Zero out-of-stock wines sold during service; counts enforced ≥ 0 |
| JTBD-02.2 | F1, F2 | Any wine located by varietal or region in under 10 seconds on tablet |
| JTBD-02.3 | F4, F5, F6 | Full consumption history browsable; no manual reconstruction required |
| JTBD-03.1 | F0 | ≥ 80% activation rate; median first-wine entry ≤ 20 seconds |
| JTBD-03.2 | F4, F5, F6 | Rating and note retrievable from history in under 15 seconds |
| JTBD-03.3 | F1, F3, F6 | Default view shows zero consumed bottles; history accessible in 1 tap |

---

## NaC Preview

Natural Acceptance Criteria candidates for downstream STORY-MAP generation.

| JTBD-ID | Outcome | Candidate Natural Acceptance Criterion |
|---|---|---|
| JTBD-01.1 | Zero reconciliation after 30 days | Given Marcus logs all purchases and consumption for 30 days, when he compares app counts to his physical rack, then every bottle count matches with zero discrepancies |
| JTBD-01.1 | Mobile add in ≤ 45 seconds | Given Marcus is on mobile, when he adds a new wine with all six fields, then the entry is saved in under 45 seconds from opening the add form |
| JTBD-01.2 | Note captured on consumed wine | Given Marcus marks a wine as consumed, when he views it in history, then the tasting note and rating he entered are visible and unchanged |
| JTBD-01.3 | Producer search in ≤ 10 seconds | Given Marcus types a producer name in the search field, when results appear, then all matching wines show their current bottle count within 10 seconds |
| JTBD-02.1 | Count decremented in ≤ 3 taps | Given Sofia is on the inventory list view, when she decrements a bottle count for a sold wine, then the updated count is saved in 3 taps or fewer without navigating away from the list |
| JTBD-02.1 | Zero-bottle wines visually flagged | Given a wine reaches zero bottles, when Sofia views the inventory list, then the wine displays an "Empty" badge or equivalent visual indicator immediately |
| JTBD-02.2 | Varietal filter returns results in ≤ 10 seconds | Given Sofia applies a varietal filter on a list of 120 wines, when results load, then only matching wines are shown with bottle counts visible within 10 seconds |
| JTBD-02.3 | Consumption history browsable | Given a wine has been marked consumed, when Sofia navigates to the consumption history view, then the wine record including tasting note and marked-consumed date is visible |
| JTBD-03.1 | Name-only add in ≤ 20 seconds on first use | Given a first-time user opens the add wine screen, when they enter only the wine name and submit, then the wine is saved and visible in inventory within 20 seconds |
| JTBD-03.2 | Tasting note retrievable from history | Given Priya opens her tasting history, when she taps a consumed wine, then its rating and tasting note are displayed on the detail page |
| JTBD-03.3 | Default list excludes consumed bottles | Given Priya has marked two wines as consumed, when she views the default inventory screen, then those wines do not appear in the list and her active count reflects only bottles she still owns |

---

*Document generated: 2026-05-15 | Project: WineInventory | Version: 1.0*
