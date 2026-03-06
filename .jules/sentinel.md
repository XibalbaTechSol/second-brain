
## 2024-05-23 - [Insecure File Upload Vulnerability]
**Vulnerability:** The `/api/upload` endpoint allowed unauthenticated file uploads of any type and size, writing directly to the public directory. This could lead to RCE via malicious file execution, storage exhaustion (DoS), and unauthorized hosting of malicious content.
**Learning:** API routes in this Next.js project do not have automatic middleware authentication by default. Endpoints under `apps/web/src/app/api/` must explicitly verify authentication and validate all inputs, especially when dealing with the file system.
**Prevention:** Always implement explicit authentication checks using `getUser()`, enforce strict file type validation (allowlisting), limit file sizes, and never trust user-provided filenames when saving files.
