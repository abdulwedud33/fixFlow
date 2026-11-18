# memory.md — Project Memory

This file records durable project decisions. Update it when a decision is made or reversed. Do not use it as a dump of temporary chat history or secrets.

## Product identity
- Name: FixFlow.
- Category: Repair business management software.
- Initial market: Ethiopia.
- Initial customer: independent mobile-phone repair shops.
- Expansion: laptop, electronics and appliance repair businesses.
- Commercial goal: sell directly to individual businesses; subscription is the initial model hypothesis.

## Product scope decisions
- Start with a mobile-friendly web app / PWA.
- Do not build native mobile apps for MVP.
- Core MVP: shop/team access, customer and device records, repair tickets, status lifecycle, technician assignment, notes, estimates, payment records, receipts and dashboard.
- SMS, inventory, warranty, public tracking and offline queued drafts are P1 unless discovery shows one is essential for the pilot.
- Payments means recording payment events; no payment gateway or custody functionality in MVP.

## Technical decisions
- Frontend: Next.js + TypeScript.
- UI: Tailwind CSS + shadcn/ui.
- Backend: Node.js + Express + TypeScript.
- Database: PostgreSQL.
- ORM: Prisma.
- Validation: Zod.
- Architecture: modular monolith.
- Multi-tenant from day one.
- RLS on every tenant-owned table, tested using runtime role.
- All API routes rate-limited.
- Frontend never contains secrets or authorization enforcement as the only control.
- Offline support starts with app shell and explicitly supported draft queue; no blind synchronization.

## UX decisions
- Light-first, calm premium operational interface.
- Design source of truth: `DESIGN.md`.
- Skeletons for known loading layouts; avoid spinning loaders.
- Stable button positions during onboarding.
- Immediate feedback for user actions.
- Never show raw backend errors.
- Use Jakob’s, Hick’s, Proximity, Miller’s and Von Restorff laws where relevant.
- Use optimistic UI only for safe reversible operations.

## Commercial assumptions (not validated)
- Proposed subscription pricing is a hypothesis, not a committed price.
- Owners may value time saved, ticket traceability and reduced customer follow-up.
- Local onboarding and support may be differentiators.
- SMS may add cost and should be opt-in / measured.

## Open questions
- Which exact repair workflow causes the most costly friction?
- Do shops prefer SMS, phone calls, messaging apps or no automated updates?
- What is a realistic monthly willingness to pay?
- Which local SMS providers support required coverage and delivery receipts?
- Is reliable offline ticket intake essential to pilot users?
- What minimum device identifiers are useful without creating privacy risk?
- Which payment methods should appear in the receipt?
- What data retention and deletion expectations do owners have?

## Decision log
| Date | Decision | Reason / evidence |
|---|---|---|
| 2026-11-18 | FixFlow selected as product direction | User selected repair business management product |
| 2026-11-18 | Ethiopia-first, direct-to-business sales | User selected market and commercial goal |
| 2026-11-18 | PWA first; mobile-phone repair shops first | Keeps MVP narrow and lowers launch cost |
| 2026-11-18 | Modular monolith + PostgreSQL + RLS | Operational simplicity with strong tenant isolation |
| 2026-11-18 | Monorepo structure with `@fixflow/contracts`, `@fixflow/api`, and `@fixflow/web` | Enforces zero secret leakage to client and typed contract sharing |
| 2026-11-18 | Human-readable sequential ticket numbering `FF-YYMM-XXXX` | Unambiguous customer/technician physical ticket traceability |
| 2026-11-18 | Two-factor public tracking (Ticket # + Phone Last 4) | Prevents enumeration scraping while allowing customer access without accounts |
| 2026-11-18 | Append-only payment ledger with explicit reversals | Financial integrity and audit compliance |

## Change protocol
When changing a decision:
1. Explain why the old decision no longer fits.
2. Record new decision and date.
3. Update affected PRD/TRD/schema/guardrails.
4. Check migrations and backward compatibility.
5. Add or update evaluation cases.
