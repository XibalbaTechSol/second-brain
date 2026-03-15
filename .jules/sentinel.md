## 2025-03-15 - [Search API IDOR & Data Exposure Fix]
**Vulnerability:** Insecure Direct Object Reference (IDOR) and Unauthenticated Data Exposure in `apps/web/src/app/api/search/route.ts`. The endpoint originally returned all entities from the database (`prisma.entity.findMany`) with no authentication or user-scoping.
**Learning:** Next.js API Routes in this application do not automatically enforce authentication. Unprotected routes exposed all user data unconditionally, failing to align with the Principle of Least Privilege.
**Prevention:** All API routes (`app/api/*`) retrieving user data must explicitly invoke `getUser()` (handling unauthorized results) and properly scope database queries via `where: { userId: user.id }`.
