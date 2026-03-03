## 2024-03-03 - [CRITICAL] Unauthenticated File Upload & Missing Validation
**Vulnerability:** The `/api/upload` endpoint was entirely unauthenticated, allowed any file type (including HTML/JS, leading to stored XSS), and lacked size limits (DoS risk).
**Learning:** Next.js API routes in this codebase do not have global authentication middleware by default. Endpoints like file uploads must explicitly implement `getUser()` checks. Furthermore, UI-level file restrictions (`accept="image/*"`) do not prevent malicious direct API requests.
**Prevention:** Always explicitly check `getUser()` on sensitive endpoints. Always validate file type (MIME type) and file size on the server side, even if the client-side UI has restrictions.
