# REST API Spec

## API Style
REST API

## Base URL
`/api`

## Unified Response Format
All backend API routes must strictly wrap returned payloads in a standardized, typed JSON envelope structure. No raw model arrays or objects should be sent directly.

```typescript
export interface IApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
  };
}
```

- All queries returning lists of items (e.g. materials, imports, exports) must return a payload conforming to `IApiResponse<T[]>` with the `meta` attribute containing page, limit, and total count metadata.
- All creation (POST) or update (PUT) endpoints must return the affected record under `IApiResponse<T>`.

## Authentication
Simulated/Simplified Session authentication checking headers for administrative requests (Farm Manager roles).

## Endpoints

### Material Catalog

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/materials` | List all materials, sorted alphabetically by name | No |
| POST | `/api/materials` | Create a new catalog material item | Yes |
| PUT | `/api/materials/:id` | Edit safety threshold/name of an existing item | Yes |

### Import Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/imports` | List all incoming transaction records, sorted by date descending | No |
| POST | `/api/imports` | Record a new incoming stock delivery | Yes |

### Export Transactions

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| GET | `/api/exports` | List all outgoing disbursements, sorted by date descending | No |
| POST | `/api/exports` | Record a new stock disbursement (performs stock checks) | Yes |
