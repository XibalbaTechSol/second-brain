## 2025-02-18 - Insecure NextAuth Credentials Provider
**Vulnerability:** The NextAuth configuration in `apps/web/src/lib/auth.ts` included a `CredentialsProvider` that allowed login with any email address (creating a new user if necessary) without password verification. This provider was active in all environments, including production.
**Learning:** Development convenience features (like "magic login") can easily become critical backdoors if not explicitly restricted. Relying on "implicit" environment checks is dangerous; explicit conditionals must be used.
**Prevention:** Always wrap insecure/testing auth providers in `if (process.env.NODE_ENV === 'development')` blocks. Review `authOptions` or equivalent configuration files for any "bypass" mechanisms before deployment.
