# Epic 1: Material Catalog Foundation

**Goal:** Establish a robust database schema and clean CRUD layouts to catalog farm inventory materials with defined categories, measurements, and low-stock thresholds.

## Story 1.1: Define Material Catalog Schema & API
**As a** Farm Manager,
**I want** to store structured material records with UOM and safety thresholds in the database,
**so that** all future stock receipts and disbursements refer to valid catalog entries.

**Acceptance Criteria:**
1. Given a MongoDB instance, When creating a new material record, Then it must validate fields: `name` (string, required), `type` (enum of Seeds, Fertilizers, Pesticides, Tools; required), `uom` (string, required), and `safetyStock` (number, positive, optional).
2. Given a database request, When getting catalog items, Then it must return the correct array of objects sorted alphabetically by name.

## Story 1.2: View & Filter Material Catalog UI
**As a** Warehouse Operator,
**I want** to browse the Material Catalog with search and type filters,
**so that** I can easily check what item specifications are registered in the warehouse.

**Acceptance Criteria:**
1. Given the Catalog Screen, When the user types in the search input, Then it must filter list items by name dynamically.
2. Given the Catalog Screen, When the user selects a Material Type filter, Then it must display only items matching that classification.
3. Given an item with current stock below its `safetyStock` threshold, When viewed in the catalog list, Then it must display a distinct visual warning badge.

## Story 1.3: Add & Edit Material Catalog Entry UI
**As a** Farm Manager,
**I want** a clear form to create and modify catalog items,
**so that** I can keep our material inventory directory up to date.

**Acceptance Criteria:**
1. Given the Catalog Form modal, When the user leaves required fields empty and submits, Then the UI must highlight the invalid fields and prevent submission.
2. Given an existing catalog item, When the user modifies its name or threshold and saves, Then it must send a PUT request to the API and update the catalog list in real-time.

---
