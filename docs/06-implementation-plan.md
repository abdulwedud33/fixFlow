# 06 — Implementation Plan

## Guiding rule

Validate demand before building the full product. Ship a narrow, dependable repair workflow before adding inventory, automation or analytics.

## Phase 0 — Discovery and validation (1–2 weeks)

**Deliverables**
- 10–15 owner/technician interviews.
- Observe intake and repair handoff in at least 3 shops.
- Map current workflow and pain points.
- Competitor feature/price comparison.
- 3–5 pilot commitments.
- Pricing interviews and willingness-to-pay evidence.

**Exit criteria**
- At least 3 shops agree to use a pilot with real repairs.
- At least 2 owners indicate a credible willingness to pay after trial.
- The most frequent workflow pain is clear.
- If evidence is weak, revise positioning before implementation.

## Phase 1 — Foundation (week 1–2 after validation)

- Create repository and environment structure.
- Configure lint, formatting, type-checking and test runners.
- Build design tokens and app shell.
- Set up PostgreSQL, Prisma and migrations.
- Implement authentication and session lifecycle.
- Implement shop membership and tenant context.
- Enable RLS and test with runtime role.
- Add structured logging and safe error handling.

**Exit:** cross-tenant access tests pass before business modules are added.

## Phase 2 — Core repair workflow

- Customer CRUD and search.
- Device CRUD and customer relationship validation.
- Repair ticket creation and unique ticket numbers.
- Intake form and receipt.
- Status transition service and history.
- Technician assignment and work notes.
- Repair list, filters and detail view.

**Exit:** receptionist can intake a device and technician can complete a repair in staging.

## Phase 3 — Payments and dashboard

- Estimates and versioning.
- Payment recording, reversal and balance calculation.
- Receipt rendering.
- Dashboard operational queues.
- Role-specific permissions.
- Audit events for sensitive operations.

**Exit:** money invariants and role permissions have automated tests.

## Phase 4 — Pilot hardening

- Responsive QA at 360px, tablet and desktop.
- Empty/loading/error/offline states.
- Performance profiling and query indexes.
- Backup and restore rehearsal.
- Security review and dependency audit.
- Import/migration assistance if pilot shops use spreadsheets.
- Onboard 3–5 shops and observe usage.

**Exit:** no critical security defects; pilot operators complete real jobs without developer intervention for routine tasks.

## Phase 5 — Monetization and P1 features

Prioritize from observed usage:
1. SMS status updates (only if customers value them and unit economics work).
2. Inventory and parts usage.
3. Warranty management.
4. Offline draft synchronization.
5. Localization and additional device categories.

## Suggested repository structure

```text
fixflow/
  apps/
    web/
    api/
  packages/
    contracts/
    validation/
    ui/
    config/
  prisma/
    schema.prisma
    migrations/
  docs/
  tests/
    integration/
    e2e/
  AGENTS.md
  DESIGN.md
  tools.md
  memory.md
  evals.md
  guardrails.md
  prompts.md
  security.md
  README.md
```

A monorepo is optional. Keep the first deployment simple; do not introduce packages that have no reuse case.

## Definition of done for each feature

- Requirement and permission rules documented.
- UX states designed (loading, empty, error, disabled, success).
- Server validation and authorization implemented.
- RLS policy exists and is tested for tenant-owned data.
- Database constraints and transaction boundaries reviewed.
- Unit/integration tests added.
- E2E test added for critical user journey.
- No secrets or sensitive data in frontend bundle/logs.
- Keyboard and mobile behavior checked.
- Performance and failure behavior checked.
- Documentation updated.

## Release checklist

- [ ] Production secrets configured only in secret manager/environment.
- [ ] Database migrations reviewed and applied.
- [ ] RLS enabled and tested for every tenant table.
- [ ] Backups configured; restore tested.
- [ ] Rate limits enabled for all API routes.
- [ ] CORS and cookie settings restricted.
- [ ] TLS enforced.
- [ ] Monitoring and alerting active.
- [ ] Error responses are safe.
- [ ] Audit trail verified.
- [ ] Privacy/retention policy published.
- [ ] Pilot owner training completed.
- [ ] Rollback plan documented.
