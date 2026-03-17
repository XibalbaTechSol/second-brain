## 2024-05-15 - [CRITICAL] Unauthenticated Arbitrary File Upload
**Vulnerability:** The `/api/upload` endpoint allowed unauthenticated, arbitrary file uploads to the local filesystem without size or MIME type restrictions.
**Learning:** Next.js API routes do not have middleware authentication by default. Endpoints handling sensitive actions like file uploads must explicitly verify the user session.
**Prevention:** Always use `getUser()` at the beginning of sensitive API routes and enforce strict file size and MIME type validation to prevent DoS attacks and Remote Code Execution.
