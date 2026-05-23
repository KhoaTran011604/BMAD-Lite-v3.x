# Source Tree

> [SCANNED - needs review] Folder-level overview only. For exact file paths, see [`source-tree.json`](./source-tree.json).

```text
project-root/
|-- .bmad-lite/          # BMAD-Lite configurations and guidelines
|-- docs/                # Requirements, architecture, and planning documentation
|   |-- prd.md
|   |-- project-brief.md
|   `-- stories/         # Drafted implementation-ready story documents
|       |-- 4.1.live-stock-on-hand-view.md
|       |-- 4.2.low-stock-and-expiration-alerts.md
|       |-- 5.1.clean-backend-queries.md
|       |-- 5.2.shared-formatting-utilities.md
|       `-- 5.3.right-aligned-numeric-table-columns.md
|-- src/
|   |-- middleware.ts    # Next.js route guard middleware
|   |-- app/             # Next.js App Router
|   |   |-- layout.tsx   # Global styling and app shell
|   |   |-- page.tsx     # Real-time Live Dashboard
|   |   |-- catalog/
|   |   |   `-- page.tsx
|   |   |-- history/
|   |   |   `-- page.tsx
|   |   `-- api/
|   |       |-- materials/route.ts
|   |       |-- imports/route.ts
|   |       `-- exports/route.ts
|   |-- components/      # UI components (layout, modals, forms)
|   |   |-- Sidebar.tsx
|   |   |-- QuickActionDrawer.tsx
|   |   |-- FormError.tsx
|   |   |-- FormFieldItem.tsx
|   |   |-- GenericForm.tsx
|   |   `-- GenericTable.tsx
|   |-- hooks/           # Decoupled React Query custom hooks
|   |   |-- use-dashboard-queries.ts
|   |   |-- use-materials-queries.ts
|   |   |-- use-materials-mutations.ts
|   |   |-- use-imports-queries.ts
|   |   |-- use-imports-mutations.ts
|   |   |-- use-exports-queries.ts
|   |   `-- use-exports-mutations.ts
|   |-- models/          # Mongoose database models
|   |   |-- Material.ts
|   |   |-- Import.ts
|   |   |-- Export.ts
|   |   `-- User.ts
|   |-- lib/             # Third-party configuration and DB connections
|   |   |-- dbConnect.ts
|   |   |-- query-keys.ts
|   |   |-- utils.ts
|   |   |-- auth-helper.ts
|   |   `-- auth-guard.ts
|   |-- context/         # React context providers
|   |   `-- auth.tsx
|   |-- shemas/          # Zod schemas
|   |   |-- loginSchema.ts
|   |   `-- registerSchema.ts
|   `-- styles/          # Custom Vanilla CSS
|       |-- globals.css
|       |-- layout.css
|       `-- glass.css
|-- tests/
|   |-- integration/
|   |   `-- api/
|   |       `-- auth.test.ts
|   `-- unit/
|       |-- lib/
|       |   |-- auth-helper.test.ts
|       |   `-- auth-schemas.test.ts
|       `-- models/
|           `-- User.test.ts
|-- package.json
|-- tsconfig.json
`-- next.config.js
```

## Recent Additions (Story 6.1)

- Added `src/app/api/auth/`
- Added `src/app/api/auth/register/route.ts`
- Added `src/app/api/auth/login/route.ts`
- Added `src/app/api/auth/logout/route.ts`
- Added `src/app/api/auth/me/route.ts`
- Added `src/lib/auth-helper.ts`
- Added `src/models/User.ts`
- Added `tests/integration/api/auth.test.ts`
- Added `tests/unit/lib/auth-helper.test.ts`
- Added `tests/unit/models/User.test.ts`

## Recent Additions (Story 6.3)

- Added `src/shemas/loginSchema.ts`
- Added `src/shemas/registerSchema.ts`
- Added `src/app/login/page.tsx`
- Added `src/app/register/page.tsx`
- Added `tests/unit/lib/auth-schemas.test.ts`

## Recent Additions (Story 6.4)

- Added `src/context/auth.tsx`
- Added `src/middleware.ts`
