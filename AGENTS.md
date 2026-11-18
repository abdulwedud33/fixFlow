# AGENTS.md — Instructions for Coding Agents

You are contributing to **FixFlow**, a multi-tenant repair-business management product for Ethiopia-first independent repair shops.

## Before changing code

1. Read `README.md`.
2. Read the relevant PRD/TRD/app-flow section.
3. Read `DESIGN.md` before any frontend work.
4. Read `security.md` and `guardrails.md` before auth, data, API, database or integration work.
5. Read `memory.md` for established decisions.
6. Inspect the existing codebase and package versions. Do not assume the repository is empty or replace working architecture without a reason.

## Non-negotiable rules

- Never put secrets, API keys, database credentials, signing keys, provider tokens or privileged keywords in frontend code, public environment variables, source maps or client bundles.
- All authorization is enforced by backend and database. Frontend visibility is not security.
- Every tenant-owned table must have RLS enabled and tested.
- Derive tenant identity from authenticated membership; never trust a client-supplied `shop_id` by itself.
- Validate all user, API, AI, webhook and external-provider inputs on the server.
- Do not expose raw backend, database, stack trace or provider errors to users.
- Add rate limiting to every API route, with stricter limits for auth, search, public tracking and message-sending endpoints.
- Keep payment and audit records append-only; use reversals rather than destructive edits.
- Do not use floating point for money.
- Do not introduce microservices without a demonstrated need.
- Do not add dependencies without checking maintenance, security, bundle cost and license.
- Never invent production data or fake analytics.

## Frontend standards

- Use `DESIGN.md` as the single visual source of truth.
- Use semantic design tokens; avoid one-off hex values and arbitrary spacing.
- Follow accessible semantic HTML and keyboard behavior.
- Design loading, empty, error, success, disabled and offline states.
- For known content, use skeletons matching the final layout. Avoid spinning loaders.
- Keep button dimensions and positions stable during onboarding and submission.
- Provide immediate interaction feedback.
- Use optimistic updates only for safe reversible operations; reconcile and roll back on failure.
- Do not optimistically confirm payments, authorization changes or irreversible workflow transitions.
- Use responsive layouts; verify at 360px mobile width.
- Apply Jakob’s, Hick’s, Proximity, Miller’s and Von Restorff principles where appropriate.

## Backend standards

- Parse all untrusted input with shared schemas (e.g. Zod).
- Validate route params, query params, body, headers and webhook signatures.
- Authenticate before accessing tenant data.
- Verify membership and role on every protected operation.
- Use explicit allowlists for update fields and sort/filter keys.
- Use parameterized queries; never concatenate SQL from user input.
- Scope queries by tenant and use RLS as defense in depth.
- Use transaction-local tenant context on the same connection as tenant queries.
- Use idempotency keys for retryable write operations.
- Keep business logic in services/domain modules, not route handlers.
- Use safe, stable error codes and structured logs with redaction.

## Database standards

- Add migrations for schema changes.
- Add RLS policies in SQL migrations.
- Add indexes based on measured query patterns.
- Use FK, unique and check constraints for invariants.
- Test cross-tenant SELECT/INSERT/UPDATE/DELETE.
- Test missing tenant context and runtime role permissions.
- Do not run production migrations manually without review and backup.

## Performance

- Paginate unbounded collections.
- Select only needed columns.
- Avoid N+1 queries and oversized nested JSON.
- Compress API responses.
- Lazy-load non-critical UI.
- Avoid unnecessary re-renders and duplicate requests.
- Do not create a single external provider dependency without an adapter/fallback strategy.

## Testing required

For every feature, add the appropriate unit, integration and E2E coverage. Critical tests include:
- Cross-tenant isolation.
- Role and resource authorization.
- Repair status transition rules.
- Ticket number collision handling.
- Payment amount/balance invariants.
- Idempotent retries.
- Rate limiting.
- Validation and safe error responses.

## Agent workflow

1. State the intended change and affected files.
2. Inspect existing patterns.
3. Make the smallest coherent change.
4. Run typecheck, lint and relevant tests.
5. Review the diff for secrets, tenant leaks and unrelated edits.
6. Update docs and `memory.md` when decisions change.
7. Report what changed, tests run, known gaps and any required human action.

Do not claim tests passed unless they were actually run. Do not silently weaken security controls to make a test pass.
