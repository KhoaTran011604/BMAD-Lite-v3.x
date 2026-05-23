# Project Brief: AgriKeep — Agricultural Inventory Management System

A premium, highly-efficient web application designed to track and manage the lifecycle of agricultural inputs and outputs (importing/receipt and exporting/disbursement). It eliminates paper logs and chaotic spreadsheets, ensuring real-time stock visibility and safety-stock/expiration alerts.

---

## 1. Core Vision & Problem Statement
* **The Problem:** Farm managers and warehouse operators struggle to keep track of seeds, fertilizers, pesticides, and tools. They face issues with expired materials, unexpected stockouts during key planting seasons, and lack of accountability on who took what material and for which crop/field.
* **The Solution:** **AgriKeep** provides a sleek, responsive, and robust dashboard focused strictly on import (receipt) and export (disbursement) transactions with safety stock warnings and expiration tracking.

---

## 2. Target User Personas
1. **Warehouse Operator (Thu kho):** Responsible for checking in new supplies (Import) and issuing items to farmers or field staff (Export). Needs a fast, foolproof interface.
2. **Farm Manager / Owner (Quản lý):** Needs high-level visibility of current inventory, alerts for low stock or near-expiry items, and basic reporting to make purchasing decisions.

---

## 3. Minimum Viable Product (MVP) Scope

To keep development extremely fast and highly effective, we will focus strictly on the following four core modules:

### 📦 Module 1: Material Catalog (Danh mục vật tư)
* **Goal:** A centralized repository of all materials available on the farm.
* **Features:**
  * Define material types: **Seeds (Hạt giống)**, **Fertilizers (Phân bón)**, **Pesticides (Thuốc bảo vệ thực vật)**, **Tools/Equipment (Công cụ/Dụng cụ)**.
  * Define Unit of Measurement (UOM) (e.g., kg, Liters, Bags, Packets, Units).
  * Set **Safety Stock Threshold** per item (e.g., alert if Urea Fertilizer falls below 10 bags).

### 📥 Module 2: Import Transactions (Nhập kho)
* **Goal:** Record every incoming shipment of agricultural materials.
* **Features:**
  * Log import forms: Date, Supplier, Material, Quantity, Unit Price, and **Batch/Expiration Date** (highly critical for seeds and chemical shelf-life).
  * Automatically update current stock levels.

### 📤 Module 3: Export Transactions (Xuất kho)
* **Goal:** Record all outgoing items for crop application or farm use.
* **Features:**
  * Log export forms: Date, Requester (Staff/Farmer), Material, Quantity, and **Purpose/Destination** (e.g., Field A - Rice Crop, or Disposal due to damage).
  * Automatically deduct from current stock levels.
  * Validation: Prevent exporting more than what is currently in stock (no negative inventory).

### 📊 Module 4: Live Inventory & Smart Alerts
* **Goal:** Real-time visibility and proactive warnings to prevent operational downtime.
* **Features:**
  * Simple dashboard showing:
    * Total stock on hand (real-time).
    * **Low-stock alerts** (items below their Safety Stock Threshold).
    * **Near-expiry warnings** (items expiring within the next 30 days).

---

## 4. Out of Scope for MVP (Future Phases)
* ❌ **Multi-Warehouse Support:** Assume a single central farm warehouse.
* ❌ **Automatic Barcode/QR Scanning:** Standard manual entry and search are sufficient for MVP.
* ❌ **Purchase Order & Invoice Management:** Keep financials lightweight (just Unit Price for costing).
* ❌ **Advanced Crop/Field Costing Integration:** Export logs will record destinations as text tags, avoiding complex relational mapping for now.

---

## 5. Strategic Architectural Choices
* **Frontend/Backend:** Next.js (Fullstack React + basic css with peronal style art+simple+ friendly with user) or Vite (React SPA) + Fastify/Express. (We will verify this in the tech stack phase).
* **Database:** MongoDB (for simple, highly reliable relational storage of transactions and stock levels).
* **Styling:** Premium modern CSS (harmonious dark/light mode, smooth transitions, glassmorphic card layouts) to ensure visual excellence.
