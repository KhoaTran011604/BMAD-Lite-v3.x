# Technical Preferences

Optional file to pre-populate technical decisions in PRD and Architecture.
Customize this file for your project or team standards.

---

## How to Use

1. Copy this file to your project
2. Fill in your preferred technologies
3. Planner agent will use these to pre-populate documents
4. You can still override during document creation

---

## Language & Runtime

```yaml
language:
  primary: TypeScript
  version: "5.3.x"
  rationale: "Type safety, excellent tooling, wide ecosystem"

runtime:
  name: Node.js
  version: "20.x LTS"
  rationale: "Stable LTS, good performance, large ecosystem"
```

---

## Frameworks

```yaml
backend:
  framework: # Choose one
    # - NestJS (enterprise, DI, decorators)
    # - Express (minimal, flexible)
    # - Fastify (performance focused)
    # - Hono (edge-first, lightweight)
  version: ""
  rationale: ""

frontend:
  framework: # Choose one
    # - React (popular, flexible)
    # - Next.js (full-stack React)
    # - Vue (progressive)
    # - Svelte (compiled)
  version: ""
  rationale: ""

  state_management: # If applicable
    # - Zustand (simple)
    # - Redux Toolkit (feature-rich)
    # - TanStack Query (server state)
    # - Jotai (atomic)

  styling: # Choose one
    # - Tailwind CSS
    # - CSS Modules
    # - Styled Components
    # - Vanilla CSS
```

---

## Database

```yaml
database:
  type: # Choose one
    # - PostgreSQL (relational)
    # - MySQL (relational)
    # - MongoDB (document)
    # - SQLite (embedded)
  version: ""
  rationale: ""

  orm: # If applicable
    # - Prisma (type-safe)
    # - Drizzle (lightweight)
    # - TypeORM (decorators)
    # - Knex (query builder)
```

---

## Testing

```yaml
testing:
  unit:
    framework: # Vitest | Jest
    coverage_target: "80%"

  integration:
    framework: # Vitest | Jest | Supertest
    coverage_target: "70%"

  e2e:
    framework: # Playwright | Cypress
    scope: "critical paths"
```

---

## Infrastructure

```yaml
cloud:
  provider: # AWS | GCP | Azure | Vercel | Cloudflare
  rationale: ""

deployment:
  strategy: # Vercel | Docker | Kubernetes | Serverless
  ci_cd: # GitHub Actions | GitLab CI | CircleCI

environments:
  - development
  - staging
  - production
```

---

## Authentication

```yaml
auth:
  method: # JWT | Session | OAuth2
  provider: # Custom | Auth0 | Clerk | Supabase Auth
  rationale: ""
```

---

## Code Quality

```yaml
linting:
  - ESLint
  - Prettier

code_style:
  - "Functional programming preferred"
  - "Explicit over implicit"
  - "Small, focused functions"

naming:
  files: "kebab-case"
  components: "PascalCase"
  functions: "camelCase"
  constants: "SCREAMING_SNAKE_CASE"
```

---

## Project Structure

```yaml
structure:
  type: Monorepo | Polyrepo

  # If monorepo
  monorepo_tool: # Turborepo | Nx | pnpm workspaces

  # Common structure
  src_layout: # feature-based | layer-based
```

---

## Additional Preferences

```yaml
# Add any other preferences here
preferences:
  - "Prefer composition over inheritance"
  - "Use absolute imports"
  - "Co-locate tests with source files"
  - "Minimize external dependencies"
```
