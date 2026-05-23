# Requirements

## Functional
- **FR1 (Catalog Management):** The system must provide a Material Catalog supporting catalog entry creation with attributes: Name, Material Type, Unit of Measurement (UOM), and Safety Stock Threshold.
- **FR2 (Material Classification):** Supported Material Types must strictly include: Seeds (Hạt giống), Fertilizers (Phân bón), Pesticides (Thuốc bảo vệ thực vật), and Tools/Equipment (Công cụ/Dụng cụ).
- **FR3 (Import Transactions):** The system must support logging Import Transactions with attributes: Date, Supplier Name, Selected Material, Quantity, Unit Price, Batch Code, and Expiration Date.
- **FR4 (Export Transactions):** The system must support logging Export Transactions with attributes: Date, Requester Name, Selected Material, Quantity, and Destination/Purpose Tag.
- **FR5 (Negative Inventory Prevention):** The system must validate exports and reject any transaction attempting to disburse more than the current available stock.
- **FR6 (Live Inventory Dashboard):** The system must display a real-time summary of stock-on-hand for all catalog materials.
- **FR7 (Safety Stock Warnings):** The system must generate visible alerts for materials whose real-time stock levels fall below their designated Safety Stock Threshold.
- **FR8 (Expiration Warnings):** The system must generate visible warnings for batches expiring within the next 30 days.

## Non Functional
- **NFR1 (Visual Excellence & Themes):** The UI must utilize a premium design system with custom CSS (curated harmonious color palettes, smooth hover micro-animations, glassmorphism, responsive grids, and standard dark/light mode toggle).
- **NFR2 (Mobile Responsiveness):** The application must be fully responsive and performant on mobile web browsers for warehouse operators on-the-go.
- **NFR3 (Reliability):** Real-time inventory calculation must be accurate and robust to prevent data mismatches under concurrent transaction logs.
- **NFR4 (Usability):** Forms must include smart validation and clear user-facing error messages instead of raw system stack traces.
