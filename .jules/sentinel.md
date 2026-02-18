## 2025-02-23 - Unauthenticated Inbox Item Creation
**Vulnerability:** The `POST /api/inbox` endpoint allowed creating inbox items without authentication because it didn't check if `getUser()` returned null.
**Learning:** `getUser` helper from `@/lib/auth-helpers` does not enforce authentication; it only retrieves the user. API routes must explicitly check for `!user` and return 401.
**Prevention:** Use a middleware or helper function like `requireUser()` (if available) or explicitly check `if (!user)` at the start of protected API routes.
