## 2026-02-04 - Critical Auth Bypass in NextAuth
**Vulnerability:** The CredentialsProvider implementation in `auth.ts` completely ignored the password field, allowing login by email only. It also auto-created users without password verification.
**Learning:** The code had an explicit comment "// "Ignore security" - auto create or just find", indicating a deliberate (temporary?) bypass that was left in. Always search for comments like "Ignore security" or "TODO".
**Prevention:** Enforce mandatory code reviews for auth logic. Use linting rules to flag empty or permissive auth checks.
