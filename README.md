# FixFlow — Project Documentation

**Product:** Repair Business Management Platform  
**Market:** Ethiopia first  
**Initial customer:** Independent mobile-phone repair shops; later laptop, electronics and appliance repair businesses  
**Status:** Product discovery / pre-MVP  
**Documentation version:** 1.0  
**Last updated:** 2026-11-18

FixFlow helps repair businesses receive devices, record customer and device details, manage repair work, communicate status, track parts, record payments and manage warranties.

This repository is the project’s working source of truth. Read the documents in the order below before implementation.

## Document map

| File | Purpose |
|---|---|
| `docs/01-product-requirements.md` | Product vision, users, requirements, scope and acceptance criteria |
| `docs/02-technical-requirements.md` | Architecture, stack, integrations, quality attributes and deployment |
| `docs/03-app-flow.md` | Roles, navigation, workflows and screen transitions |
| `docs/04-ui-ux-design-brief.md` | Visual direction, UX rules, accessibility and interaction behavior |
| `DESIGN.md` | Implementation-ready design system and design tokens |
| `docs/05-backend-schema.md` | PostgreSQL domain model, relationships, indexes and RLS policy strategy |
| `docs/06-implementation-plan.md` | Milestones, sequence, dependencies and definition of done |
| `AGENTS.md` | Instructions for AI coding agents and human contributors |
| `tools.md` | Approved tools, commands, environments and integration boundaries |
| `memory.md` | Durable project decisions and change log |
| `evals.md` | Product, UX, security, reliability and release evaluation scenarios |
| `guardrails.md` | Non-negotiable product, engineering and AI-agent constraints |
| `prompts.md` | Reusable prompts for planning, implementation, review and QA |
| `security.md` | Threat model, authentication, authorization, RLS, validation and incident handling |
| `docs/07-design-references.md` | Design references and how to apply them without copying another brand |

## Current product decisions

1. Build a responsive web application / installable PWA first; do not build a native Android app for the first release.
2. Design the domain for phone, laptop, electronics and appliance repairs, but validate and launch with mobile-phone repair shops first.
3. Use a multi-tenant architecture from the beginning. Every business-owned record must be scoped to a tenant.
4. Use PostgreSQL as the source of truth. Prisma is the ORM; database constraints and PostgreSQL Row-Level Security (RLS) enforce isolation.
5. Use a separate backend API for business logic, authorization, integrations and sensitive operations.
6. SMS is sent through a provider adapter. Select a provider only after confirming Ethiopian coverage, sender-ID rules, pricing, delivery receipts and API terms.
7. Payment records are in scope; payment gateway collection/settlement is not an MVP requirement.
8. Offline support is a progressive enhancement. The first safe offline workflow is draft creation and queued, idempotent synchronization—not unrestricted offline writes.
9. Never expose secrets, privileged credentials, provider keys, internal error details or authorization logic in frontend code.
10. Product discovery and willingness-to-pay validation must precede a broad feature build.

## Important assumptions to validate

- Shop owners will pay for repair workflow software.
- Repair ticketing and customer communication are the strongest initial pain points.
- Owners and technicians can use a simple mobile-friendly interface.
- SMS is preferred or useful enough to justify its cost; confirm this with customers.
- Initial pricing, onboarding fees and local payment collection method remain commercial hypotheses.

## Suggested reading order

Start with `docs/01-product-requirements.md`, then `docs/03-app-flow.md`, `DESIGN.md`, `docs/02-technical-requirements.md`, `docs/05-backend-schema.md`, and `security.md`. Use `AGENTS.md` and `guardrails.md` as mandatory instructions whenever coding agents work in this repository.
