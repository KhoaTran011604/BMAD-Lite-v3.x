# Security

## Input Validation
- **Validation Library:** Zod
- **Validation Location:** API route boundary
- **Required Rules:** Strict whitelist verification, stripping undocumented payload fields.

## Authentication & Authorization
- **Auth Method:** Session-based authentication or simple authentication cookie.
- **Session Management:** Stored securely in httpOnly cookies.

## Secrets Management
- **Development:** git-ignored `.env.local` file.
- **Production:** Vercel Environment Variables console.
- **Code Requirements:** NEVER commit secrets or credentials.

## API Security
- **Rate Limiting:** Next.js rate limiting middleware (100 requests per 15-minute window for transaction APIs).
- **CORS Policy:** Restrict queries to the web app's host domain.
- **HTTPS Enforcement:** Enforced natively by Vercel.

## Data Protection
- **Encryption at Rest:** MongoDB Atlas default storage encryption (AES-256).
- **Encryption in Transit:** Mandatory TLS 1.3 for database connection and API routes.
