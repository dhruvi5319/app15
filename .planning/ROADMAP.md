# Roadmap: Wine Inventory App

## Overview

Greenfield delivery of a personal wine cellar management application. The journey moves from project scaffolding and data foundation, through core wine entry (the central user value), to enrichment with tasting notes and lifecycle tracking. Every phase delivers a coherent, verifiable capability before the next begins.

## Phases

**Phase Numbering:**
- Integer phases (1, 2, 3): Planned milestone work
- Decimal phases (2.1, 2.2): Urgent insertions (marked with INSERTED)

Decimal phases appear between their surrounding integers in numeric order.

- [x] **Phase 1: Foundation** - Project scaffolding, tech stack, database schema, auth, and CI/CD pipeline
- [x] **Phase 2: Core Wine Entry** - Users can add, view, and manage wines in their inventory
- [x] **Phase 3: Tasting Notes** - Users can add and edit free-text tasting notes on any wine
- [ ] **Phase 4: Lifecycle Tracking** - Users can mark wines as consumed and manage status transitions

## Phase Details

### Phase 1: Foundation
**Status**: completed (2026-05-15)
**Last Updated**: 2026-05-15T19:28:02Z
**Goal**: A runnable, deployable full-stack skeleton exists — auth works, database is migrated, CI/CD pipeline is live
**Depends on**: Nothing (first phase)
**Requirements**: *(no v1 user requirements — this phase unblocks all others)*
**Success Criteria** (what must be TRUE):
  1. Developer can run the full stack locally with a single command (Docker Compose + npm scripts)
  2. PostgreSQL schema is migrated with all v1 tables: `users`, `wines`, `sessions`
  3. A user can register and log in with email/password; JWT access and refresh tokens are issued
  4. GitHub Actions CI pipeline runs lint, tests, and build on every push to main
  5. API and SPA deploy automatically to Render/Neon on merge to main
**Plans**: 3 plans

Plans:
- [x] 01-01-PLAN.md — Monorepo scaffold (npm workspaces, TypeScript, ESLint, env config, Docker Compose, GitHub Actions CI)
- [x] 01-02-PLAN.md — Database schema (6 Knex migrations, exact TechArch DDL) and auth API (register, login, refresh, logout)
- [x] 01-03-PLAN.md — React SPA shell (React Router, Zustand auth store, Axios client, page shells, LoginPage, Playwright e2e)

### Phase 2: Core Wine Entry
**Status**: awaiting verify
**Goal**: Users can add wines to their inventory and know exactly what they have at any time
**Depends on**: Phase 1
**Requirements**: WINE-01, WINE-02
**Success Criteria** (what must be TRUE):
  1. User can add a wine with only a name (quick-add) and it appears in their inventory immediately
  2. User can add a wine with full details (producer, vintage, varietal, region, bottle count) and all fields are saved correctly
  3. User can view their full wine inventory as a browsable, sortable list showing key at-a-glance fields
  4. User can open a wine detail page and see all stored information for that wine
  5. User can edit any field on an existing wine record and see the change reflected instantly
**Plans**: 3 plans

Plans:
- [x] 02-01-PLAN.md — Wine CRUD API + bottle-count endpoint + migration 007 (status_changed_at) + integration tests
- [x] 02-02-PLAN.md — Inventory list page + wine detail page (React Query hooks, WineCard, EmptyState, StatusBadge, ConfirmDialog)
- [x] 02-03-PLAN.md — Add/edit wine forms (WineForm, BottleCountControl with optimistic UI, AddWinePage, EditWinePage)

### Phase 3: Tasting Notes
**Goal**: Users can capture and update their personal impressions of any wine in their inventory
**Depends on**: Phase 2
**Requirements**: NOTE-01, NOTE-02
**Success Criteria** (what must be TRUE):
  1. User can add a free-text tasting note to any wine from the detail page
  2. User can edit an existing tasting note and the updated text is saved
  3. Tasting notes are displayed on the wine detail page alongside all other wine information
  4. User can clear a tasting note (set to empty) if desired
**Plans**: 1 plan

Plans:
- [x] 03-01-PLAN.md — TastingNotesEditor component (inline add/edit/clear on detail page) + server integration tests + Playwright e2e

### Phase 4: Lifecycle Tracking
**Goal**: Users can mark wines as consumed and keep their active inventory accurate
**Depends on**: Phase 2
**Requirements**: LIFE-01
**Success Criteria** (what must be TRUE):
  1. User can mark any active wine as consumed from the list view or detail page
  2. Consumed wines disappear from the default active inventory list
  3. Consumed wines remain accessible via a history view or status filter
  4. User can revert a consumed wine back to active if marked in error
**Plans**: 1 plan

Plans:
- [ ] 04-01-PLAN.md — Wine status API (PATCH /wines/:id/status) + StatusTransitionButtons + HistoryPage + Playwright e2e

## Progress

**Execution Order:**
Phases execute in numeric order: 1 → 2 → 3 → 4

| Phase | Plans Complete | Status | Completed |
|-------|----------------|--------|-----------|
| 1. Foundation | 3/3 | Complete | 2026-05-15 |
| 2. Core Wine Entry | 3/3 | Complete | 2026-05-15 |
| 3. Tasting Notes | 1/1 | Complete | 2026-05-15 |
| 4. Lifecycle Tracking | 0/1 | Planned | - |