# Sentinel's Journal

## 2026-02-17 - Insecure Credentials Provider Bypass
**Vulnerability:** A NextAuth CredentialsProvider was configured to allow login by email without password verification, and automatically create users with trial subscriptions.
**Learning:** Development-only "convenience" features often make it into production code if not explicitly gated by environment checks.
**Prevention:** Always wrap insecure dev-only auth providers in `process.env.NODE_ENV === 'development'` checks and add prominent security warnings.
