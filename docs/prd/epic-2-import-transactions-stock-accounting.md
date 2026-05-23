# Epic 2: Import Transactions & Stock Accounting

**Goal:** Provide warehouse operators with a transaction registry to log incoming agricultural supplies, updating physical stock-on-hand and storing expiration schedules.

## Story 2.1: Log Import Transaction API & DB Update
**As a** Warehouse Operator,
**I want** an API endpoint to record incoming shipments,
**so that** inventory balances are incremented and shelf-life tracking is established.

**Acceptance Criteria:**
1. Given a POST request to `/api/imports`, When payload contains valid transaction attributes (date, supplier, materialId, quantity, unitPrice, batchCode, expirationDate), Then it must write an import log entry and increment the material's total stock level in the database.
2. Given an import payload, When `quantity` or `unitPrice` is zero/negative, Then it must return a `400 Bad Request` validation error.

## Story 2.2: Import Transaction Form UI
**As a** Warehouse Operator,
**I want** a smooth form layout with field suggestions and date-pickers,
**so that** I can log new deliveries rapidly and avoid typing errors.

**Acceptance Criteria:**
1. Given the Import Form, When selecting a material, Then it must provide a searchable dropdown listing all catalog items.
2. Given chemical materials (e.g. Pesticides, Fertilizers), When logging an import, Then the Expiration Date and Batch Code fields must be marked as highly recommended/required inputs.

## Story 2.3: Import History Log UI
**As a** Farm Manager,
**I want** a transaction feed showing recent incoming shipments,
**so that** I can review suppliers, pricing trends, and batch receipts.

**Acceptance Criteria:**
1. Given the Transaction History page, When the user clicks the "Imports" tab, Then it must render a chronological table/list of receipts with colored indicators (e.g. Emerald + sign).
2. Given an item in the Import history log, When clicked, Then it must reveal full details including Unit Price, Batch Code, and Expiration Date.

---
