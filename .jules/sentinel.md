## 2024-05-23 - Critical Auth Bypass in NextAuth Configuration

**Vulnerability:** The `CredentialsProvider` in NextAuth was configured to allow logging in with any email without a password, and this provider was enabled in all environments, including production.

**Learning:** Development-only conveniences (like passwordless login for quick testing) can easily leak into production if not explicitly guarded. Relying on "I'll remember to remove this" or "This is just for now" is dangerous.

**Prevention:** Always wrap development-only code blocks with strict environment checks (e.g., `process.env.NODE_ENV === 'development'`). Use type-safe configuration objects where possible to enforce these checks at compile time or during startup.
