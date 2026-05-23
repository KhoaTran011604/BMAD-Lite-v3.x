# Scan Project Task

Detailed scan workflows for the Scanner agent. Referenced from `.bmad-lite/agents/scanner.md`.

---

## Scan Modes

### Full Scan (`*scan`)

Runs all 7 sub-scans sequentially:

```
[1/7] *scan-config    → Detect project type, framework, tooling
[2/7] *scan-tech      → Extract full tech stack from dependencies
[3/7] *scan-structure → Map folder tree (depth 3-4)
[4/7] *scan-models    → Find and list data models/entities
[5/7] *scan-routes    → Find and list API endpoints
[6/7] *scan-modules   → Identify modules and relationships
[7/7] *scan-business  → Infer business domains, epics, features, user roles
```

### Architecture Scan (`*scan-arch`)

Runs only architecture-relevant sub-scans:

```
[1/5] *scan-config    → Project type, framework detection
[2/5] *scan-tech      → Dependencies + versions
[3/5] *scan-structure → Folder tree
[4/5] *scan-models    → Data models / schemas
[5/5] *scan-routes    → API endpoints
```

### PRD Scan (`*scan-prd`)

Runs only business/PRD-relevant sub-scans:

```
[1/4] *scan-config    → Project name, description
[2/4] *scan-modules   → Module identification
[3/4] *scan-business  → Epics, features, user roles, requirements
[4/4] *scan-routes    → Route groups (for FR mapping)
```

---

## Sub-Scan Workflows

### scan-config

**Purpose:** Detect project type and configuration from config files.

1. Read `package.json` — extract: name, description, scripts, main fields
2. Glob for config files: `*.config.*`, `tsconfig*`, `.env*`, `.eslintrc*`, `.prettierrc*`, `docker*`, `Makefile`, `CLAUDE.md`, `README.md`
3. For each config file found, read ONLY the top-level keys/structure (not deep values)
4. Determine:
   - **Project type**: frontend / backend / fullstack / monorepo
   - **Framework**: Next.js / React / Express / NestJS / etc.
   - **Language**: TypeScript / JavaScript
   - **Package manager**: npm / yarn / pnpm
   - **Database**: from dependencies (mongoose→MongoDB, prisma→SQL, etc.)
   - **Deployment**: from docker/vercel/netlify config presence

**Output format:**

```
Project: {name}
Type: {fullstack}
Framework: {Next.js 16}
Language: {TypeScript 5}
Package Manager: {npm}
Database: {MongoDB via Mongoose}
Auth: {JWT / NextAuth / Clerk / custom}
UI: {shadcn/ui + Tailwind}
Testing: {Jest / Vitest / Playwright}
Deployment: {Vercel / Docker / custom}
```

---

### scan-tech

**Purpose:** Extract complete tech stack from package.json dependencies.

1. Read `package.json` — extract all `dependencies` and `devDependencies`
2. Categorize each dependency:

| Category | Detection Pattern |
|----------|------------------|
| Framework | next, react, vue, angular, express, nestjs, fastify |
| Language | typescript |
| Database | mongoose, prisma, typeorm, drizzle, pg, mysql2, redis |
| Auth | next-auth, jose, jsonwebtoken, passport, clerk |
| UI Library | @radix-ui, @headlessui, @mui, antd, shadcn |
| Styling | tailwindcss, styled-components, emotion, sass |
| State/Data | @tanstack/react-query, zustand, redux, swr, apollo |
| Validation | zod, yup, joi, class-validator |
| Testing | jest, vitest, playwright, cypress, testing-library |
| Build | webpack, vite, turbo, esbuild |
| Linting | eslint, prettier, biome |
| Utils | lodash, date-fns, dayjs, axios |

3. Extract version numbers
4. Note any unusual or notable dependencies

**Output:** Categorized dependency table with versions.

---

### scan-structure

**Purpose:** Map the project folder tree.

1. List top-level directories and files
2. For `src/` (or main source folder): expand to depth 3-4
3. For each folder, note:
   - Folder name → infer purpose (components, services, models, routes, utils, hooks, etc.)
   - File count per folder
   - Key files (index.ts, route.ts, page.tsx, layout.tsx, etc.)
4. Identify architecture pattern:
   - Feature-based (`src/features/{feature}/`)
   - Layer-based (`src/services/`, `src/models/`, `src/controllers/`)
   - Next.js App Router (`src/app/`)
   - Hybrid

**Output format for `source-tree.md`:**

Use tree-drawing characters (`├──`, `│`, `└──`) inside a fenced code block.
Each line = one folder with inline `# annotation` describing its purpose.

```
src/
├── app/
│   ├── (auth)/                  # Auth pages (login)
│   ├── (dashboard)/             # Protected pages
│   │   ├── finance/             # Funds, categories, transactions
│   │   └── system/              # Users, audit-logs
│   └── api/v1/                  # REST API routes
│       ├── auth/                # login, logout, me, refresh
│       └── users/               # CRUD + [id]/reset-password
├── components/
│   ├── forms/                   # Domain forms (~16 forms)
│   └── ui/                      # shadcn/ui primitives (25 components)
└── lib/
    └── db/models/               # Mongoose models (17 models)
```

**Output format for `source-tree.json`:**

Nested JSON object. Each folder = a key. Files listed in `_files` arrays.
For large folders (>6 files), summarize as `"[SCANNED] ~N {type} files"`.

```json
{
  "backend": {
    "_files": ["server.js", "package.json"],
    "controllers": {
      "_files": ["authController.js", "productController.js"]
    },
    "models": {
      "_files": ["productModel.js", "userModel.js"]
    }
  },
  "frontend": {
    "_files": ["package.json", "tsconfig.json"],
    "src": {
      "app": {
        "_files": ["layout.tsx", "page.tsx"],
        "auth": {
          "sign-in": { "_files": "[QUICK-SCAN] sign-in page" }
        }
      },
      "components": {
        "_files": ["Navbar.tsx"],
        "ui": {
          "_files": ["button.tsx"]
        }
      }
    }
  },
  "docs": {
    "_files": "[QUICK-SCAN] BMad-Lite documentation"
  }
}
```

---

### scan-models

**Purpose:** Identify data models/entities from schema/model files.

1. Glob for model files:
   - `**/models/**/*.{ts,js}`
   - `**/schemas/**/*.{ts,js}`
   - `**/entities/**/*.{ts,js}`
   - `**/*.model.{ts,js}`
   - `**/*.schema.{ts,js}`
   - `**/prisma/schema.prisma`
2. For each model file:
   - Extract **entity name** from file name or export name
   - Extract **field names and types** from schema definition (surface read — just the field declarations)
   - Note relationships (references to other models)
   - Do NOT read methods, statics, virtuals, or hooks logic
3. Build entity relationship summary

---

### scan-routes

**Purpose:** Identify API endpoints from route files.

1. Glob for route files:
   - `**/api/**/route.{ts,js}` (Next.js App Router)
   - `**/api/**/[...slug]/route.{ts,js}`
   - `**/routes/**/*.{ts,js}` (Express-style)
   - `**/controllers/**/*.{ts,js}`
2. For each route file:
   - Derive **endpoint path** from folder structure (e.g., `app/api/users/route.ts` → `GET/POST /api/users`)
   - Extract **HTTP methods** exported (GET, POST, PUT, PATCH, DELETE)
   - Do NOT read handler implementation
3. Group by domain

---

### scan-modules

**Purpose:** Identify business modules and their relationships.

1. From previous scans, identify distinct business domains:
   - Each API route group = potential module
   - Each model = potential module
   - Each feature folder = potential module
2. For each module, note:
   - **Name**: Domain name (e.g., "User Management", "Parish Management")
   - **Components**: Routes + Models + Services + UI components related
   - **Dependencies**: Which other modules it references
3. Build a module relationship map

---

### scan-business

**Purpose:** Infer business domains, features, user roles, and epic structure from project surface.

1. Aggregate business signals from previous scans:
   - **Route groups** → feature domains (e.g., `/api/users/` → User Management)
   - **Model names** → core business entities
   - **UI page files** (`page.tsx`, `layout.tsx`) → user-facing features
   - **Middleware files** → cross-cutting concerns (auth, RBAC, logging)
   - **RBAC/role constants** → user roles (grep for `role`, `permission`, `enum.*Role`)
   - **README.md / CLAUDE.md** → project description, goals (if available)
   - **package.json** → project name, description

2. Infer and produce:
   - **Project goals** (from README/CLAUDE.md description + domain patterns)
   - **User roles** (from auth/RBAC patterns, role enums, middleware)
   - **Feature list** → grouped as potential **Epics**
   - **Functional requirements** (1 FR per API route group)
   - **Non-functional requirements** (from config: caching, auth, i18n, testing presence)

3. For each inferred Epic:
   - **Epic title** — derived from module/domain name
   - **Epic goal** — 1-2 sentences from route + model + UI analysis
   - **Stories** — 1 story per major route or UI page (title + short description only, NOT full Gherkin)
   - Mark all with `[INFERRED]` tag

**Scan Depth:** Surface only — infers from names, structure, and config. Does NOT read business logic.

---

## Scan Depth Guidelines

| Artifact | Scan Depth | What to Extract |
|----------|-----------|-----------------|
| package.json | Full read | All deps, scripts, metadata |
| Config files | Top-level keys | Framework, version, options |
| Folder tree | Depth 3-4 | Names, file counts |
| Model files | Field declarations | Names, types, refs |
| Route files | Exports only | HTTP methods, paths |
| Service files | File name only | Service name, domain |
| Component files | File name only | Component name |
| Test files | Skip entirely | — |
| Style files | Skip entirely | — |
| Implementation | Skip entirely | — |
