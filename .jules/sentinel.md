## 2024-05-23 - Critical Credentials Vulnerability
**Vulnerability:** Found an unrestricted CredentialsProvider in NextAuth configuration that allows passwordless login for any email address, including creating new accounts.
**Learning:** Development-only authentication mechanisms must be explicitly guarded against production deployment using strict environment checks. relying on comments like "Ignore security" is dangerous.
**Prevention:** Always wrap development-only providers in `process.env.NODE_ENV === "development"` checks and verify production build configurations.
