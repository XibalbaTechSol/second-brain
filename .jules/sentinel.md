# Sentinel Journal 🛡️

## 2024-05-22 - Critical: Insecure Direct Authentication
**Vulnerability:** The `CredentialsProvider` in `apps/web/src/lib/auth.ts` was implementing a "bypass" authentication strategy. It allowed anyone to log in as any user simply by knowing their email address. If the user didn't exist, it would automatically create a new account without a password. This effectively meant NO password verification existed for the application.

**Learning:** "Convenience" features like auto-provisioning or "easy login" during development can catastrophicly compromise security if deployed to production. The comment `// "Ignore security" - auto create or just find` explicitly indicated this was a known shortcut that wasn't cleaned up.

**Prevention:**
1.  **Never** implement "bypass" auth mechanisms in code that can reach production.
2.  Always enforce password hashing and verification from day one.
3.  Use linting rules or security scanners to catch comments like "Ignore security" or "TODO: Fix security".
4.  Ensure `CredentialsProvider` always verifies the `password` field against a hashed value in the database.
