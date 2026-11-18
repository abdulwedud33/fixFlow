# tools.md — Development Tools and Integrations

## 1. Core development tools

| Tool | Purpose | Rule |
|---|---|---|
| Node.js LTS | Runtime | Pin supported major version |
| TypeScript | Type safety | Strict mode enabled |
| pnpm or npm | Package management | Pick one and commit lockfile |
| Next.js | Web app | Follow current stable docs |
| Express | API | Keep modular route/service boundaries |
| PostgreSQL | Database | RLS and constraints are mandatory |
| Prisma | ORM/migrations | Use SQL migrations for RLS and advanced DB features |
| Zod | Validation | Shared schemas where practical |
| Tailwind CSS | Styling | Use semantic tokens from DESIGN.md |
| shadcn/ui | Accessible component base | Review component code; do not blindly install everything |
| Playwright | Browser E2E | Cover critical workflows |
| Vitest/Jest | Unit/integration tests | Match repository conventions |
| GitHub | Source control/CI | Protect main branch and review migrations |

## 2. Optional services

### Hosting
- Frontend: CDN/static asset hosting where compatible with Next.js deployment mode.
- API: managed Node.js application hosting.
- Database: managed PostgreSQL with automated backups.
- Keep staging and production isolated.

### SMS
Use a provider adapter with a stable internal interface:
```ts
interface SmsProvider {
  send(input: { to: string; message: string; idempotencyKey: string }): Promise<{
    providerMessageId?: string;
    status: "accepted" | "rejected" | "unknown";
  }>;
}
```
Before selecting a provider, verify Ethiopia coverage, local sender ID requirements, delivery receipts, pricing, throughput, data processing terms and support. Keep provider credentials server-side. Use a fake provider in tests.

### File/object storage
Use private buckets for intake images and exports. Signed URLs must be short-lived and authorized. Validate MIME type, file signature, size and image dimensions. Strip EXIF metadata where appropriate.

### Email
Only add transactional email if the onboarding or account recovery workflow requires it. Use verified sending domain and provider adapter.

## 3. Environment variables

Example names only; never commit values:
```text
NODE_ENV=
WEB_ORIGIN=
API_ORIGIN=
DATABASE_URL=
DIRECT_DATABASE_URL=
SESSION_SECRET=
AUTH_ISSUER_URL=
AUTH_CLIENT_ID=
AUTH_CLIENT_SECRET=
SMS_PROVIDER=
SMS_API_KEY=
SMS_SENDER_ID=
OBJECT_STORAGE_ENDPOINT=
OBJECT_STORAGE_BUCKET=
OBJECT_STORAGE_ACCESS_KEY=
OBJECT_STORAGE_SECRET_KEY=
```

- `NEXT_PUBLIC_*` values are public and must never contain secrets.
- Validate required environment variables at server startup.
- Use a secret manager or hosting environment settings.
- Rotate exposed credentials immediately.

## 4. Local developer workflow

Illustrative commands; adjust to actual scripts:
```bash
pnpm install
pnpm dev
pnpm lint
pnpm typecheck
pnpm test
pnpm test:e2e
pnpm prisma:generate
pnpm prisma:migrate
```

Do not run destructive database reset commands against staging or production.

## 5. API rate limits

Rate-limit all API routes. Initial example limits (tune using observed usage):
- Login/OTP/password recovery: strict per-IP and per-identity limits.
- Public tracking: strict per-IP and per-token limits.
- Search: moderate per-user/shop limit.
- Standard authenticated reads/writes: per-user and per-shop limits.
- SMS send: per-shop budget, recipient and daily spend cap.
- Exports/uploads: concurrency and size limits.

Use a shared store (e.g. Redis or a managed rate-limit service) in multi-instance production. In-memory limits alone are not sufficient across instances.

## 6. CI/CD

On each pull request:
- Format check.
- Lint.
- Typecheck.
- Unit and integration tests.
- Migration validation.
- Dependency/security scan.
- Secret scan.
- Build frontend and backend.
- Optional preview deployment with synthetic data.

Production deployment:
- Approval required.
- Backup/restore plan for risky migrations.
- Apply migrations as a controlled step.
- Health check and smoke test.
- Rollback procedure documented.
