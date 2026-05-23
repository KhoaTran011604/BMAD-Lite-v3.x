# Source Tree

```
project-root/
├── .bmad-lite/          # BMAD-Lite configurations and guidelines
├── docs/                # Monolithic requirements and architecture documentation
│   ├── prd.md
│   └── project-brief.md
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
│   │   └── forms/       # Import and Export validation forms
│   ├── models/          # Mongoose database models
│   │   ├── Material.ts
│   │   ├── Import.ts
│   │   └── Export.ts
│   ├── lib/             # Third-party configuration and DB connections
│   │   ├── dbConnect.ts
│   │   └── utils.ts
│   └── styles/          # Custom Vanilla CSS
│       ├── globals.css  # CSS custom properties, resets, light/dark themes
│       ├── layout.css   # Main dashboard grid and sidebar structure
│       └── glass.css    # Premium glassmorphic utility rules
├── tests/
│   ├── unit/            # Stock computations and schema tests
│   └── integration/     # Next.js Serverless endpoints and stock verification
├── package.json
├── tsconfig.json
└── next.config.js
```
