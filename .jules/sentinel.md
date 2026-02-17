## 2026-02-17 - Insecure Default Authentication Provider
**Vulnerability:** The NextAuth configuration included a `CredentialsProvider` that allowed login with any email address (creating a new user if necessary) without a password. This provider was active in all environments, including production.
**Learning:** Development convenience features (like passwordless login) can easily leak into production if not explicitly guarded. Relying on "we won't use it" is not enough; the code must actively prevent it.
**Prevention:** Always wrap development-only features in `if (process.env.NODE_ENV === 'development')` blocks. Audit authentication configurations to ensure only approved providers are enabled in production.
