## 2025-02-17 - [IDOR in Entity API]
**Vulnerability:** The `/api/entities/[id]` endpoints allowed full read, update, and delete access to any entity ID without checking if the requester was authenticated or if they owned the entity.
**Learning:** Next.js API routes in this application do not have global middleware enforcing authentication or scoping database queries by `userId`. Authentication must be manually enforced on a per-route basis.
**Prevention:** Always explicitly call `getUser()` in API routes and use `findFirst` to scope Prisma queries to `userId: user.id` before allowing access, modifications, or deletions to sensitive records.
