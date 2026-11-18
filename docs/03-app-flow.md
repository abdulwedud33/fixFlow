# 03 — Application Flow

## 1. Roles

- **Owner:** controls shop, team, billing and all business data.
- **Manager:** operational administration according to granted permissions.
- **Receptionist:** customer intake, tickets, status lookup and payment recording.
- **Technician:** assigned repairs, diagnosis and work notes.
- **Customer (future limited access):** checks a repair using a secure tracking token.

## 2. Navigation map

```text
Sign in / Create shop
  └── App shell
      ├── Overview
      ├── Repairs
      │   ├── All repairs
      │   ├── New repair
      │   └── Repair detail
      ├── Customers
      │   └── Customer detail
      ├── Devices
      ├── Team
      ├── Inventory (P1)
      ├── Warranties (P1)
      ├── Reports
      └── Settings
          ├── Shop profile
          ├── Team & roles
          ├── Receipt settings
          ├── Notifications
          └── Security
```

Navigation items are permission-aware, but hiding an item is not authorization. API and database checks remain mandatory.

## 3. First-time onboarding

1. Welcome page explains the value in one sentence.
2. Owner creates account or signs in.
3. Owner creates shop: name, phone, city, currency (ETB default), timezone.
4. Owner selects repair categories (phone selected as suggested default).
5. Owner optionally invites staff.
6. Owner sees a short guided checklist: create first customer, create first repair, print first receipt.
7. User lands on dashboard with one clear primary action: **New repair**.

Onboarding requirements:
- Keep primary and secondary buttons in fixed positions.
- Do not shift controls as steps change.
- Save progress after each completed step.
- Allow skipping optional steps and finishing later.
- Explain why phone number or other personal data is requested.
- Use sensible defaults but make them editable.

## 4. New repair flow

```text
Repairs → New repair
  → Find customer by phone/name
      → Existing customer selected
      OR Create customer
  → Select existing device
      OR Add device (type, brand, model, identifier)
  → Intake details
      → Reported issue
      → Physical condition
      → Accessories received
      → Optional photos (consent required)
  → Estimate and expected date (optional)
  → Review summary
  → Save
      → Server validates permissions and data
      → Ticket number generated
      → Timeline event created
      → Receipt preview
          → Print / Download / Share
```

Form behavior:
- Group related fields.
- Keep labels visible; placeholders are examples, not labels.
- Preserve valid input after recoverable failures.
- Show field-level validation.
- Prevent duplicate submission using a pending state and idempotency key.
- Do not show raw backend messages.

## 5. Repair detail flow

Header:
- Ticket number.
- Device/customer summary.
- Status badge.
- Primary action appropriate to role and current status.

Tabs/sections:
- Overview.
- Timeline.
- Diagnosis & work notes.
- Estimate & payments.
- Parts (P1).
- Warranty (P1).

Primary actions depend on state:
- Received → Start diagnosis.
- Diagnosing → Request approval / Wait for parts / Start work.
- Waiting for approval → Record approval / Cancel.
- Waiting for parts → Resume work.
- In progress → Mark completed.
- Completed → Mark ready for pickup.
- Ready for pickup → Record payment / Mark collected.
- Collected → View receipt / Start warranty claim where eligible.

Do not show invalid transitions. The backend still validates every requested transition.

## 6. Dashboard flow

Default dashboard priorities:
1. New repair action.
2. Repairs requiring attention: overdue, waiting for approval, waiting for parts.
3. Ready for pickup.
4. Today's completed/collected jobs.
5. Compact performance summary.

Dashboard should answer:
- What needs my attention?
- Which customers are waiting?
- What work is assigned to each technician?
- What money was recorded today?

Do not fill the first dashboard with decorative charts. Use actionable queues and clear counts.

## 7. Payment flow

1. Open repair → Payments.
2. Select payment method (cash, bank transfer, mobile money, other).
3. Enter amount and optional transaction reference.
4. Backend validates amount, currency, role, ticket state and idempotency key.
5. Backend creates immutable payment entry and recalculates paid/balance.
6. UI confirms saved payment and displays updated balance.
7. Receipt can be printed/shared.

Corrections must use reversal/refund/adjustment records with reason and permissions. Do not silently edit or delete settled payment records.

## 8. SMS notification flow (P1)

1. User changes a ticket to a notification-eligible status.
2. System checks customer consent and notification preferences.
3. Template is rendered with escaped variables.
4. Rate/cost limits and duplicate-event checks run.
5. Job is queued and sent via provider adapter.
6. Result is recorded: queued, sent, delivered, failed or unknown.
7. User sees a safe notification status; provider secrets/errors remain private.

## 9. Empty, loading and error states

- Empty list: explain what belongs here and provide one relevant action.
- Initial page loading: skeletons that match final layout.
- Search loading: keep the search field stable and show a compact result skeleton.
- Mutation pending: keep button geometry stable; disable duplicate submission and show clear text feedback.
- Failure: preserve form data, explain next step and provide retry where safe.
- Permission denied: explain that the user lacks access; do not disclose whether another tenant's record exists.
- Offline: show a clear banner and identify which actions are available offline.

## 10. Mobile navigation

- Use compact bottom navigation or a drawer appropriate to the number of primary destinations.
- Keep **New repair** easy to reach.
- Tables become readable cards or horizontally scroll only when necessary.
- Important actions have touch targets of at least 44×44 CSS pixels.
- Do not rely on hover for essential actions.
