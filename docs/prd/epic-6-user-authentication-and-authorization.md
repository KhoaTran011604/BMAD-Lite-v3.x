# Epic 6: User Authentication & Role-Based Access Control (RBAC)

**Goal:** Secure AgriKeep with a standard credentials-based login and registration system. Implement robust route guards, active session context, and replace simulated authorization headers with actual secure httpOnly cookie session validation.

---

## Story 6.1: Define User Schema & Authentication API
**As a** Farm Developer,  
**I want** to store authenticated user credentials securely in MongoDB and provide register, login, logout, and session check APIs,  
**so that** users can securely access their accounts and have their roles checked dynamically.

### Acceptance Criteria:
1. **Given** a new registration request, **When** validating input data, **Then** it must strictly enforce Zod rules: `username` (alphanumeric, min 3 chars, required), `password` (min 6 chars, required), and `role` (must be `Manager`, `FarmManager`, or `Worker`; required).
2. **Given** a new user, **When** persisting to the database, **Then** the system must securely hash the password using a salted PBKDF2 cryptography utility in Node.js, storing both `passwordHash` and `salt`.
3. **Given** login credentials, **When** verified successfully, **Then** the server must generate a secure, encrypted token containing user identity (username, role) and issue it within an `httpOnly`, `secure`, `sameSite: 'lax'` cookie with a 24-hour expiration.
4. **Given** a logout request, **When** received, **Then** the server must invalidate and clear the session cookie.

---

## Story 6.2: Replace Simulated Authorization Header with Secure Cookies
**As a** Farm Developer,  
**I want** existing material and transaction logging API endpoints to validate user sessions using the secure cookie instead of unauthenticated simulated headers,  
**so that** AgriKeep is protected against unauthorized role-spoofing.

### Acceptance Criteria:
1. **Given** any write or sensitive API endpoints (`POST /api/materials`, `POST /api/imports`, `POST /api/exports`), **When** invoked, **Then** the endpoint must extract and decrypt the secure session cookie to retrieve the authenticated user profile.
2. **Given** a user role of `Worker`, **When** attempting a write operation (e.g. creating a material or logging a transaction), **Then** the server must reject the operation with a `403 Forbidden` error.
3. **Given** a request without an active session cookie, **When** attempting any write operation, **Then** the server must reject the request with a `401 Unauthorized` error.

---

## Story 6.3: Login & Register Pages UI (Vanilla CSS & Responsive)
**As a** Warehouse Operator,  
**I want** clean, modern, and beautiful glassmorphic pages to log in or register a new user,  
**so that** I can seamlessly onboard and authenticate on both desktop and mobile devices.

### Acceptance Criteria:
1. **Given** the login or register page, **When** rendered, **Then** it must display a stunning visual style utilizing Outfit typography, vibrant glassmorphic gradients, glowing borders, and fully responsive layouts matching existing pages.
2. **Given** form validation, **When** submitting incomplete or invalid fields, **Then** the fields must highlight in a soft red hue and show descriptive error messages below the input without reloading the page.
3. **Given** an API request dispatch, **When** pending, **Then** the submit button must transition to an elegant loading state and disable double submissions.

---

## Story 6.4: Auth Context & Client-Side Navigation Guards
**As a** Farm Manager,  
**I want** the client app to guard private pages and dynamically alter navigation options based on the user's active session,  
**so that** unauthenticated visitors are prevented from inspecting inventory, and roles are visually reflected.

### Acceptance Criteria:
1. **Given** the application load lifecycle, **When** initialized, **Then** it must execute a background `/api/auth/me` request to hydrate the client-side `AuthContext` state.
2. **Given** private routes (`/`, `/catalog`, `/history`), **When** visited by an unauthenticated browser, **Then** the application must instantly redirect the user to `/login`.
3. **Given** an authenticated user accessing the application, **When** rendering the `Sidebar` navigation, **Then** it must display the user's `username` alongside a visual role badge (`Manager` / `Worker`) and expose a clear "Logout" action.
