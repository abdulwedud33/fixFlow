# 02 — Technical Requirements Document (TRD)

## 1. Architecture overview

Use a modular monolith for the MVP: one backend deployment with clearly separated domain modules. This is simpler to operate than microservices while preserving boundaries for future extraction.

```text
Browser / Installable PWA
        |
        | HTTPS, access token/session
        v
Next.js Web App
        |
        | Typed REST API
        v
Node.js + Express API
  | Auth & authorization
  | Tenant context
  | Customers / Devices
  | Repairs / Workflow
  | Payments
  | Inventory (P1)
  | Notifications (P1)
  | Audit / Reporting
        |
        v
PostgreSQL + Prisma + RLS
        |
        +--> Object storage (optional intake photos)
        +--> SMS provider adapter (P1)
        +--> Background job worker / queue
```

The browser is untrusted. All business rules, access checks, validation and secret-bearing integrations live on the server.

## 2. Recommended stack

| Layer | Choice | Notes |
|---|---|---|
| Frontend | Next.js + TypeScript | Responsive app; use server/client components deliberately |
| UI | Tailwind CSS + shadcn/ui | Shared design tokens and accessible primitives |
| Forms | React Hook Form + Zod | Client feedback plus server-side validation |
| Data fetching | TanStack Query or a consistent server-action/API approach | Avoid duplicate state sources |
| Backend | Node.js + Express + TypeScript | Modular monolith, REST API |
| Validation | Zod | Parse and validate at every trust boundary |
| Database | PostgreSQL | Source of truth; enforce constraints and RLS |
| ORM | Prisma | Migrations and typed data access; use SQL migrations for RLS/policies |
| Auth | Secure server-managed session or established OIDC/auth library | Avoid home-grown password/session cryptography |
| Jobs | Managed queue or PostgreSQL-backed job queue | SMS, exports and retries |
| Testing | Vitest/Jest, Supertest, Playwright | Unit, integration, E2E |
| Hosting | CDN/static asset hosting for frontend where compatible; managed Node hosting for API | Do not force static export if app features require runtime rendering |
| Observability | Structured logs + error monitoring + uptime checks | Redact PII and secrets |

Pin versions in lockfiles. Review dependency health and license before adoption.

## 3. Application boundaries

### Frontend responsibilities
- Render pages and interaction states.
- Provide client-side validation for usability.
- Send requests to the API.
- Display safe user-facing errors and progress feedback.
- Cache non-sensitive app shell/assets.
- Hold no privileged credentials, database URL, SMS keys or signing secrets.

### Backend responsibilities
- Authenticate user and resolve active tenant membership.
- Authorize every action against role and resource ownership.
- Validate all inputs and state transitions.
- Calculate totals, balances and derived values.
- Enforce idempotency and transaction boundaries.
- Apply tenant context for RLS.
- Call external services through adapters.
- Record audit events.

### Database responsibilities
- Enforce primary/foreign keys, unique constraints and check constraints.
- Enable and force RLS on tenant-owned tables.
- Prevent invalid states that can be expressed as constraints.
- Preserve payment and audit history.
- Use transactions for multi-record operations.

## 4. API conventions

- Prefix: `/api/v1`.
- JSON over HTTPS.
- Use consistent response envelopes and stable error codes.
- Use cursor pagination for growing lists.
- Filter and sort only through allowlisted fields.
- Use ISO 8601 UTC timestamps in API responses; render local time in UI.
- Use ETB amounts as integer minor units where currency precision allows; otherwise use `NUMERIC(p,s)` with explicit decimal handling. Never use binary floating point for money.
- Use idempotency keys for ticket creation retries, payment recording and notification enqueue.
- Support request IDs and correlation IDs.
- Do not expose ORM errors, SQL messages, stack traces or internal provider payloads.

Example success:
```json
{"data":{"id":"...","status":"RECEIVED"},"meta":{"requestId":"..."}}
```

Example safe error:
```json
{"error":{"code":"VALIDATION_ERROR","message":"Check the highlighted fields.","fieldErrors":{"phone":"Enter a valid phone number."},"requestId":"..."}}
```

## 5. Initial API resource map

| Method | Route | Purpose |
|---|---|---|
| POST | `/auth/login` | Authenticate |
| POST | `/auth/logout` | End session |
| GET | `/me` | Current user and memberships |
| GET/POST | `/shops` | List/create shops |
| GET/PATCH | `/shops/:shopId` | Read/update shop |
| GET/POST | `/customers` | Search/create customers |
| GET/PATCH | `/customers/:id` | Read/update customer |
| GET/POST | `/devices` | Search/create devices |
| GET | `/repairs` | Filter repair tickets |
| POST | `/repairs` | Create ticket |
| GET/PATCH | `/repairs/:id` | Read/update permitted fields |
| POST | `/repairs/:id/transitions` | Apply status transition |
| POST | `/repairs/:id/assignments` | Assign technician |
| POST | `/repairs/:id/notes` | Add work note |
| POST | `/repairs/:id/payments` | Record payment |
| GET | `/repairs/:id/receipt` | Generate receipt |
| GET | `/dashboard/summary` | Operational summary |
| GET | `/audit-events` | Authorized audit search |

Inventory, warranty and SMS routes are P1. Public tracking routes must use a high-entropy token, strict rate limits and minimal data disclosure.

## 6. Multi-tenancy and authorization

- Every tenant-owned row includes `shop_id` (or organization/tenant key).
- A user must have an active membership in the requested shop.
- The API derives tenant context from authenticated membership; never trust a client-supplied tenant ID alone.
- Every query includes tenant scope even with RLS enabled.
- RLS provides a second enforcement layer.
- Use least-privilege database roles. The app runtime role must not own tables or have `BYPASSRLS`.
- Set tenant context transaction-locally, e.g. `SET LOCAL app.current_shop_id = '...'`, within the same database transaction/connection used for queries.
- With pooled connections, never use a session-level tenant setting that can leak across requests.
- Test RLS using the actual runtime database role, not a superuser or table owner.
- Enable `FORCE ROW LEVEL SECURITY` on tenant tables where appropriate.
- Background jobs must carry a verified tenant context and use a scoped service pathway.

## 7. RLS policy pattern

Illustrative SQL; adapt to actual schema and verify with integration tests:

```sql
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

CREATE POLICY customers_shop_isolation
ON customers
USING (
  shop_id = current_setting('app.current_shop_id', true)::uuid
)
WITH CHECK (
  shop_id = current_setting('app.current_shop_id', true)::uuid
);
```

Do not assume this policy alone handles membership. The API must verify membership before setting tenant context. Consider a database membership predicate or security-definer function if database-level membership verification is required. Security-definer functions must have fixed `search_path`, minimal privileges and careful review.

Create equivalent policies for every tenant-owned table. Global lookup tables may not need tenant RLS if they contain no customer/business data.

## 8. Offline and synchronization requirements

MVP:
- Cache app shell and static assets.
- Show connectivity state without blocking online workflows.
- Permit local drafts only for explicitly supported forms.
- Store pending operations in IndexedDB with schema version, tenant/user binding, operation ID and creation time.
- Synchronize through authenticated API with idempotency keys.
- Revalidate authorization on the server at sync time.
- Detect conflicts; do not silently overwrite newer server data.
- Clear sensitive local data on logout, tenant switch and session expiry.
- Do not cache financial or customer PII in shared browser caches by default.

P1:
- Add a conflict resolution UI and a clear retry queue.
- Keep a server audit trail for accepted synchronized operations.

## 9. Performance and reliability

- Compress HTTP responses (Brotli/Gzip where supported); avoid oversized payloads.
- Select only required database fields; avoid unbounded nested JSON.
- Paginate lists and index common filters.
- Avoid N+1 queries.
- Use optimistic UI only for safe, reversible actions; reconcile with server response and roll back on failure. Do not optimistically confirm payments, irreversible status changes or security-sensitive actions.
- Use skeletons for known loading layouts; use clear inline progress for actions whose duration is unknown.
- Use bounded retries with exponential backoff and jitter for transient failures.
- Use a transactional outbox for reliable background notification enqueue where needed.
- Add request and API rate limits at edge and application layers.

## 10. Deployment environments

- `local`: developer environment.
- `test`: automated test database and fake providers.
- `staging`: production-like configuration with synthetic data.
- `production`: restricted access, backups, monitoring and incident procedures.

Use separate credentials and databases per environment. Run migrations as a controlled deployment step. Back up PostgreSQL and test restoration regularly. Keep frontend and API origins explicit and configure CORS narrowly.

## 11. Observability

Record:
- Request ID, route, status code and latency.
- Auth/authorization failures without leaking sensitive identifiers.
- Queue depth, retries and dead-letter count.
- SMS send/delivery results and provider latency.
- Database pool saturation and slow queries.
- Application exceptions with redaction.

Never log passwords, session tokens, OTPs, API keys, full payment credentials or unnecessary customer PII.
