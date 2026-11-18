# 01 — Product Requirements Document (PRD)

## 1. Product summary

**FixFlow** is a repair-business management platform for independent repair shops. It replaces fragmented notebooks, chat threads and memory-based workflows with a reliable record of each customer, device, repair, part, payment and warranty.

**Product promise:** Every device has a traceable repair record, every repair has a clear status, and every shop can see what needs attention next.

## 2. Problem statement

Repair shops often coordinate intake, diagnosis, technician work, parts, customer updates, collection and warranty through paper notes, calls and messaging apps. This can lead to:
- Missing or incomplete customer/device details.
- Confusion between devices or repair jobs.
- Repeated calls asking whether a device is ready.
- Unclear repair ownership and status.
- Forgotten estimates, balances or collections.
- No dependable history for repeat customers or warranty claims.
- Limited visibility into shop workload and performance.

These are hypotheses, not universal facts. Validate their frequency and financial impact through interviews and observation before committing to features.

## 3. Vision and positioning

**Vision:** Become the practical operating workspace for independent repair businesses in Ethiopia.

**Positioning:** Easier to adopt than complex repair ERP/POS systems, localized for Ethiopian businesses, and focused on the daily repair workflow.

**Differentiation hypotheses**
- Ethiopian birr (ETB) formatting and local business workflows.
- Amharic and Afaan Oromo localization as validated demand emerges.
- Responsive, low-bandwidth interface and safe offline-assisted workflows.
- Local onboarding, support and transparent pricing.
- Simple ticket-to-collection workflow rather than a feature-heavy ERP.

Do not claim a competitor gap until competitor and customer research verifies it.

## 4. Target users and personas

### Primary buyer: Shop owner / manager
- Owns or manages one repair shop.
- Wants visibility into open repairs, cash collected, outstanding balances and staff workload.
- Needs simple setup, clear pricing and confidence that business data is private.

### Daily operator: Receptionist / front-desk staff
- Registers customers and devices.
- Creates repair tickets, records condition/accessories and gives customers receipts.
- Needs fast forms, search and low-error data entry.

### Technician
- Sees assigned work, diagnosis, notes, parts required and status.
- Should not see unrelated financial or administrative data unless explicitly granted.

### Customer
- Receives a ticket/receipt and optional status messages.
- May check status using a secure, limited tracking link or ticket code in a later release.
- Does not need an account for MVP.

## 5. Goals and non-goals

### MVP goals
1. Create a customer and device repair ticket in under two minutes for a practiced operator.
2. Find any active repair quickly by ticket number, customer phone or device identifier.
3. Show a trustworthy, auditable repair status and assignment.
4. Record estimates, payments and balances accurately.
5. Give owners a clear view of active jobs and work requiring attention.
6. Protect tenant data at API and database layers.
7. Support a pilot with 3–5 shops and collect actionable usage feedback.

### MVP non-goals
- Full accounting, payroll, tax filing or general-purpose ERP.
- Full POS and retail checkout.
- Automated diagnosis using AI.
- Public marketplace or customer booking marketplace.
- Payment gateway custody, wallet, escrow or settlement.
- Native Android/iOS apps.
- Multi-country tax and currency support.
- Unrestricted offline synchronization across all features.
- Complex franchise/enterprise hierarchy in the first release.

## 6. Product scope

### P0 — MVP (must ship)
- Tenant/shop registration and onboarding.
- Authentication and role-based access.
- Shop profile, timezone, currency and receipt settings.
- Customer records and search.
- Device records associated with customers.
- Repair ticket creation with unique human-readable ticket number.
- Intake checklist: reported issue, visible condition, accessories, received date and estimated completion.
- Ticket status lifecycle and status history.
- Technician assignment.
- Diagnosis and work notes.
- Estimate, discount (permission controlled), payment entries and balance calculation.
- Printable/downloadable repair receipt.
- Dashboard: open jobs, awaiting parts, ready for collection, overdue and today's collections.
- Audit log for sensitive changes.
- Basic export of tenant-owned records.
- Basic responsive PWA shell.

### P1 — Early post-MVP
- SMS status notifications with consent, delivery tracking and cost controls.
- Parts inventory, stock movements and parts consumed per repair.
- Warranty records and claim workflow.
- Customer-facing status lookup with unguessable, revocable token.
- Amharic and Afaan Oromo localization.
- Offline draft ticket creation and queued synchronization.
- Technician workload and operational reports.

### P2 — Later
- Multiple branches under one organization.
- Advanced analytics and profit estimates.
- Supplier and purchase-order management.
- Appliance-specific fields and configurable device categories.
- Customer portal and appointment booking.
- Integrations with local payment providers if commercially and technically justified.

## 7. Core workflows

### 7.1 Receive a device
1. Search for an existing customer by phone/name.
2. Select existing customer or create one.
3. Select or create a device.
4. Record reported issue, physical condition and accessories received.
5. Capture optional photos only with consent and retention policy.
6. Set initial estimate and expected completion date if known.
7. Save ticket and generate unique ticket number.
8. Print/share receipt.

### 7.2 Diagnose and repair
1. Technician opens assigned ticket.
2. Records diagnosis and recommended work.
3. Authorized staff updates estimate and obtains customer approval where required.
4. Technician updates status and work notes.
5. Parts usage is recorded when inventory module is enabled.
6. Mark repair completed with final amount and warranty terms.

### 7.3 Collect device
1. Search ticket.
2. Confirm customer/device identity.
3. Record payment method, amount and reference where applicable.
4. Calculate remaining balance server-side.
5. Mark collected only when collection conditions are met or an authorized override is recorded.
6. Issue final receipt and start warranty period if applicable.

### 7.4 Status notification
1. A meaningful status transition occurs.
2. System checks notification preference, consent, template and rate/cost limits.
3. Queue message through provider adapter.
4. Record provider result and delivery status.
5. Retry transient failures with bounded backoff; never duplicate a notification on a retry.

## 8. Status lifecycle

Default statuses:
- `RECEIVED`
- `DIAGNOSING`
- `WAITING_FOR_APPROVAL`
- `WAITING_FOR_PARTS`
- `IN_PROGRESS`
- `COMPLETED`
- `READY_FOR_PICKUP`
- `COLLECTED`
- `CANCELLED`

Rules:
- Status changes must be validated by backend transition rules.
- Every transition records actor, timestamp, previous status, new status and optional reason.
- `COLLECTED` requires payment/balance policy to pass or an owner-authorized override with reason.
- `CANCELLED` requires a reason.
- Reopening a closed ticket requires explicit permission and audit history.

## 9. Functional requirements

| ID | Requirement | Priority |
|---|---|---|
| FR-001 | Users can authenticate securely and belong to one or more authorized shops | P0 |
| FR-002 | Owner can invite, deactivate and assign roles to staff | P0 |
| FR-003 | User can create and search customers within authorized tenant | P0 |
| FR-004 | User can record devices and device identifiers | P0 |
| FR-005 | User can create a repair ticket with a unique ticket number | P0 |
| FR-006 | User can view ticket timeline and status history | P0 |
| FR-007 | Authorized user can assign a technician | P0 |
| FR-008 | Technician can add diagnosis and work notes | P0 |
| FR-009 | Authorized user can create estimate and record payments | P0 |
| FR-010 | System calculates total, paid and balance on the server | P0 |
| FR-011 | User can print/share a repair receipt | P0 |
| FR-012 | Dashboard shows operational counts and actionable queues | P0 |
| FR-013 | System records sensitive actions in an audit log | P0 |
| FR-014 | System sends configurable SMS notifications | P1 |
| FR-015 | User can manage parts inventory and stock movements | P1 |
| FR-016 | System tracks warranty periods and claims | P1 |
| FR-017 | Customer can check status using a secure public token | P1 |
| FR-018 | System supports queued offline draft synchronization | P1 |

## 10. Roles and permissions

| Capability | Owner | Manager | Receptionist | Technician |
|---|---:|---:|---:|---:|
| View operational dashboard | Yes | Yes | Limited | Assigned work |
| Manage shop settings | Yes | Limited | No | No |
| Invite/deactivate users | Yes | Configurable | No | No |
| Manage customers/devices | Yes | Yes | Yes | Limited |
| Create repair ticket | Yes | Yes | Yes | Optional |
| Assign technicians | Yes | Yes | No | No |
| Update diagnosis/work notes | Yes | Yes | No | Assigned tickets |
| Change estimates/discounts | Yes | Configurable | No by default | No |
| Record payments | Yes | Yes | Yes | No by default |
| View financial reports | Yes | Yes | Limited | No |
| Manage inventory | Yes | Yes | Configurable | Parts issue only |
| Export business data | Yes | Configurable | No | No |
| View audit log | Yes | Configurable | No | No |

Permissions must be enforced by the backend and database, not by hiding frontend controls alone.

## 11. Non-functional requirements

- **Security:** tenant isolation, RLS, server-side authorization, input validation, secure sessions and auditability.
- **Performance:** common list/detail requests should target p95 under 500 ms at pilot scale, excluding network/provider latency. Measure rather than promise.
- **Availability:** target 99.5% monthly availability after production launch, subject to hosting and provider dependencies.
- **Usability:** responsive layout, keyboard support, readable contrast and clear empty/error/success states.
- **Localization:** ETB support and locale-ready text/date formatting.
- **Reliability:** idempotent writes for retryable actions; database constraints for invariants.
- **Maintainability:** typed contracts, automated tests, migrations and documented operational procedures.
- **Privacy:** collect only necessary customer data; define retention, export and deletion policies.

## 12. Success metrics

### Discovery metrics
- 15+ shop interviews completed.
- 5+ owners agree to a real pilot.
- At least 3 shops use the workflow for actual repairs.
- At least 2 pilot shops agree to pay after the trial.

### Product metrics
- Time to create a ticket.
- Percentage of tickets with complete intake details.
- Weekly active shops and operators.
- Tickets created and closed per shop.
- Search success/time-to-find-ticket.
- Status update frequency.
- Payment record correction rate.
- SMS delivery rate and cost per delivered message.
- Pilot-to-paid conversion and 30/60-day retention.

Avoid vanity metrics such as total signups without active shop usage.

## 13. Acceptance criteria for MVP

- A shop owner can create a shop and invite staff.
- A receptionist can create a customer, device and ticket.
- The system generates a unique ticket number without collisions.
- A user cannot read or modify another tenant's data by changing IDs or API parameters.
- A technician sees only assigned/authorized tickets.
- Status changes follow valid transitions and appear in history.
- Payment totals and balances are computed server-side using integer minor units or a fixed-precision decimal strategy.
- Receipt can be printed on desktop and mobile.
- API errors shown to users are safe, actionable messages—not stack traces or database errors.
- Automated tests cover tenant isolation, role permissions, ticket lifecycle and payment invariants.
