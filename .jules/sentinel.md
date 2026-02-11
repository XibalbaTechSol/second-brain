## 2024-05-22 - [CRITICAL] Unprotected Credentials Provider
**Vulnerability:** The `CredentialsProvider` in NextAuth was configured to allow login with any email address without password verification, and would auto-create users if they didn't exist.
**Learning:** This provider was likely intended for development ease but was not conditionally restricted, exposing a massive authentication bypass in any environment where NextAuth endpoints are accessible.
**Prevention:** Always wrap development-only authentication providers in `process.env.NODE_ENV === 'development'` checks. Verify authentication flows in production builds.
