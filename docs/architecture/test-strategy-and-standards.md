# Test Strategy and Standards

## Testing Philosophy
- **Approach:** Test-after model schema drafting; test-driven validations on core stock levels.
- **Coverage Goals:** 80% coverage on database models, transaction calculations, and API routes.
- **Test Pyramid:** Focus on unit tests for model validations and integration tests for route boundaries.

## Test Types and Organization

### Unit Tests
- **Framework:** Vitest
- **File Convention:** `*.test.ts`
- **Location:** `tests/unit/`
- **Mocking Library:** native Vitest spies
- **Coverage Requirement:** 80% on schema hooks and data checks.

### Integration Tests
- **Scope:** API routes validation, MongoDB transactional updates.
- **Location:** `tests/integration/`
- **Test Infrastructure:** In-memory MongoDB Server (e.g. `mongodb-memory-server`) to mock active database interactions during test pipelines.

## Test Data Management
- **Strategy:** Seed new isolation models for every runner cycle.
- **Fixtures:** `tests/fixtures/`
- **Cleanup:** Clear collection entries in `afterEach()` hooks.

## Continuous Testing
Run ESLint, Prettier, and Vitest test commands on every pull request push via GitHub Actions.
