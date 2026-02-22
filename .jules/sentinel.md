# Sentinel Journal

## 2026-02-22 - Disable Insecure Credentials Provider
**Vulnerability:** The `CredentialsProvider` allowed any user to log in with just an email address and no password, effectively bypassing authentication for any account.
**Learning:** This was a "development convenience" feature (mock login) that was not restricted to the development environment, exposing production to account takeover via the `/api/auth/callback/credentials` endpoint.
**Prevention:** Always wrap insecure/mock providers in `process.env.NODE_ENV === 'development'` checks. Ensure that production builds do not include test/mock logic that can bypass security controls.
