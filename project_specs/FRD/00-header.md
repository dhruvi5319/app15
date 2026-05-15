# Functional Requirements Document — Wine Inventory App

**Project:** WineInventory  
**Acronym:** WineInventory  
**Version:** 1.0  
**Date:** 2026-05-15  
**Status:** Draft  
**Based on:** PRD-WineInventory.md v1.0

---

## Scope

This document specifies the detailed functional behavior of every feature in WineInventory v1. It covers inputs, outputs, validation rules, error states, API surface, and database schema for the seven PRD features (F0–F6). It is the authoritative reference for development and QA. Social sharing, barcode scanning, marketplace, and cellar temperature tracking are explicitly out of scope for v1.

---

## Conventions

- **Feature IDs** match PRD: F0–F6. Chunk filenames use zero-padded form: `F00–F06`.
- **Field names** use `snake_case` throughout (API and DDL).
- **HTTP status codes** follow standard RFC 7231 semantics.
- **Timestamps** are stored and transmitted as ISO 8601 UTC strings (`YYYY-MM-DDTHH:MM:SSZ`).
- **IDs** are UUIDs (v4) unless otherwise stated.
- **Pagination** defaults: `page=1`, `per_page=25`; max `per_page=100`.
- **Authentication:** All API endpoints require a valid session token (Bearer JWT). Auth mechanism is defined in the TechArch document; this FRD assumes a single-user session model for v1.
- Cross-references use the format `→ F03 §Process` or `→ Y0-schema.md §wines`.

---

## Table of Contents

| Section | File | Description |
|---------|------|-------------|
| F00 | `F00-wine-entry-management.md` | Wine Entry & Management (CRUD) |
| F01 | `F01-inventory-list-view.md` | Wine Inventory List View |
| F02 | `F02-search-filter.md` | Search & Filter |
| F03 | `F03-bottle-count-tracking.md` | Bottle Count Tracking |
| F04 | `F04-wine-detail-page.md` | Wine Detail Page |
| F05 | `F05-tasting-notes-ratings.md` | Tasting Notes & Ratings |
| F06 | `F06-consumed-removed-status.md` | Consumed / Removed Status |
| Y0 | `Y0-schema.md` | Database Schema (full DDL) |
| Y1 | `Y1-api.md` | REST API Endpoint Catalog |
| Y2 | `Y2-errors.md` | Cross-Feature Error Catalog |
| Y3 | `Y3-integrations.md` | External Integration Points |

---

## Cross-Cutting Terminology

| Term | Definition |
|------|-----------|
| **Wine record** | A single database row representing one distinct wine (label, vintage, producer). Not a physical bottle. |
| **Bottle count** | Integer tracking how many physical bottles of a wine record are in the cellar. Minimum value: 0. |
| **Active inventory** | All wine records where `status = 'active'`. The default view. |
| **Consumed** | A wine record status indicating all bottles have been intentionally opened/finished. |
| **Removed** | A wine record status indicating bottles were sold, gifted, broken, or otherwise taken out without being consumed. |
| **Tasting note** | Free-text user annotation capturing impressions of a wine. |
| **Rating** | Numeric score assigned to a wine by the user (scale TBD at design time; default 1–100 or 1–5 stars). |
| **Producer** | The winery, estate, or brand that produced the wine. |
| **Varietal** | The grape variety or blend designation (e.g., Cabernet Sauvignon, Chardonnay, Bordeaux Blend). |
| **Region** | Geographic origin of the wine (e.g., Napa Valley, Burgundy, Barossa Valley). |
| **Vintage** | The year the grapes were harvested. |
| **Soft delete** | Marking a record as deleted in the database without physically removing it, preserving history. |
| **Bearer JWT** | JSON Web Token passed in the `Authorization: Bearer <token>` header to authenticate API requests. |

---

*All chunk files are assembled into `FRD-WineInventory.md` via `cat project_specs/FRD/*.md`.*
