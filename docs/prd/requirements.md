# Requirements

> [SCANNED — needs review] Functional requirements inferred from API routes, Non-functional from config and file patterns.

## Functional Requirements

| ID | Requirement | Source | Status |
|----|-------------|--------|--------|
| FR1 | The system must provide a Material Catalog supporting catalog entry creation with attributes: Name, Material Type, Unit of Measurement (UOM), and Safety Stock Threshold. | `src/models/Material.ts`, `POST /api/materials` | [VERIFY] |
| FR2 | Supported Material Types must strictly include: Seeds, Fertilizers, Pesticides, and Tools/Equipment. | `src/models/Material.ts` | [VERIFY] |
| FR3 | The system must support logging Import Transactions with attributes: Date, Supplier Name, Selected Material, Quantity, Unit Price, Batch Code, and Expiration Date. | `src/models/Import.ts`, `POST /api/imports` | [VERIFY] |
| FR4 | The system must support logging Export Transactions with attributes: Date, Requester Name, Selected Material, Quantity, and Destination/Purpose. | `src/models/Export.ts`, `POST /api/exports` | [VERIFY] |
| FR5 | **Negative Inventory Prevention:** The system must validate exports and reject any transaction attempting to disburse more than the current available stock. | `src/app/api/exports/route.ts` | [VERIFY] |
| FR6 | **Live Inventory Dashboard:** The system must display a real-time summary of stock-on-hand, total materials count, and total portfolio value (weighted-average method). | `src/app/api/materials?view=dashboard` | [VERIFY] |
| FR7 | **Safety Stock Warnings:** The system must generate visible alerts for materials whose real-time stock levels fall below their designated Safety Stock Threshold. | `src/lib/utils.ts` | [VERIFY] |
| FR8 | **Expiration Warnings:** The system must generate visible warnings for batches expiring within the next 30 days. | `src/lib/utils.ts` | [VERIFY] |

## Non-Functional Requirements

| ID | Requirement | Source | Status |
|----|-------------|--------|--------|
| NFR1 | **Visual Excellence & Vanilla CSS:** The UI must utilize custom CSS (`glass.css`, `globals.css`, `layout.css`) for premium glassmorphism, responsive layouts, and modern typography without TailwindCSS dependencies. | `src/styles/` | [VERIFY] |
| NFR2 | **Mobile Responsiveness:** The layout must adapt gracefully to mobile devices to allow warehouse operators to log transactions on-the-go. | `Sidebar.tsx`, `layout.css` | [VERIFY] |
| NFR3 | **Atomic Database Updates:** Stock adjustments (increments/decrements) must be handled atomically in MongoDB to prevent race conditions. | `src/app/api/exports/route.ts` | [VERIFY] |
| NFR4 | **Data Validation:** Zod schema validation must be enforced on all write APIs to prevent malformed records. | `zod` schemas in API routes | [VERIFY] |
| NFR5 | **Role Validation:** API endpoints must validate user permissions via simulated headers (`x-user-role` checking for `Manager` / `FarmManager`). | API routes header checks | [VERIFY] |
