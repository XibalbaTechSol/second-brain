
## 2025-03-05 - [CRITICAL] Fixed IDOR in Entities API
**Vulnerability:** The `/api/entities/[id]` endpoints (GET, PUT, DELETE) lacked authentication and authorization checks. Any user could retrieve, modify, or delete entities belonging to other users simply by providing the entity ID in the URL.
**Learning:** Next.js API route handlers in this project do not use Next.js middleware for authentication by default. Thus, `getUser()` must be explicitly called in every endpoint. Furthermore, `id` alone is insufficient when fetching resources owned by users; the query must verify ownership by scoping to `userId` (e.g., using `findFirst` with `where: { id, userId }`).
**Prevention:** Always use `getUser()` at the top of protected API routes, and always scope Prisma queries using `userId` to verify object ownership and prevent IDOR.
