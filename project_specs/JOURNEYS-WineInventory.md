# User Journey Maps — Wine Inventory App

| Field | Value |
|---|---|
| **Product Name** | Wine Inventory App |
| **Version** | 1.0 |
| **Date** | 2026-05-15 |
| **Related Personas** | `PERSONAS-WineInventory.md` |
| **Related JTBD** | `JTBD-WineInventory.md` |
| **Related PRD** | `PRD-WineInventory.md` |
| **Status** | Draft |

---

## Journey Index

| JRN-ID | Persona | Scenario | Key JTBD | Stages |
|---|---|---|---|---|
| JRN-01.1 | PER-01 Marcus Webb | Adding a new allocation purchase on mobile at the shop | JTBD-01.1 | 5 |
| JRN-01.2 | PER-01 Marcus Webb | Opening a bottle and capturing a tasting note | JTBD-01.2 | 5 |
| JRN-01.3 | PER-01 Marcus Webb | Pre-purchase inventory check before responding to a winery email | JTBD-01.3 | 5 |
| JRN-02.1 | PER-02 Sofia Reyes | Decrementing stock during live dinner service after a bottle is sold | JTBD-02.1 | 5 |
| JRN-02.2 | PER-02 Sofia Reyes | Looking up a wine by varietal to answer a guest question at the table | JTBD-02.2 | 4 |
| JRN-03.1 | PER-03 Priya Nair | Logging a wine at a restaurant before the moment passes | JTBD-03.1 | 5 |
| JRN-03.2 | PER-03 Priya Nair | Revisiting tasting history to decide whether to re-buy a bottle | JTBD-03.2 | 5 |

---

## PER-01: Marcus Webb — Home Wine Collector

---

### JRN-01.1: Adding a New Allocation Purchase on Mobile

**Persona:** PER-01 (Marcus Webb)

**Scenario:** Marcus has just picked up six bottles from a specialty retailer after responding to an allocation email. Standing near the car in the parking lot, he wants to log all six bottles before driving home — because if he waits until he gets to his garage he will forget details like the exact vintage. He pulls out his phone and opens the app.

**Related Jobs:** JTBD-01.1

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Puts bottles in the car; pulls out phone while the label is still in hand | Mobile home screen / app icon | "I need to log these now before I lose the details — vintage, producer, the lot" | Motivated but slightly rushed | Has historically forgotten to log until later, causing spreadsheet drift | App shortcut or home-screen widget for instant one-tap "Add Wine" |
| **Add Wine** | Taps "Add Wine," fills in name, producer, vintage, varietal, region, sets count to 6 | F0 — Add Wine form (mobile) | "Okay: name, producer, 2022, Cabernet, Napa — done. Am I missing anything?" | Focused, efficient | Labels are small; typing on mobile while standing is mildly awkward | Large tap targets, smart autocomplete for producer and varietal names |
| **Save & Confirm** | Taps Save; sees wine appear in inventory list | F1 — Inventory list | "Good — it's in there. Count shows 6." | Satisfied, slightly relieved | Used to worry the entry did not save without visual feedback | Instant in-list confirmation toast: "6 bottles added — [Wine Name]" |
| **Verify Count** | Scrolls to the new entry; confirms the count matches the bottles in hand | F1 — Inventory list, F3 — Bottle count | "Does it show 6? Yes. And my total Cab count is now 14 — that seems right." | Confident | Had to mentally cross-check against old spreadsheet; no longer needed | Running total or "Collection at a glance" summary on the list header |
| **Close & Go** | Locks phone, puts it away, drives home | — | "Done. My record is up to date before I even get home." | Relieved, trusts the system | If something failed silently, he would only discover the discrepancy days later | Offline-first saving with sync indicator so Marcus trusts the record was captured |

#### Key Moments

- **Decision Point:** Trigger stage — if the add form feels slow to load or login is required again, Marcus aborts and falls back to his mental note / spreadsheet.
- **Risk of Abandonment:** Add Wine stage — if too many mandatory fields block save, Marcus will skip logging and the cellar drifts immediately.
- **Delight Opportunity:** Save & Confirm stage — a fast, clear confirmation with the bottle count visible closes the loop emotionally and builds trust in the system.

#### Success Outcome

Marcus adds all six bottles — name, producer, vintage, varietal, region, bottle count = 6 — in under 45 seconds on mobile before leaving the parking lot. (JTBD-01.1 success measure: zero discrepancies after 30 days of consistent use.)

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | App launch / home screen |
| Add Wine | F0 (Wine Entry & Management) |
| Save & Confirm | F1 (Inventory List View) |
| Verify Count | F1 (Inventory List View), F3 (Bottle Count Tracking) |
| Close & Go | F0 (offline persistence) |

---

### JRN-01.2: Opening a Bottle and Capturing a Tasting Note

**Persona:** PER-01 (Marcus Webb)

**Scenario:** It is Saturday evening. Marcus opens a 2019 Barolo he has been aging for four years. He pours a glass, and while the wine is still open and his impressions are vivid, he wants to decrement the bottle count and write a tasting note — ideally without leaving the dinner table for more than 30 seconds.

**Related Jobs:** JTBD-01.2, JTBD-01.1

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Finishes the bottle; picks up his phone at the table | Mobile home screen | "I should note this before I forget — the tannins were really something tonight." | Reflective, slightly impatient (guests present) | In the past, notes ended up in Apple Notes, orphaned from the wine record | "Quick note" shortcut from inventory list without opening the detail page |
| **Find the Wine** | Searches "Barolo 2019" in the search bar; taps the result | F2 — Search, F4 — Wine Detail | "There it is — three bottles left before I open this one." | Focused | If search is slow or requires exact name, it breaks the flow at the dinner table | Real-time search with fuzzy matching; recent wines surfaced at top |
| **Decrement Count** | Taps the "−" button directly on the list row or detail page | F3 — Bottle Count, F4 — Wine Detail | "Now it's two. Good — I don't have to manually edit anything." | Satisfied | Previously had to open edit form, change the number, save — three extra steps | Single-tap decrement with count update visible instantly on the same screen |
| **Add Tasting Note** | Types a 2-sentence tasting note; selects 4 stars | F5 — Tasting Notes & Ratings | "Dark fruit, dried roses, grippy tannins — needs another year but delicious. Four stars." | Engaged, creative | Without an attached note field, the impression would live in a different app and never be found again | Note field opens inline on detail page — no navigation to an edit form; autosave on blur |
| **Mark as Consumed** | Taps "Mark as Consumed"; wine moves to history | F6 — Consumed / Removed Status | "This bottle is done — but I want the note to stay in history." | Relieved, nostalgic | Fear that marking consumed deletes the tasting note | Clear UI confirmation: "This wine is now in your history. Your note and rating are saved." |

#### Key Moments

- **Decision Point:** Add Tasting Note stage — if the note field requires navigating away from the detail page, Marcus skips it entirely (guests are present).
- **Risk of Abandonment:** Find the Wine stage — slow search or forced exact-match breaks the mood; Marcus abandons and types into Apple Notes instead.
- **Delight Opportunity:** Mark as Consumed stage — a warm confirmation that the note is preserved ("Your memory of this bottle is saved") reinforces the app as a personal wine journal.

#### Success Outcome

Marcus decrements the bottle count, writes a tasting note, and marks the wine consumed — all within 30 seconds from the detail page — and confirms the note is accessible in history. (JTBD-01.2 success measure: ≥ 90% of consumed wines have a tasting note at 60-day cohort review.)

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | App launch |
| Find the Wine | F2 (Search & Filter), F4 (Wine Detail Page) |
| Decrement Count | F3 (Bottle Count Tracking), F4 (Wine Detail Page) |
| Add Tasting Note | F5 (Tasting Notes & Ratings) |
| Mark as Consumed | F6 (Consumed / Removed Status) |

---

### JRN-01.3: Pre-Purchase Inventory Check Before Responding to a Winery Email

**Persona:** PER-01 (Marcus Webb)

**Scenario:** Marcus is at his desk on a Tuesday morning. He receives a winery allocation email offering a 2022 Russian River Pinot Noir he has bought before. He needs to decide in the next 10 minutes whether to order 3, 6, or 0 bottles. The answer depends on how many he already has from that producer and varietal.

**Related Jobs:** JTBD-01.3

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Reads the allocation email; opens the app in a second browser tab | Desktop browser / F1 — Inventory list | "How many Russian River Pinots do I already have? And what else from this producer?" | Curious, slightly time-pressured | Used to switch between two tabs and a spreadsheet — slow and error-prone | Deep link from email or browser bookmark that opens the app directly to filtered results |
| **Search by Producer** | Types producer name in search field; sees filtered list appear | F2 — Search & Filter | "Okay — I can see four wines from this producer. Two are the 2021 Pinot (3 bottles left) and the 2020 estate..." | Focused | If search requires exact spelling, partial producer name returns no results | Fuzzy / partial-match search so "Russian River" returns all regional matches |
| **Refine Filter** | Adds varietal filter "Pinot Noir" to narrow results further | F2 — Search & Filter | "Now I can see I have 3 of the 2021 and 2 of the 2020 — that's already 5 Pinots from this region." | Confident, analytical | Without combinable filters, has to eyeball the full producer list manually | Inline filter chips that update the list instantly; match count displayed |
| **Assess & Decide** | Reviews bottle counts per wine directly from the list; makes purchase decision | F1 — Inventory list, F3 — Bottle count | "I have 5 bottles already. I'll order 3 of the 2022 to stay at a comfortable depth." | Decisive | In the old spreadsheet, counts required opening the row — extra click | Bottle count visible on every list row without opening detail page |
| **Return to Email** | Switches back to email; places the allocation order | External (email client) | "Done — decision made in under 2 minutes, no guesswork." | Satisfied, efficient | Previous flow: 10–15 minutes of spreadsheet hunting | — |

#### Key Moments

- **Decision Point:** Search by Producer stage — if search returns irrelevant results or requires exact name, Marcus loses confidence in the data and defaults to guessing.
- **Delight Opportunity:** Assess & Decide stage — seeing all counts on the list row without clicking into each wine is the core time-saving moment that makes the app superior to a spreadsheet.
- **Risk of Abandonment:** Refine Filter stage — if filters are hidden or hard to combine, Marcus skips filtering, scrolls the whole list, and concludes "this is not faster than my spreadsheet."

#### Success Outcome

Marcus identifies his current Pinot Noir stock from the target producer in under 10 seconds from the inventory list on desktop. (JTBD-01.3 success measure: producer and varietal lookup completes in under 10 seconds.)

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | F1 (Inventory List View) |
| Search by Producer | F2 (Search & Filter) |
| Refine Filter | F2 (Search & Filter) |
| Assess & Decide | F1 (Inventory List View), F3 (Bottle Count Tracking) |
| Return to Email | — |

---

## PER-02: Sofia Reyes — Restaurant Floor Manager

---

### JRN-02.1: Decrementing Stock During Live Dinner Service

**Persona:** PER-02 (Sofia Reyes)

**Scenario:** It is a Friday service. Sofia is behind the bar managing the floor when a server calls out that the last bottle of the 2020 Burgundy was just sold and served. Sofia has her tablet in hand. She needs to zero out that wine in under 10 seconds and make sure it shows as "Empty" before the next server checks stock.

**Related Jobs:** JTBD-02.1

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Server calls out the last Burgundy; Sofia picks up tablet | Tablet / F1 — Inventory list | "I need to mark that zero right now before anyone else tries to sell it." | Alert, slightly stressed | In the shared spreadsheet, someone else might edit simultaneously and overwrite her update | Optimistic concurrency with last-write-wins and a visible "updated by" timestamp |
| **Locate Wine** | Scrolls or searches for "2020 Burgundy" on the inventory list | F1 — Inventory list, F2 — Search | "Where is it — ah, there. Still shows 1 bottle." | Focused, impatient | Scrolling a 120-row list on a tablet under service pressure is error-prone | Persistent search bar at top of list; recent/frequently-accessed wines surfaced first |
| **Decrement to Zero** | Taps the "−" button on the list row once; count drops to 0 | F3 — Bottle Count Tracking | "One tap. Count is now zero." | Briefly relieved | If decrement is buried behind an edit screen, costs 3–5 extra taps during busy service | Inline "−" and "+" controls on every list row — no navigation required |
| **Confirm Empty Badge** | Sees the wine row display an "Empty" badge or greyed-out state | F3 — Bottle Count Tracking, F1 — List View | "Good — servers can see that at a glance. They won't try to sell it." | Satisfied, confident | Without a visual flag, another server might check stock and still attempt to serve the wine | Bold "EMPTY" badge in a high-contrast colour (e.g., amber/red) visible at a glance |
| **Resume Service** | Puts tablet down; continues managing the floor | — | "That's done. One fewer thing to worry about tonight." | Settled | Used to have to find a quiet moment to update the spreadsheet later — counts drifted in the meantime | Real-time sync so all tablet/phone instances show the updated count immediately |

#### Key Moments

- **Decision Point:** Locate Wine stage — if Sofia cannot find the wine in under 5 seconds, she mentally defers the update to "after service," and the count drifts.
- **Risk of Abandonment:** Decrement to Zero stage — if the tap target is too small on a tablet or requires confirmation dialogs, she skips the update and the list becomes unreliable.
- **Delight Opportunity:** Confirm Empty Badge stage — the instant visual flag is the single most trust-building moment for Sofia; it proves the system works faster than a spreadsheet.

#### Success Outcome

Sofia decrements the bottle count to zero and sees the "Empty" badge in 3 taps or fewer, without leaving the inventory list view. (JTBD-02.1 success measure: zero incidents of a server presenting an out-of-stock wine over a 30-day period.)

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | Tablet app launch / active session |
| Locate Wine | F1 (Inventory List View), F2 (Search & Filter) |
| Decrement to Zero | F3 (Bottle Count Tracking) |
| Confirm Empty Badge | F3 (Bottle Count Tracking), F1 (Inventory List View) |
| Resume Service | — |

---

### JRN-02.2: Looking Up a Wine During Guest Service

**Persona:** PER-02 (Sofia Reyes)

**Scenario:** A guest at table 7 asks whether the restaurant has "something from Burgundy, preferably a Pinot Noir, under £80." Sofia is standing tableside with her tablet. She has roughly 15 seconds before the pause becomes awkward. She needs to surface matching wines with bottle counts visible.

**Related Jobs:** JTBD-02.2

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Guest asks; Sofia opens the app search | F2 — Search & Filter (tablet) | "Burgundy Pinot Noir — let me pull that up right now." | Composed, slightly pressured | Old flow required scrolling a 120-row spreadsheet, taking 30–60 seconds — embarrassing at the table | One-tap search open from any screen; keyboard auto-focuses on search field |
| **Enter Search Terms** | Types "Burgundy" in search; applies varietal filter "Pinot Noir" | F2 — Search & Filter | "Is there a quick way to add the region and varietal at once? Okay — there are the results." | Focused | If multi-filter requires multiple steps, loses precious seconds | Combined filter chips: tap region and varietal simultaneously; results live-update |
| **Review Results** | Sees 3 matching wines with bottle counts on each row | F1 — Inventory list, F3 — Bottle count | "Two have stock. One is empty — I will skip that one. The 2019 Gevrey looks perfect." | Confident | Without bottle count on the list row, has to tap into each wine to check availability | Bottle count and "Empty" badge visible on list row; empty wines visually dimmed |
| **Respond to Guest** | Describes the two available options to the guest; takes the order | Verbal / tableside | "I can confidently recommend what is actually in stock — no awkward 'let me check the back' moment." | Professional, assured | Previously relied on memory or had to ask the sommelier — created dependency | — |

#### Key Moments

- **Decision Point:** Enter Search Terms stage — if filter interaction requires more than 2 taps to combine region + varietal, Sofia abandons and guesses, risking recommending an out-of-stock wine.
- **Delight Opportunity:** Review Results stage — seeing bottle counts directly on the list row (including the "Empty" badge) lets Sofia filter options confidently at tableside without a second lookup.
- **Risk of Abandonment:** Trigger stage — if the app requires re-authentication or is slow to load, Sofia closes it and relies on memory.

#### Success Outcome

Sofia finds all available Burgundy Pinot Noir wines with bottle counts in under 10 seconds on a tablet at tableside. (JTBD-02.2 success measure: any wine findable by varietal or region in under 10 seconds during a simulated service scenario.)

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | App active session / F2 (Search & Filter) |
| Enter Search Terms | F2 (Search & Filter) |
| Review Results | F1 (Inventory List View), F3 (Bottle Count Tracking) |
| Respond to Guest | — |

---

## PER-03: Priya Nair — Casual Wine Gifter / Occasional Buyer

---

### JRN-03.1: Logging a Wine at a Restaurant Before the Moment Passes

**Persona:** PER-03 (Priya Nair)

**Scenario:** Priya is at dinner with friends. The table just ordered a bottle she has never had before and she is genuinely enjoying it — she wants to remember it. She pulls out her phone while the bottle is still on the table. She has never used the app before. She has about 20 seconds of social bandwidth before it becomes rude.

**Related Jobs:** JTBD-03.1

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Takes a photo of the label; decides to log it properly this time | Phone camera / app | "I always say I'll remember and I never do. Let me actually log this." | Motivated, slightly self-aware | Previously posted to Instagram Stories — disappears in 24 hours, unsearchable | Subtle onboarding nudge: "Your first wine — it takes less than 20 seconds." |
| **Open App / Sign Up** | Opens the app for the first time; completes minimal sign-up | Onboarding / F0 — Add Wine | "Please don't make me fill in a profile before I can add a wine." | Impatient, cautious | Most wine apps require account setup, preferences, or a tutorial before the first useful action | Progressive onboarding: first action is "Add a wine" — account created implicitly after first save |
| **Add Wine by Name** | Types the wine name; ignores all optional fields; taps Save | F0 — Add Wine form (mobile) | "Just the name — I don't know the varietal or region off the top of my head. Can I save now?" | Tentative | Apps that require varietal or vintage before saving create instant abandonment | Name-only save enabled by default; optional fields collapsed below the fold with a "Add more details" toggle |
| **See It in the List** | Wine appears in her inventory immediately | F1 — Inventory list | "Oh — that was actually really fast. And there it is." | Pleasantly surprised, delighted | Expected a slow or broken experience based on previous wine apps she tried | Immediate in-list confirmation; gentle prompt: "Want to add a rating while you remember?" |
| **Add a Quick Rating** | Taps the star rating directly from the list or a one-tap prompt | F5 — Tasting Notes & Ratings | "Four stars. Done. I can add a proper note later." | Satisfied, smiling | Star rating buried on a detail page adds a navigation step that breaks the moment | Inline star rating on the add-confirmation screen or as an overlay — one tap, no navigation |

#### Key Moments

- **Decision Point:** Add Wine by Name stage — if the form blocks save without more fields, Priya closes the app and never returns.
- **Risk of Abandonment:** Open App / Sign Up stage — friction in onboarding (email verification, profile wizard) causes immediate drop-off before a single wine is logged.
- **Delight Opportunity:** See It in the List stage — the wine appearing instantly creates an "aha" moment that converts a first-time user into a returning one.

#### Success Outcome

Priya adds a wine by name only in under 20 seconds on first use, with no prior onboarding required. The wine appears in her active inventory immediately. (JTBD-03.1 success measure: ≥ 80% activation rate; median first-wine entry ≤ 20 seconds.)

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | App launch / first-time use |
| Open App / Sign Up | Onboarding, F0 (Wine Entry & Management) |
| Add Wine by Name | F0 (Wine Entry & Management) |
| See It in the List | F1 (Inventory List View) |
| Add a Quick Rating | F5 (Tasting Notes & Ratings) |

---

### JRN-03.2: Revisiting Tasting History to Decide Whether to Re-buy

**Persona:** PER-03 (Priya Nair)

**Scenario:** Priya is standing in a bottle shop on a Saturday afternoon. She remembers having a wine she really liked at a dinner party a few months ago — she thinks it was a Rosé, possibly French. She logged it at the time. She wants to retrieve her rating and any note she wrote before deciding to re-buy it or try something similar.

**Related Jobs:** JTBD-03.2, JTBD-03.3

---

#### Journey Stages

| Stage | Action | Touchpoint | Thinking | Feeling | Pain Point | Opportunity |
|---|---|---|---|---|---|---|
| **Trigger** | Sees a French Rosé on the shelf that looks familiar; opens the app | Mobile / F1 — Inventory list or history | "I think I had this before — or something like it. Let me check what I wrote." | Curious, hopeful | Without a log, would have to text friends or trust a vague memory | "Memories" or "History" tab one tap from the home screen |
| **Navigate to History** | Taps the history or consumed tab to see finished wines | F6 — Consumed / Removed Status | "Where are my finished bottles? Is there a history view?" | Slightly uncertain | If consumed wines are hidden without a clearly labelled toggle, she cannot find them | Prominent "History" tab on the main screen — not buried in settings; label is plain ("Bottles I've finished") |
| **Search History** | Types partial wine name or "Rosé" in the search field | F2 — Search & Filter (history) | "I don't remember the exact name — but it was a Rosé. Let me filter." | Engaged | If search only covers active inventory (not history), she cannot find finished wines | Search works across both active and consumed inventory; filter by varietal works on history view |
| **Review Rating & Note** | Taps the wine; sees her star rating (4 stars) and a short note she wrote | F4 — Wine Detail, F5 — Tasting Notes | "'Fresh strawberry, dry finish — great with fish.' Four stars. Yes — that's the one." | Relieved, confident | If the note was not preserved when she marked it consumed, all context is lost | Tasting note and star rating displayed prominently on the history detail page; clear "consumed on" date |
| **Decide to Re-buy** | Returns to the shelf and picks up the bottle with confidence | Physical / in-store | "I know I liked it. I know why. I'm buying it." | Decisive, satisfied | Without this data, she would have second-guessed or bought the wrong one | Shareable tasting note (future feature); for now, the ability to screenshot or copy the note is enough |

#### Key Moments

- **Decision Point:** Navigate to History stage — if the history/consumed view is not clearly labelled or requires more than 2 taps, Priya cannot find her old entries and the app fails her core re-buy use case.
- **Delight Opportunity:** Review Rating & Note stage — reading her own words about a wine she enjoyed triggers a positive emotional response that reinforces the app as a trusted personal journal.
- **Risk of Abandonment:** Search History stage — if search does not cover consumed/removed wines, Priya concludes the app is only useful for current stock and stops logging consumed bottles.

#### Success Outcome

Priya retrieves her rating and tasting note for a consumed wine in under 15 seconds from her tasting history view. (JTBD-03.2 success measure: rating and note retrievable from history in under 15 seconds.)

#### Feature Touchpoints

| Stage | Features |
|---|---|
| Trigger | App launch / F1 (Inventory List View) |
| Navigate to History | F6 (Consumed / Removed Status) |
| Search History | F2 (Search & Filter) |
| Review Rating & Note | F4 (Wine Detail Page), F5 (Tasting Notes & Ratings) |
| Decide to Re-buy | — |

---

## Cross-Journey Patterns

### CP-01: Speed-of-Capture as the Make-or-Break Moment
All seven journeys share a critical first-action pattern: the user's willingness to open the app depends entirely on how fast they can complete their task. Delay > 3 seconds on load, friction in search, or blocked save flows cause abandonment across all three personas. **The app must load and be usable in under 2 seconds on a fresh open.**

**Appears in:** JRN-01.1 (Trigger), JRN-01.2 (Trigger), JRN-02.1 (Trigger), JRN-02.2 (Trigger), JRN-03.1 (Trigger), JRN-03.2 (Trigger)

---

### CP-02: Bottle Count Visibility on the List Row
Marcus (JRN-01.3), Sofia (JRN-02.1, JRN-02.2), and implicitly Priya (JRN-03.2) all depend on seeing the bottle count directly on the inventory list row without tapping into the detail page. This single affordance eliminates an extra navigation step in 5 of 7 journeys. **Bottle count must be visible on every list row.**

**Appears in:** JRN-01.3 (Assess & Decide), JRN-02.1 (Confirm Empty Badge), JRN-02.2 (Review Results), JRN-03.2 (Review Rating & Note)

---

### CP-03: Search Must Span Both Active and Consumed Inventory
Marcus (JRN-01.3), Sofia (JRN-02.2 implicitly), and Priya (JRN-03.2) all use search as their primary navigation tool. Priya's re-buy journey specifically requires searching consumed/removed wines. If search is scoped only to active inventory, the history use case breaks entirely. **Search and filter must cover all wine records, with a toggle or indication for status.**

**Appears in:** JRN-01.3 (Search by Producer), JRN-02.2 (Enter Search Terms), JRN-03.2 (Search History)

---

### CP-04: Inline Controls Eliminate Navigation Tax
Marcus's note capture (JRN-01.2), Sofia's decrement (JRN-02.1), and Priya's star rating (JRN-03.1) all require an action that must be completable without navigating away from the current screen. Every extra page transition multiplies abandonment risk. **Decrement, star rating, and note quick-add must be inline — accessible within 1–2 taps of the list or detail view without a separate edit form.**

**Appears in:** JRN-01.2 (Decrement Count, Add Tasting Note), JRN-02.1 (Decrement to Zero), JRN-03.1 (Add a Quick Rating)

---

### CP-05: The Empty Badge as a Trust Signal
Both Marcus (post-decrement) and Sofia (JRN-02.1) need immediate visual confirmation that a zero-bottle wine is flagged. Without this signal, neither can trust that the list accurately represents reality. This is the system's primary data integrity cue. **Zero-bottle wines must display a bold, high-contrast "Empty" or equivalent badge the moment the count hits zero.**

**Appears in:** JRN-02.1 (Confirm Empty Badge), JRN-01.1 (Verify Count, implicitly)

---

### CP-06: History Must Be One Tap Away
Sofia (JRN-02.2, for sommelier reviews), Marcus (JRN-01.2 post-consume), and Priya (JRN-03.2) all need to reach consumed history without navigating through settings or secondary menus. If history is buried, the retention and re-buy use cases collapse. **Consumed / History view accessible in exactly 1 additional tap from the main inventory screen.**

**Appears in:** JRN-01.2 (Mark as Consumed), JRN-02.2 (implicit: JTBD-02.3 reorder review), JRN-03.2 (Navigate to History)

---

## Journey-to-JTBD Traceability

| JRN-ID | Stage | JTBD-ID | Expected Outcome |
|---|---|---|---|
| JRN-01.1 | Add Wine | JTBD-01.1 | Wine entry with all 6 fields saved in ≤ 45 seconds on mobile |
| JRN-01.1 | Verify Count | JTBD-01.1 | Bottle count on list row matches physical bottles in hand |
| JRN-01.2 | Decrement Count | JTBD-01.1 | Single-tap decrement from list or detail page; count updates instantly |
| JRN-01.2 | Add Tasting Note | JTBD-01.2 | Free-text note and star rating captured in ≤ 30 seconds inline |
| JRN-01.2 | Mark as Consumed | JTBD-01.2 | Note and rating persist on consumed wine record in history |
| JRN-01.3 | Search by Producer | JTBD-01.3 | Partial producer name returns all matching wines in ≤ 500ms |
| JRN-01.3 | Refine Filter | JTBD-01.3 | Varietal + region filters combinable in a single interaction |
| JRN-01.3 | Assess & Decide | JTBD-01.3 | Bottle count visible per row; full lookup completes in ≤ 10 seconds |
| JRN-02.1 | Decrement to Zero | JTBD-02.1 | Count decremented in ≤ 3 taps from list view; no navigation required |
| JRN-02.1 | Confirm Empty Badge | JTBD-02.1 | "Empty" badge appears immediately when count reaches 0 |
| JRN-02.2 | Enter Search Terms | JTBD-02.2 | Varietal + region filter combinable in ≤ 2 taps; results live-update |
| JRN-02.2 | Review Results | JTBD-02.2 | Matching wines with bottle counts returned in ≤ 10 seconds on tablet |
| JRN-03.1 | Add Wine by Name | JTBD-03.1 | Name-only save (no other required fields) completes in ≤ 20 seconds |
| JRN-03.1 | Add a Quick Rating | JTBD-03.1 | Star rating addable in 1 tap from add-confirmation or list row |
| JRN-03.2 | Navigate to History | JTBD-03.3 | Consumed / history view reachable in ≤ 1 tap from main screen |
| JRN-03.2 | Search History | JTBD-03.2 | Search works against consumed inventory; varietal filter applies to history |
| JRN-03.2 | Review Rating & Note | JTBD-03.2 | Rating and tasting note visible on consumed wine detail in ≤ 15 seconds |

---

## Validation Checklist

- [x] Every persona has at least 1 journey (PER-01: 3, PER-02: 2, PER-03: 2)
- [x] Every journey maps to at least 1 JTBD
- [x] All stages have all columns populated
- [x] Success outcomes trace to JTBD success measures
- [x] Key moments identified for each journey (decision point, risk of abandonment, delight opportunity)
- [x] Cross-journey patterns documented (6 patterns)
- [x] Feature touchpoints reference valid PRD feature IDs (F0–F6)
- [x] Journey-to-JTBD traceability table is complete

---

*Document generated: 2026-05-15 | Project: WineInventory | Version: 1.0*
