## 2024-10-27 - Hardcoded Auth Bypass in CredentialsProvider
**Vulnerability:** A `CredentialsProvider` was configured in NextAuth that completely ignored the password field and allowed any user to log in or create an account by simply providing an email address.
**Learning:** "Development conveniences" like skipping auth checks can easily be left in production code if not guarded or removed. The comment `// "Ignore security" - auto create or just find` explicitly stated the intent to bypass security.
**Prevention:** Never commit code that bypasses authentication, even for testing. Use mocks or dedicated test environments. Audit auth configurations for comments like "ignore security".
