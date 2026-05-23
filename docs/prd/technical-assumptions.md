# Technical Assumptions

## Repository Structure
Monorepo
Rationale: Single codebase structure for frontend components, API endpoints, schemas, and configurations allows streamlined deployments and extremely fast iterations.

## Service Architecture
Monolith
Rationale: A unified Next.js fullstack project hosting frontend layouts and serverless API route handlers. This provides high reliability, low overhead, and simplified maintenance.

## Testing Requirements
Unit + Integration
Rationale: Essential to enforce 100% correct inventory balance calculations, transactional logging constraints, and negative stock validations under unit tests.

## Additional Technical Assumptions and Requests
- Database: MongoDB is utilized for flexible document storage of catalog records, import records, and export records.
- Styling: Custom Vanilla CSS for modular styling, enabling premium glassmorphism layouts and high-performance transitions without Tailwind dependencies.
