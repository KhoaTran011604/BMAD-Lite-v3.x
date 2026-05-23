# Coding Standards

## Core Standards
- **Languages & Runtimes:** TypeScript 5.3.x, Node.js 20.x
- **Style & Linting:** ESLint + Prettier rules
- **Test Organization:** Tests located under `/tests` folder, divided into `/tests/unit` and `/tests/integration`.

## Naming Conventions
| Element | Convention | Example |
|---------|------------|---------|
| Files | kebab-case | custom-toast.tsx |
| Components | PascalCase | QuickActionDrawer.tsx |
| Functions | camelCase | calculateStockTotal |

## Critical Rules
- **Rule 1 (English Only Policy):** All source files, comments, PRDs, and architecture documents MUST be written entirely in English.
- **Rule 2 (Complete Type Safety - Ban on `any`):** The `any` keyword is strictly prohibited throughout the entire codebase (both frontend and backend). Every single variable, function parameter, query parameter, mutation payload, and response object must feature explicit, strong TypeScript typing. Use generics, interface inheritance, or `unknown` with type guards if a type is highly dynamic.
- **Rule 3 (Dual-Layer Data Validation - BE & FE):** Data validation must occur independently on both layers:
  - **Frontend:** validated using `react-hook-form` paired with a Zod schema resolver (`@hookform/resolvers/zod`) to reject invalid inputs before API invocation.
  - **Backend:** validated in Next.js Serverless API handlers using Zod parsing (`parse` or `safeParse`) at the API route boundary before querying database schemas.
- **Rule 4 (Decoupled Query & Mutation Modules):** Query hooks and mutation hooks must be decoupled and organized per business domain module (e.g. `queries.ts` and `mutations.ts` within the respective feature directories). Do not merge queries and mutations in the same files.
- **Rule 5 (Centralized Query Key Management):** All query keys must be managed in a centralized key factory dictionary (e.g., in `src/lib/query-keys.ts`) to maintain consistency and prevent stale cache/cache invalidation mismatch bugs.
- **Rule 6 (Decoupled UI Side Effects in Mutations):** Mutation custom hooks must be pure and free of direct UI notifications (such as `toast.success()`, browser `alert()`, or toast side effects). They must bubble success and error statuses back to calling UI components using callback parameters (`onSuccess`, `onError`) so that representation components maintain exclusive control over UI interactions.
- **Rule 7 (Strict Type Bindings for Queries & Mutations):** Every query and mutation custom hook must enforce strict type bindings on input variables, options, and server returns (e.g., `useMutation<IApiResponse<IMaterial>, Error, ICreateMaterialDto>`).
- **Rule 8 (Negative Inventory Prevention):** The system must never accept an export transaction that exceeds the available stock on hand. This is validated on both FE (form state checks) and BE (Mongoose transactions).
- **Rule 9 (Absolute Ban on N+1 Queries):** DB querying inside loops is strictly prohibited. For relational or referenced data retrieval, developers must leverage Mongoose `.populate()`, MongoDB aggregation pipelines (`$lookup`), or bulk queries via `$in`.
- **Rule 10 (Numeric Table Alignment):** All table columns representing numerical, quantity, currency, or unit data must align both their header titles and cell values to the right. Dynamic cells must output raw numeric values only, and UOM or currency symbols must be declared inside the column header.
- **Rule 11 (Unified Formatting Utility):** Creating local formatting utilities or closures is strictly prohibited. All components, hooks, and API routes must import date, time, and currency formatters from a centralized utility provider (`src/lib/utils.ts`).

