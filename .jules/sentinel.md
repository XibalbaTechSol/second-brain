## 2026-02-23 - [Authentication Bypass via Dev Tools]
**Vulnerability:** A `CredentialsProvider` in NextAuth was configured to allow login by email without password verification. This provider was active in all environments, allowing anyone to impersonate any user by knowing their email address.
**Learning:** Development-only tools (like mock authentication providers) must always be explicitly guarded by environment checks (e.g., `process.env.NODE_ENV === 'development'`). Relying on "assumed" usage is insufficient.
**Prevention:**
1. Always wrap development-only providers or routes in strict environment checks.
2. Ensure that "mock" authentication providers still perform basic validation or are completely disabled in production builds.
3. Use automated tests to verify that dangerous providers are NOT present in production builds.
