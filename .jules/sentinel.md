## 2024-05-18 - Missing Authentication and IDOR in API Routes
**Vulnerability:** Several Next.js API routes (e.g., `apps/web/src/app/api/entities/[id]/route.ts`, `apps/web/src/app/api/databases/route.ts`) completely lack authentication checks (via `getUser()`) and do not enforce tenant isolation (`userId` checks on database operations).
**Learning:** In Next.js App Router, middleware does not currently block unauthenticated requests in this project. Each API route that handles sensitive data MUST explicitly fetch the user with `getUser()` and validate ownership before querying or mutating the database. Relying solely on UI-level hiding is insufficient.
**Prevention:** Every protected API route must:
1. Call `const user = await getUser();`
2. Return early `if (!user) { return NextResponse.json({ error: 'Unauthorized' }, { status: 401 }); }`
3. Always include `userId: user.id` in Prisma `where` clauses when querying, updating, or deleting to prevent Insecure Direct Object Reference (IDOR).
