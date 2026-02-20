## 2026-02-20 - Critical Authentication Backdoor Discovered
**Vulnerability:** The `CredentialsProvider` in NextAuth was configured to allow login and account creation with just an email address, completely bypassing password verification. This provider was active in all environments, including production.
**Learning:** Development convenience features ("Ignore security" comments) can easily be forgotten and deployed to production if not explicitly restricted.
**Prevention:** Always wrap development-only authentication providers or logic in `if (process.env.NODE_ENV === 'development')` checks immediately upon creation. Never commit "temporary" backdoors without environmental safeguards.
