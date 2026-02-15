## 2025-02-12 - Authentication Bypass via Insecure Credentials Provider
**Vulnerability:** The `CredentialsProvider` in NextAuth was configured to allow login by email without password verification, and auto-created users. This was enabled in all environments, allowing anyone to impersonate any user or create arbitrary accounts.
**Learning:** Development convenience features ("Ignore security") were left exposed in production code. Conditional logic for environment-specific features must be explicit and tested.
**Prevention:** Always wrap insecure development-only features in `if (process.env.NODE_ENV === 'development')` checks. Review authentication configuration for production readiness.
