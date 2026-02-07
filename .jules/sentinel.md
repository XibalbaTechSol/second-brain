## 2024-05-24 - Widespread IDOR in API Routes
**Vulnerability:** Several Next.js API routes (e.g., `entities/[id]`, `inbox/[id]`, `databases/route.ts`) expose sensitive data and mutations without verifying user ownership. They use `prisma.findUnique({ where: { id } })` relying solely on the ID for access control.
**Learning:** The application architecture lacks a centralized authorization middleware or pattern for resource access. Developers must manually implement `userId` checks in every route handler.
**Prevention:** Implement a helper function `requireEntityOwnership(id, userId)` or a higher-order function/middleware that wraps API handlers to enforce ownership checks automatically. Always scope Prisma queries with `{ userId: user.id }`.
