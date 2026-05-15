# Requirements: Wine Inventory App

**Defined:** 2026-05-15
**Core Value:** A user can quickly log a wine and know exactly what they have in their cellar at any time.

## v1 Requirements

### Wine Entry

- [ ] **WINE-01**: User can add a wine to inventory with name (required), producer, vintage, varietal, and region
- [ ] **WINE-02**: User can add a wine with name only (all other fields optional)

### Tasting Notes

- [ ] **NOTE-01**: User can add a free-text tasting note to a wine
- [ ] **NOTE-02**: User can edit an existing tasting note

### Lifecycle

- [ ] **LIFE-01**: User can mark a wine as consumed

## v2 Requirements

### Core Inventory (deferred)

- **INV-01**: User can view full inventory as a browsable list
- **INV-02**: User can search wines by name, producer, varietal, or region
- **INV-03**: User can filter wines by varietal, region, vintage, or producer
- **INV-04**: User can track bottle count per wine (increment/decrement)
- **INV-05**: User can view a wine detail page with all stored information

### Wine Journal (deferred)

- **NOTE-03**: User can rate a wine on a 1–5 star scale

### Lifecycle (deferred)

- **LIFE-02**: User can mark a wine as removed (gifted, sold, or lost)
- **LIFE-03**: User can view consumed and removed wine history
- **LIFE-04**: User can revert a wine status back to active

## Out of Scope

| Feature | Reason |
|---------|--------|
| Social / sharing features | v1 is personal inventory only |
| Wine purchasing / marketplace integration | Not core value; high complexity |
| Barcode scanning | Mobile-specific; deferred to later version |
| Temperature / storage tracking | Hardware dependency; not core |
| OAuth login (Google, GitHub) | Email/password sufficient for v1 |

## Traceability

Which phases cover which requirements. Updated during roadmap creation.

| Requirement | Phase | Status |
|-------------|-------|--------|
| WINE-01 | Phase 2 | Pending |
| WINE-02 | Phase 2 | Pending |
| NOTE-01 | Phase 3 | Pending |
| NOTE-02 | Phase 3 | Pending |
| LIFE-01 | Phase 4 | Pending |

**Coverage:**
- v1 requirements: 5 total
- Mapped to phases: 5
- Unmapped: 0 ✓

---
*Requirements defined: 2026-05-15*
*Last updated: 2026-05-15 after initial definition*
