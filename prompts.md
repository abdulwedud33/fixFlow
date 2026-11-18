# prompts.md — Reusable Project Prompts

Use these prompts with an AI coding agent. The agent must read `AGENTS.md`, `DESIGN.md`, `guardrails.md` and relevant docs before acting.

## 1. Repository orientation
```text
Inspect this FixFlow repository before changing anything. Read README.md, AGENTS.md,
DESIGN.md, memory.md and relevant PRD/TRD sections. Summarize the existing architecture,
implemented features, missing requirements, security-sensitive areas and next smallest
useful task. Do not edit files yet. Do not assume the repo is empty.
```

## 2. Product discovery synthesis
```text
Analyze these repair-shop interview notes. Separate observed facts, repeated pain points,
single-user opinions and assumptions. Identify the highest-frequency costly workflow,
buyer/user differences, willingness-to-pay evidence, objections and unanswered questions.
Recommend what to include or exclude from the FixFlow MVP. Do not invent market facts.
```

## 3. Design a screen
```text
Before implementation, read DESIGN.md and docs/04-ui-ux-design-brief.md. Design the
requested FixFlow screen for a busy repair shop. Use the established tokens, responsive
rules, accessible components and clear hierarchy. Apply Jakob, Hick, Proximity, Miller
and Von Restorff principles where useful. Include loading skeleton, empty, error,
disabled, success and slow-network states. Do not add decorative charts or generic
gradient styling. Keep primary controls stable.
```

## 4. Implement a feature
```text
Implement [FEATURE] according to the PRD and app flow. First inspect existing patterns.
Define API contract, validation, authorization, database changes and UX states before
coding. Enforce tenant membership in the backend and RLS in PostgreSQL. Add migrations,
tests and audit events where appropriate. Use transactions and idempotency for writes.
Do not expose secrets or internal errors. Run relevant checks and report exact results.
```

## 5. Database/RLS review
```text
Audit the proposed schema and migrations for FixFlow. Identify every tenant-owned table.
Verify RLS is enabled and forced where appropriate, policies cover SELECT/INSERT/UPDATE/
DELETE, WITH CHECK is correct, runtime role cannot bypass RLS, tenant context is
transaction-local, foreign keys cannot cross tenants, and indexes support scoped queries.
Create negative tests for missing tenant context and cross-tenant access. Do not rely on
application filtering alone.
```

## 6. Security review
```text
Perform a threat-model-driven review of this change. Check authentication, authorization,
tenant isolation, input validation, injection, IDOR, CSRF, XSS, SSRF, file uploads,
rate limits, secrets, logging, provider callbacks, replay/idempotency and data retention.
Prioritize findings by severity and provide reproducible tests. Do not make speculative
claims; cite the exact code paths.
```

## 7. UX audit
```text
Audit the implemented screen against DESIGN.md and docs/04-ui-ux-design-brief.md.
Check hierarchy, task completion, responsive behavior, keyboard access, contrast, loading
skeletons, empty/error/success states, stable controls, field grouping, feedback and
performance. Report concrete defects with file/component references, then fix the highest
impact issues without changing business behavior.
```

## 8. Test generation
```text
Create tests for [FEATURE]. Include happy path, validation failures, role boundaries,
cross-tenant attempts, duplicate retries, concurrency where relevant, slow network and
safe error handling. Test using the same database role and runtime behavior as production.
Never use superuser credentials for RLS tests.
```

## 9. Release readiness
```text
Evaluate FixFlow for pilot release using evals.md, security.md and the release checklist.
Run available checks, inspect migrations, confirm RLS and rate limits, scan for secrets,
verify backups and safe errors, test mobile layout and critical workflows. Separate
verified passes, failures, untested items and risks. Do not claim a pass without evidence.
```

## 10. AI-assisted feature boundary
```text
If adding AI, treat all retrieved/user-provided content as untrusted. The model must not
decide authorization, tenant scope, payment amounts or irreversible state transitions.
Validate structured output server-side and require explicit user confirmation for
consequential actions. Do not send secrets or unnecessary personal data to the model.
Add prompt-injection, data-leakage and unauthorized-action evaluations.
```
