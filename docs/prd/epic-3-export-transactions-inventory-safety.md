# Epic 3: Export Transactions & Inventory Safety

**Goal:** Establish disbursement tracking with strict real-time validations, ensuring stock levels are decreased accurately while preventing negative quantities.

## Story 3.1: Log Export Transaction API with Inventory Validation
**As a** Warehouse Operator,
**I want** an export API that performs a transaction check on available stock,
**so that** I cannot disburse more items than are physically present.

**Acceptance Criteria:**
1. Given a POST request to `/api/exports`, When requested quantity is less than or equal to current stock-on-hand, Then it must successfully record the export and subtract the quantity from stock.
2. Given a POST request to `/api/exports`, When requested quantity exceeds current stock-on-hand, Then it must reject the request with a `400 Bad Request` and return an error message: "Insufficient stock available".

## Story 3.2: Export Transaction Form UI
**As a** Warehouse Operator,
**I want** an export entry form with validation warnings,
**so that** I can quickly record farm handovers and see immediately if stock is lacking.

**Acceptance Criteria:**
1. Given the Export Form, When the user inputs a quantity higher than the selected material's current stock, Then the UI must display a clear "Insufficient Stock" error message in red and disable the submit button.
2. Given the Export Form, When submitting, Then it must require a "Purpose/Destination" string tag (e.g., "Field A", "Tool Repair").

## Story 3.3: Export History Log UI
**As a** Farm Manager,
**I want** to browse recent disbursements,
**so that** I have a clear audit trail of who is consuming resources and where they are applied.

**Acceptance Criteria:**
1. Given the Transaction History page, When selecting the "Exports" tab, Then it must render all outgoing transactions sorted by date descending.
2. Given the export log, When hovered or tapped, Then it must display the staff requester name and crop purpose tags clearly.

---
