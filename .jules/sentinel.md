
## 2024-05-24 - [IDOR in Entity API]
**Vulnerability:** The `/api/entities/[id]` endpoint (GET, PUT, DELETE) previously lacked any authentication or authorization checks. Attackers could manipulate the `id` parameter to read, modify, or delete entities belonging to other users.
**Learning:** Next.js API route handlers in this project do not use middleware to enforce authentication by default. Each endpoint must explicitly authenticate the request (`getUser()`) and subsequently authorize access to resources (e.g., querying with `userId: user.id`). Because Prisma's `findUnique` requires unique constraints, `findFirst` is necessary when combining ID and ownership parameters.
**Prevention:** Always verify ownership for data modification operations. Ensure `getUser()` is called at the beginning of sensitive handlers, and all database queries must include a `userId` condition.
