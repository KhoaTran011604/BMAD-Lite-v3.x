# Epic 4: Live Inventory & Smart Alerts Dashboard

**Goal:** Aggregate all inventory balances and transactions into a premium real-time control dashboard featuring automated warnings for replenishment and shelf-life expiry.

## Story 4.1: Live Stock On Hand View
**As a** Farm Manager,
**I want** an analytical dashboard showing total active stocks and total catalog value,
**so that** I can quickly evaluate our current physical assets.

**Acceptance Criteria:**
1. Given the Dashboard home, When loaded, Then it must display key highlight counters: Total Materials, Active Alerts, and Total Portfolio Value (calculated as sum of `stockOnHand * averageUnitPrice`).
2. Given stock list cards, When stock level changes (due to background transactions), Then the numbers must update reactively.

## Story 4.2: Low-Stock and Expiration Alerts
**As a** Farm Manager,
**I want** automated priority indicators for expiring or depleted materials,
**so that** I can purchase replacements before planting schedules are affected.

**Acceptance Criteria:**
1. Given a material with stock level below its threshold, When the dashboard renders, Then it must place this item at the top of the "Low Stock Warnings" card with a glowing amber badge.
2. Given an imported batch expiring within 30 days of the current date, When the dashboard renders, Then it must trigger a "Near Expiry Alert" displaying the days remaining and batch code in red.
