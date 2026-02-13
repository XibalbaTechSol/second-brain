# Sentinel's Journal

## 2025-02-18 - Insecure Credentials Provider
**Vulnerability:** `CredentialsProvider` in `apps/web/src/lib/auth.ts` was enabled in all environments and allowed anyone to log in as any user (or create a new user) by simply providing an email address, completely bypassing password verification. This is effectively an authentication bypass.
**Learning:** Development convenience features (like bypassing auth for testing) must always be gated behind environment checks. Relying on "just don't use it in production" is insufficient if the code is deployed.
**Prevention:** Always restrict insecure auth providers or debug features to `NODE_ENV === 'development'` or `NODE_ENV === 'test'`. Use strict environment checks and verify them in CI/CD pipelines.
