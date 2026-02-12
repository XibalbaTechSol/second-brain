## 2024-05-22 - Insecure Auth Provider Enabled in Production
**Vulnerability:** A `CredentialsProvider` meant for development convenience (auto-login/auto-create user without password) was configured in `apps/web/src/lib/auth.ts` without any environment check, exposing it in production.
**Learning:** Development convenience features can silently become critical production vulnerabilities if not strictly scoped. The lack of explicit environment checks made this provider active everywhere.
**Prevention:** Always wrap development-only authentication providers or insecure logic in strict `process.env.NODE_ENV === 'development'` checks. Review all auth providers before deployment.
