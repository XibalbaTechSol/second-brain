## Sentinel's Journal

## 2024-XX-XX - [Insecure Direct Object Reference]
**Vulnerability:** Many API routes (e.g. `api/workflows/route.ts`, `api/databases/route.ts`) are missing authorization checks.
**Learning:** `getUser` is used in some routes (`api/entities/route.ts`, `api/inbox/route.ts`), but totally absent from others, leading to unauthorized access.
**Prevention:** Ensure `getUser` is called at the top of every API route and check if `user` exists. Ensure data operations use `user.id` or appropriate relationships to scope requests.
