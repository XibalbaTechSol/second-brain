## 2024-05-24 - API Route IDOR Vulnerability
**Vulnerability:** Insecure Direct Object Reference (IDOR) on Next.js API routes (`apps/web/src/app/api/entities/[id]/route.ts`). Endpoints used `findUnique({ where: { id } })` without checking `userId`.
**Learning:** Next.js API routes in this project lack default middleware authentication. Without explicit `getUser()` checks and query scoping (`userId`), any authenticated or unauthenticated user can access/modify other users' data by guessing IDs.
**Prevention:** Always explicitly call `getUser()` in API routes and use `findFirst({ where: { id, userId: user.id } })` to enforce data ownership and prevent unauthorized access.
