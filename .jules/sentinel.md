## 2025-02-03 - [Critical Auth Bypass in NextAuth]
**Vulnerability:** The NextAuth `CredentialsProvider` contained logic explicitly commented "Ignore security" that allowed authentication by email only, bypassing password verification and creating users automatically if they didn't exist.
**Learning:** The `User` model was missing a `password` field entirely, likely relying on OAuth or Supabase, but the NextAuth endpoint was left exposed and insecure.
**Prevention:** Always ensure `authorize` callbacks in NextAuth verify credentials (passwords) securely using `bcrypt` or similar. Do not leave "stubbed" auth logic in accessible endpoints. Ensure database schema supports the authentication methods implemented.
