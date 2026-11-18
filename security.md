# security.md — Security Requirements and Threat Model

## 1. Security objectives

- Confidentiality: a shop cannot access another shop's customer, repair, payment or staff data.
- Integrity: ticket status, estimates, payments and stock movements cannot be changed through unauthorized or replayed requests.
- Availability: abuse and noisy clients are limited through rate controls and resilient dependencies.
- Accountability: sensitive operations are attributable to a user and timestamp.
- Privacy: collect only necessary personal data and protect it throughout its lifecycle.

## 2. Threat model

| Threat | Example | Required controls |
|---|---|---|
| IDOR / broken object authorization | User changes repair ID in URL | Resource-level authorization + RLS |
| Tenant escape | Client submits another shop ID | Server-derived tenant + RLS |
| Privilege escalation | Technician calls owner endpoint | Server-side role/permission checks |
| Injection | Malicious search/filter input | Zod validation, parameterized SQL, allowlists |
| XSS | Customer note contains script | Output encoding, safe rendering, CSP |
| CSRF | Cross-site request using session cookie | SameSite cookies, CSRF token/origin checks |
| Brute force | Login/public tracking enumeration | Rate limits, lockout/risk controls |
| Replay/double charge record | Retried payment request | Idempotency keys, unique constraints |
| Secret leakage | API key bundled into frontend | Server-only secrets, CI secret scan |
| File abuse | Oversized or malicious upload | Type/signature/size checks, private storage, scanning |
| Provider compromise/outage | SMS vendor unavailable | Adapter, bounded retry, circuit breaker/queue |
| Data loss | Accidental deletion or outage | Backups, point-in-time recovery, restore drills |
| Log leakage | PII/token in exception log | Redaction and structured logging |

## 3. Authentication

- Use a mature authentication library or identity provider.
- If passwords are stored locally, hash with Argon2id or a current OWASP-recommended configuration through a maintained library.
- Use secure, HttpOnly, SameSite cookies for browser sessions.
- Enforce TLS.
- Rotate session identifiers after login/privilege changes.
- Provide logout/session revocation.
- Verify email/phone before using it for account recovery or sensitive notifications.
- Protect login and recovery endpoints with strict rate limits.
- Never store plaintext passwords, OTPs or session tokens.

## 4. Authorization

- Deny by default.
- Check authentication, active membership, role/permission and resource ownership for every protected request.
- Never rely on frontend route guards or hidden buttons.
- Use explicit permission functions and tests.
- Technician access is limited to assigned work and necessary customer/device details.
- Financial reports and payment corrections require explicit permissions.
- Public tracking must reveal minimal status data only and use a high-entropy revocable token.

## 5. PostgreSQL RLS

- Enable and force RLS on every tenant-owned table.
- Runtime application role must not own tenant tables and must not have `BYPASSRLS`.
- Use `USING` and `WITH CHECK`.
- Tenant context is set transaction-locally after membership verification and on the same connection/transaction as tenant queries.
- Never use a global session setting on pooled connections.
- Include tenant ID in unique constraints and foreign key relationships where needed.
- Test all CRUD operations across two tenants and missing tenant context.
- RLS is defense in depth; API authorization remains mandatory.

## 6. Input validation

Validate:
- Route parameters, query strings, request bodies and headers.
- File uploads and metadata.
- Webhook signatures and payloads.
- AI-generated structured output.
- SMS template variables and destination numbers.
- State transitions and payment values.

Use schemas, size limits, normalization and allowlists. Reject unexpected fields for sensitive operations. Do not construct SQL or shell commands from user input.

## 7. API security and rate limiting

All API routes require rate limiting. Apply stricter policies to:
- Authentication and recovery.
- Public ticket tracking.
- Search and enumeration-prone endpoints.
- File uploads and exports.
- SMS sending and notification retries.
- Expensive reports.

Use distributed rate-limit storage for multi-instance deployments. Add payload size limits, timeouts, CORS allowlists, secure headers and request IDs.

## 8. Secrets management

- Secrets exist only in server environment/secret manager.
- Never prefix secrets with `NEXT_PUBLIC_`.
- Never commit `.env` values.
- Provide `.env.example` with placeholders only.
- Scan commits, CI artifacts, source maps and logs.
- Rotate a secret immediately if exposed.
- Use separate credentials per environment and least privilege.

## 9. Payments and audit integrity

- Treat payment entries as immutable.
- Use reversal/refund/adjustment records with reason and actor.
- Validate amounts and calculate balances on server.
- Use idempotency keys and database uniqueness.
- Never trust client-submitted total or balance.
- Audit estimate changes, discounts, payment creation/reversal, collection override, role changes, exports and sensitive settings.
- Restrict audit log access and prevent normal app roles from modifying/deleting audit rows.

## 10. File and notification security

- Store uploaded images in private buckets.
- Verify file signature, MIME type, dimensions and size.
- Generate short-lived signed URLs only after authorization.
- Strip metadata if not needed.
- SMS messages contain minimal information; avoid exposing sensitive device details.
- Require consent/preference checks and provide opt-out where applicable.
- Use template allowlists and escape user-supplied values.
- Verify provider callbacks cryptographically and make webhook handling idempotent.

## 11. Privacy and retention

- Collect only data needed to provide the service.
- Explain why phone number and device identifiers are collected.
- Avoid storing identity documents or unrelated personal details.
- Define retention periods for inactive accounts, tickets, logs and uploaded images.
- Provide tenant export and controlled deletion workflows.
- Preserve legally/operationally required financial/audit records according to applicable Ethiopian law; obtain qualified legal advice before finalizing retention rules.
- Restrict production data access to authorized operators and log access.

## 12. Incident response

1. Detect and classify incident.
2. Contain compromised credentials or affected endpoints.
3. Preserve relevant logs and evidence.
4. Assess tenant/data exposure.
5. Notify affected parties and authorities when required by applicable law.
6. Restore service and rotate credentials.
7. Document root cause and corrective actions.
8. Add regression tests and update this threat model.

## 13. Minimum security release gate

- [ ] RLS policies for all tenant-owned tables.
- [ ] Runtime role cannot bypass RLS.
- [ ] Cross-tenant tests pass.
- [ ] Every API route rate-limited.
- [ ] Authorization tests cover every role.
- [ ] Secrets scan clean.
- [ ] Safe errors and redacted logs verified.
- [ ] Input validation covers all trust boundaries.
- [ ] Payment idempotency and reversal tests pass.
- [ ] Backup restore tested.
- [ ] Dependency and vulnerability review completed.
