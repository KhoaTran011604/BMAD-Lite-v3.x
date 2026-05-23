# AgriKeep Product Requirements Document (PRD)

## Goals and Background Context

### Goals
- Goal 1: Provide real-time stock visibility for central farm agricultural inputs and outputs.
- Goal 2: Prevent operational downtime during key planting seasons through proactive safety stock alerts.
- Goal 3: Eliminate waste and chemical spoilage using batch-level expiration date tracking.
- Goal 4: Replace chaotic spreadsheets and paper logs with an elegant, mobile-friendly digital registry.

### Background Context
Farm managers and warehouse operators struggle to maintain accurate records of essential supplies such as seeds, fertilizers, pesticides, and tools. Spreadsheets are often updated late or contain errors, leading to unexpected stockouts during planting seasons or costly expiration of chemical products. Furthermore, there is little traceability regarding which staff member took what materials and for what purpose.

**AgriKeep** addresses these pain points by offering a modern, premium web-based dashboard strictly focused on robust, real-time import (receipt) and export (disbursement) logging with built-in safety threshold and expiration monitors.

### Change Log
| Date | Version | Description | Author |
|------|---------|-------------|--------|
| 2026-05-23 | 1.0 | Initial PRD draft based on project brief | @planner |

## Requirements

### Functional
- **FR1 (Catalog Management):** The system must provide a Material Catalog supporting catalog entry creation with attributes: Name, Material Type, Unit of Measurement (UOM), and Safety Stock Threshold.
- **FR2 (Material Classification):** Supported Material Types must strictly include: Seeds (Hạt giống), Fertilizers (Phân bón), Pesticides (Thuốc bảo vệ thực vật), and Tools/Equipment (Công cụ/Dụng cụ).
- **FR3 (Import Transactions):** The system must support logging Import Transactions with attributes: Date, Supplier Name, Selected Material, Quantity, Unit Price, Batch Code, and Expiration Date.
- **FR4 (Export Transactions):** The system must support logging Export Transactions with attributes: Date, Requester Name, Selected Material, Quantity, and Destination/Purpose Tag.
- **FR5 (Negative Inventory Prevention):** The system must validate exports and reject any transaction attempting to disburse more than the current available stock.
- **FR6 (Live Inventory Dashboard):** The system must display a real-time summary of stock-on-hand for all catalog materials.
- **FR7 (Safety Stock Warnings):** The system must generate visible alerts for materials whose real-time stock levels fall below their designated Safety Stock Threshold.
- **FR8 (Expiration Warnings):** The system must generate visible warnings for batches expiring within the next 30 days.

### Non Functional
- **NFR1 (Visual Excellence & Themes):** The UI must utilize a premium design system with custom CSS (curated harmonious color palettes, smooth hover micro-animations, glassmorphism, responsive grids, and standard dark/light mode toggle).
- **NFR2 (Mobile Responsiveness):** The application must be fully responsive and performant on mobile web browsers for warehouse operators on-the-go.
- **NFR3 (Reliability):** Real-time inventory calculation must be accurate and robust to prevent data mismatches under concurrent transaction logs.
- **NFR4 (Usability):** Forms must include smart validation and clear user-facing error messages instead of raw system stack traces.

## User Interface Design Goals

### Overall UX Vision
AgriKeep's interface will feel sleek, premium, and alive. It aims to inspire operational confidence through high-contrast alert indicators, smooth state transitions, and responsive grid cards that present material levels beautifully.

### Key Interaction Paradigms
- Tabbed layout or navigation sidebar for fast shifting between Live Dashboard, Material Catalog, and Transaction logs.
- Quick-action modals/drawers for logging new imports or exports on the fly.
- Real-time search and filter controls to isolate items by classification type or alert statuses.

### Core Screens and Views
- **Dashboard Screen:** Renders key KPIs (Total Items, Active Alerts, Low Stock Count), a dynamic low-stock/near-expiry warning center, and a live inventory checklist.
- **Catalog Management Screen:** Renders a list/grid of materials with safety threshold values and buttons to add/edit catalog items.
- **Transaction Logs Screen:** Unified history showing a list of recent Imports and Exports, color-coded for ease of recognition (e.g. green for import, amber/slate for export).

### Accessibility
WCAG AA - Color contrast ratios must meet standards; all forms must feature labels and aria-attributes; keyboard focus traps must be implemented for modal dialogs.

### Branding
"AgriKeep" branding featuring custom forest-green and emerald accents combined with smooth glassmorphic slate cards and clear typography (e.g. Google Font Inter/Outfit).

### Target Device and Platforms
Web Responsive (Optimized for both Desktop monitors and Mobile web browsers).

## Technical Assumptions

### Repository Structure
Monorepo
Rationale: Single codebase structure for frontend components, API endpoints, schemas, and configurations allows streamlined deployments and extremely fast iterations.

### Service Architecture
Monolith
Rationale: A unified Next.js fullstack project hosting frontend layouts and serverless API route handlers. This provides high reliability, low overhead, and simplified maintenance.

### Testing Requirements
Unit + Integration
Rationale: Essential to enforce 100% correct inventory balance calculations, transactional logging constraints, and negative stock validations under unit tests.

### Additional Technical Assumptions and Requests
- Database: MongoDB is utilized for flexible document storage of catalog records, import records, and export records.
- Styling: Custom Vanilla CSS for modular styling, enabling premium glassmorphism layouts and high-performance transitions without Tailwind dependencies.

## Epic List

**Epic 1: Material Catalog Foundation**
Establish the central material catalog, allowing operators to define and manage agriculture supplies, units, and safety stock thresholds.

**Epic 2: Import Transactions & Stock Accounting**
Implement incoming supply receipt logging, capturing batch information, pricing, and expiration dates while updating stock.

**Epic 3: Export Transactions & Inventory Safety**
Implement disbursement logging with strict validation checks to prevent negative inventory and ensure accountability.

**Epic 4: Live Inventory & Smart Alerts Dashboard**
Build a premium, real-time analytics dashboard with proactive warning indicators for low-stock and near-expiry supplies.

---

## Epic 1: Material Catalog Foundation

**Goal:** Establish a robust database schema and clean CRUD layouts to catalog farm inventory materials with defined categories, measurements, and low-stock thresholds.

### Story 1.1: Define Material Catalog Schema & API
**As a** Farm Manager,
**I want** to store structured material records with UOM and safety thresholds in the database,
**so that** all future stock receipts and disbursements refer to valid catalog entries.

**Acceptance Criteria:**
1. Given a MongoDB instance, When creating a new material record, Then it must validate fields: `name` (string, required), `type` (enum of Seeds, Fertilizers, Pesticides, Tools; required), `uom` (string, required), and `safetyStock` (number, positive, optional).
2. Given a database request, When getting catalog items, Then it must return the correct array of objects sorted alphabetically by name.

### Story 1.2: View & Filter Material Catalog UI
**As a** Warehouse Operator,
**I want** to browse the Material Catalog with search and type filters,
**so that** I can easily check what item specifications are registered in the warehouse.

**Acceptance Criteria:**
1. Given the Catalog Screen, When the user types in the search input, Then it must filter list items by name dynamically.
2. Given the Catalog Screen, When the user selects a Material Type filter, Then it must display only items matching that classification.
3. Given an item with current stock below its `safetyStock` threshold, When viewed in the catalog list, Then it must display a distinct visual warning badge.

### Story 1.3: Add & Edit Material Catalog Entry UI
**As a** Farm Manager,
**I want** a clear form to create and modify catalog items,
**so that** I can keep our material inventory directory up to date.

**Acceptance Criteria:**
1. Given the Catalog Form modal, When the user leaves required fields empty and submits, Then the UI must highlight the invalid fields and prevent submission.
2. Given an existing catalog item, When the user modifies its name or threshold and saves, Then it must send a PUT request to the API and update the catalog list in real-time.

---

## Epic 2: Import Transactions & Stock Accounting

**Goal:** Provide warehouse operators with a transaction registry to log incoming agricultural supplies, updating physical stock-on-hand and storing expiration schedules.

### Story 2.1: Log Import Transaction API & DB Update
**As a** Warehouse Operator,
**I want** an API endpoint to record incoming shipments,
**so that** inventory balances are incremented and shelf-life tracking is established.

**Acceptance Criteria:**
1. Given a POST request to `/api/imports`, When payload contains valid transaction attributes (date, supplier, materialId, quantity, unitPrice, batchCode, expirationDate), Then it must write an import log entry and increment the material's total stock level in the database.
2. Given an import payload, When `quantity` or `unitPrice` is zero/negative, Then it must return a `400 Bad Request` validation error.

### Story 2.2: Import Transaction Form UI
**As a** Warehouse Operator,
**I want** a smooth form layout with field suggestions and date-pickers,
**so that** I can log new deliveries rapidly and avoid typing errors.

**Acceptance Criteria:**
1. Given the Import Form, When selecting a material, Then it must provide a searchable dropdown listing all catalog items.
2. Given chemical materials (e.g. Pesticides, Fertilizers), When logging an import, Then the Expiration Date and Batch Code fields must be marked as highly recommended/required inputs.

### Story 2.3: Import History Log UI
**As a** Farm Manager,
**I want** a transaction feed showing recent incoming shipments,
**so that** I can review suppliers, pricing trends, and batch receipts.

**Acceptance Criteria:**
1. Given the Transaction History page, When the user clicks the "Imports" tab, Then it must render a chronological table/list of receipts with colored indicators (e.g. Emerald + sign).
2. Given an item in the Import history log, When clicked, Then it must reveal full details including Unit Price, Batch Code, and Expiration Date.

---

## Epic 3: Export Transactions & Inventory Safety

**Goal:** Establish disbursement tracking with strict real-time validations, ensuring stock levels are decreased accurately while preventing negative quantities.

### Story 3.1: Log Export Transaction API with Inventory Validation
**As a** Warehouse Operator,
**I want** an export API that performs a transaction check on available stock,
**so that** I cannot disburse more items than are physically present.

**Acceptance Criteria:**
1. Given a POST request to `/api/exports`, When requested quantity is less than or equal to current stock-on-hand, Then it must successfully record the export and subtract the quantity from stock.
2. Given a POST request to `/api/exports`, When requested quantity exceeds current stock-on-hand, Then it must reject the request with a `400 Bad Request` and return an error message: "Insufficient stock available".

### Story 3.2: Export Transaction Form UI
**As a** Warehouse Operator,
**I want** an export entry form with validation warnings,
**so that** I can quickly record farm handovers and see immediately if stock is lacking.

**Acceptance Criteria:**
1. Given the Export Form, When the user inputs a quantity higher than the selected material's current stock, Then the UI must display a clear "Insufficient Stock" error message in red and disable the submit button.
2. Given the Export Form, When submitting, Then it must require a "Purpose/Destination" string tag (e.g., "Field A", "Tool Repair").

### Story 3.3: Export History Log UI
**As a** Farm Manager,
**I want** to browse recent disbursements,
**so that** I have a clear audit trail of who is consuming resources and where they are applied.

**Acceptance Criteria:**
1. Given the Transaction History page, When selecting the "Exports" tab, Then it must render all outgoing transactions sorted by date descending.
2. Given the export log, When hovered or tapped, Then it must display the staff requester name and crop purpose tags clearly.

---

## Epic 4: Live Inventory & Smart Alerts Dashboard

**Goal:** Aggregate all inventory balances and transactions into a premium real-time control dashboard featuring automated warnings for replenishment and shelf-life expiry.

### Story 4.1: Live Stock On Hand View
**As a** Farm Manager,
**I want** an analytical dashboard showing total active stocks and total catalog value,
**so that** I can quickly evaluate our current physical assets.

**Acceptance Criteria:**
1. Given the Dashboard home, When loaded, Then it must display key highlight counters: Total Materials, Active Alerts, and Total Portfolio Value (calculated as sum of `stockOnHand * averageUnitPrice`).
2. Given stock list cards, When stock level changes (due to background transactions), Then the numbers must update reactively.

### Story 4.2: Low-Stock and Expiration Alerts
**As a** Farm Manager,
**I want** automated priority indicators for expiring or depleted materials,
**so that** I can purchase replacements before planting schedules are affected.

**Acceptance Criteria:**
1. Given a material with stock level below its threshold, When the dashboard renders, Then it must place this item at the top of the "Low Stock Warnings" card with a glowing amber badge.
2. Given an imported batch expiring within 30 days of the current date, When the dashboard renders, Then it must trigger a "Near Expiry Alert" displaying the days remaining and batch code in red.

## Checklist Results Report
Skipped - Greenfield project startup.

## Next Steps

### UX Expert Prompt
For the AgriKeep application, design a modern, responsive web layout. Implement a premium visual identity:
1. Palette: Deep slate/dark background options (`#0f172a`), emerald green details (`#10b981`), and high-visibility warning ambers/reds.
2. Layout: A split-pane design on desktop (left-aligned glassmorphic sidebar, central workspace grid) responsive down to a single-column layout on mobile.
3. Animations: Micro-interactions on buttons, smooth fade-in cards, and a subtle glowing effect on critical alerts.

### Architect Prompt
Run `@planner create-architecture` with this PRD.
