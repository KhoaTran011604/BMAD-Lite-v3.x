# Source Tree

> [SCANNED — needs review] Folder-level overview only. For exact file paths, see [`source-tree.json`](./source-tree.json).

```
project-root/
├── .bmad-lite/          # BMAD-Lite configurations and guidelines
├── docs/                # Requirements, architecture, and planning documentation
│   ├── prd.md
│   ├── project-brief.md
│   └── stories/         # Drafted implementation-ready story documents
│       └── 4.1.live-stock-on-hand-view.md
│       └── 4.2.low-stock-and-expiration-alerts.md
│       └── 5.1.clean-backend-queries.md
│       └── 5.2.shared-formatting-utilities.md
│       └── 5.3.right-aligned-numeric-table-columns.md
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── layout.tsx   # Global styling and Outfit font injection
│   │   ├── page.tsx     # Real-time Live Dashboard
│   │   ├── catalog/     # Material Catalog Management
│   │   │   └── page.tsx
│   │   ├── history/     # Unified Imports/Exports history feed
│   │   │   └── page.tsx
│   │   └── api/         # Next.js Serverless API routes
│   │       ├── materials/
│   │       │   └── route.ts
│   │       ├── imports/
│   │       │   └── route.ts
│   │       └── exports/
│   │           └── route.ts
│   ├── components/      # UI components (Layout, modals, Forms)
│   │   ├── Sidebar.tsx  # Navigation pane
│   │   ├── QuickActionDrawer.tsx # Fast transaction logger drawer
│   │   ├── FormError.tsx # Standard form validation error
│   │   ├── FormFieldItem.tsx # Reusable form input element
│   │   ├── GenericForm.tsx # Zod-resolver dynamic form wrapper
│   │   └── GenericTable.tsx # Headless react-table display component
│   ├── hooks/           # Decoupled React Query Custom Hooks
│   │   ├── use-dashboard-queries.ts
│   │   ├── use-materials-queries.ts
│   │   ├── use-materials-mutations.ts
│   │   ├── use-imports-queries.ts
│   │   ├── use-imports-mutations.ts
│   │   ├── use-exports-queries.ts
│   │   └── use-exports-mutations.ts
│   ├── models/          # Mongoose database models
│   │   ├── Material.ts
│   │   ├── Import.ts
│   │   └── Export.ts
│   ├── lib/             # Third-party configuration and DB connections
│   │   ├── dbConnect.ts
│   │   ├── query-keys.ts # Centralized React Query keys
│   │   └── utils.ts
│   └── styles/          # Custom Vanilla CSS
│       ├── globals.css  # CSS custom properties, resets, light/dark themes
│       ├── layout.css   # Main dashboard grid and sidebar structure
│       └── glass.css    # Premium glassmorphic utility rules
├── tests/
│   ├── unit/            # Stock computations, schema, and architectural tests
│   └── integration/     # Next.js Serverless endpoints and stock verification
├── package.json
├── tsconfig.json
└── next.config.js
```
