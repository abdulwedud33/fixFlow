# evals.md — Product and Engineering Evaluation Plan

Use these scenarios before pilot launch and after material changes. A test is passed only with recorded evidence.

## 1. Product usability evaluations

| ID | Scenario | Pass condition |
|---|---|---|
| UX-01 | Receptionist creates a repair ticket | Practiced user completes in under 2 minutes without assistance |
| UX-02 | User finds a ticket by ticket number | Correct ticket appears quickly; no cross-tenant results |
| UX-03 | Technician updates assigned repair | Only authorized assigned work can be changed |
| UX-04 | User prints receipt | Essential information is legible on common paper sizes |
| UX-05 | User operates at 360px width | No page-level horizontal overflow or inaccessible action |
| UX-06 | Empty/loading/error states | Clear next action; skeleton geometry matches final layout |
| UX-07 | Slow network | Buttons remain stable; duplicate actions are prevented |
| UX-08 | Long customer/device names | Layout remains readable and actions remain reachable |

## 2. Security evaluations

| ID | Scenario | Pass condition |
|---|---|---|
| SEC-01 | User changes resource ID to another shop's ID | No data disclosure or mutation |
| SEC-02 | User supplies another `shop_id` in request body | Backend ignores/rejects unauthorized tenant context |
| SEC-03 | Query tenant table with no RLS context | No tenant rows returned; writes rejected |
| SEC-04 | Runtime DB role queries cross-tenant rows | RLS prevents access |
| SEC-05 | Technician requests owner-only financial report | 403/safe denial; no data leakage |
| SEC-06 | Malformed/oversized input | Validation rejects safely |
| SEC-07 | SQL injection strings in search/filter | Parameterized/allowlisted query; no injection |
| SEC-08 | Rate limit exceeded | 429 safe response and observable event |
| SEC-09 | Frontend bundle/source maps inspected | No secrets or privileged credentials |
| SEC-10 | Error induced in DB/provider | User sees safe message; internal details remain server-side |

## 3. Domain correctness

- Ticket numbers remain unique under concurrent creation.
- Invalid status transitions are rejected.
- Status history is append-only and actor-attributed.
- Payment amounts cannot be negative or zero unless explicitly supported by a separate adjustment model.
- Payment retries with same idempotency key do not double-record.
- Balance is computed server-side and reconciles with payment entries.
- Collected status obeys shop payment policy.
- Reversal creates a traceable record and does not erase original payment.
- A device must belong to the same tenant/customer relationship as the ticket.
- Technician assignment must reference an active member of the same shop.

## 4. Reliability and performance

- Common repair list/detail endpoints meet agreed p95 latency at pilot load.
- Pagination prevents unbounded response sizes.
- Retry does not duplicate tickets, payments or SMS.
- Queue retries are bounded and dead-letter failures are visible.
- Database backup restore is rehearsed.
- Frontend remains usable under simulated slow network.
- Offline draft sync handles duplicate submissions and conflicts safely.

## 5. AI and agent evaluations

If AI features are added later:
- Treat all user content and retrieved documents as untrusted data.
- Prevent prompt injection from customer notes, uploaded images and external messages.
- AI cannot authorize actions or bypass server permissions.
- AI-generated updates require schema validation and explicit user confirmation for consequential actions.
- Never send secrets or unnecessary PII to a model.
- Record model/version, prompt version and safe outcome metadata where appropriate.
- Evaluate hallucination, refusal, privacy leakage and action-boundary behavior.

## 6. Pilot success gate

Proceed beyond pilot only when:
- At least 3 shops have used FixFlow with real repair tickets.
- At least 2 shops agree to pay or provide a concrete purchase commitment.
- Core intake-to-collection workflow works without developer intervention.
- No unresolved critical/high security issue remains.
- Owners can export their business data.
- Support burden and hosting/SMS costs are understood.
