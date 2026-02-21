## 2025-02-18 - Critical Authentication Bypass in Production

**Vulnerability:** The `CredentialsProvider` in `apps/web/src/lib/auth.ts` was configured to bypass password checks and automatically create users based on email input alone. This configuration was not restricted to development environments, potentially allowing unauthorized access in production.

**Learning:** Development-only shortcuts (like "magic login" for testing) can easily leak into production if not explicitly guarded. Relying on comments like `"Ignore security"` is insufficient.

**Prevention:** Always wrap insecure development utilities in strict environment checks (`process.env.NODE_ENV === 'development'`). Use type-safe conditional logic to exclude these providers entirely from production builds.
