# Tech Stack

## Cloud Infrastructure
- **Provider:** Vercel (Frontend & Serverless API Routes) + MongoDB Atlas (Database)
- **Key Services:** Next.js Serverless Functions, MongoDB Atlas Serverless (Shared tier)
- **Deployment Regions:** ap-southeast-1 (Singapore) / us-east-1 (N. Virginia)

## Technology Stack Table

| Category | Technology | Version | Purpose | Rationale |
|----------|------------|---------|---------|-----------|
| Language | TypeScript | 5.3.x | Primary language | Strong typing, excellent autocomplete and refactoring. Strict type safety, absolute ban on `any`. |
| Runtime | Node.js | 20.x LTS | Server runtime | Stable LTS release, massive library ecosystem |
| Framework | Next.js (App Router) | 14.x | Fullstack Web App | Seamless integration of frontend React and backend serverless API routes |
| Database | MongoDB | 7.x | Primary database | High performance, document-based storage matching transaction structures |
| ODM | Mongoose | 8.x | Object Data Modeling | Dynamic database schema validation and relational references in MongoDB |
| Styling | Vanilla CSS | CSS3 | Visual styles & UI | Complete flexibility to craft glowing animations, custom dark mode variables, and glassmorphism |
| State Mgmt | TanStack React Query | v5 | Server state caching | Automatic background fetching, request caching, and query key separation per module |
| Form Library | React Hook Form | 7.x | Client form handling | Standardized form lifecycle, error management, and Zod resolver integration |
| Tables | TanStack Table | v8 (react-table) | Client table UI | Headless component for robust sorting, filtering, and paging of inventory grids |
| Testing | Vitest | 1.x | Test runner | Blazing fast ESM-first unit and integration testing |
| Validation | Zod | 3.x | Schema Validation | Whitelist validations at API boundaries (BE) and form layers (FE) |
