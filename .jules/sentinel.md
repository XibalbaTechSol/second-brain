## 2023-10-27 - [CRITICAL] Data Exposure in API Routes
**Vulnerability:** The `/api/databases` route lacked authentication and authorization checks, exposing all inbox items, entities, and logs across the entire database to any unauthenticated user. This is a severe Insecure Direct Object Reference (IDOR) and Broken Access Control vulnerability.
**Learning:** Next.js API routes do not have middleware authentication enforced by default in this project. Each endpoint must explicitly verify the session using `getUser()` and scope Prisma queries using `userId`.
**Prevention:** Always explicitly call `getUser()` in API routes and include `userId` in Prisma `where` clauses (e.g., `where: { userId: user.id }`) when fetching or modifying user-specific data.
