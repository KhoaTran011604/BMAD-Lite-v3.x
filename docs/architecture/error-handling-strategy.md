# Error Handling Strategy

## General Approach
API endpoints return standard HTTP status codes combined with an RFC-compliant JSON payload containing user-friendly errors.

## Logging Standards
- **Library:** Winston / Native console wrappers.
- **Format:** JSON structured logs in production; colorized text logs in development.
- **Levels:** DEBUG, INFO, WARN, ERROR.

## Error Handling Patterns

### External API Errors
N/A (No external APIs).

### Business Logic Errors
- **Custom Exceptions:** `ValidationError`, `InsufficientStockError`, `DatabaseConnectionError`.
- **User-Facing Errors:** Input fields highlight error messages from Zod schemas; stock check failures display a global red toast message.

### Data Consistency
Stock increments and decrements use atomic operations (`$inc`) and check available levels to prevent double-spending or negative balances.
