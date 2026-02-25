## 2025-02-18 - [CRITICAL] Unprotected API Routes & Arbitrary File Upload
**Vulnerability:** several API routes (`/api/inbox`, `/api/upload`) were found without authentication checks. The `/api/upload` endpoint allowed unauthenticated arbitrary file uploads to the public directory, leading to potential Stored XSS and disk exhaustion.
**Learning:** Next.js Route Handlers are public by default and require explicit authentication checks. Developers must consistently apply `getUser()` or middleware protection.
**Prevention:** Implement a global middleware that protects `/api/*` routes by default, or use a higher-order function wrapper for API handlers to enforce auth. For now, manual checks are added.
