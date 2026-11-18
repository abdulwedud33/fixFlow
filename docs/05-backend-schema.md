# 05 — Backend Schema and Data Model

## 1. Modeling conventions

- Database: PostgreSQL.
- Primary keys: UUID.
- Timestamps: `created_at`, `updated_at` stored as `timestamptz`.
- Tenant key: `shop_id` on every tenant-owned row.
- Money: integer minor units or `NUMERIC(14,2)`; choose one strategy consistently. Do not use JavaScript floating point for arithmetic.
- Soft deletion: use only where business recovery/audit requires it; do not soft-delete financial ledger entries as a substitute for reversal.
- All tenant-owned tables require RLS.
- Use explicit enums or constrained strings for finite states.
- Use foreign keys and unique constraints for invariants.

## 2. Entity relationship overview

```text
User ──< ShopMembership >── Shop
Shop ──< Customer ──< Device
Shop ──< RepairTicket >── Customer
RepairTicket ──< RepairStatusEvent
RepairTicket ──< RepairNote
RepairTicket ──< RepairAssignment >── User
RepairTicket ──< Estimate
RepairTicket ──< Payment
Shop ──< Part ──< StockMovement
RepairTicket ──< PartUsage >── Part
RepairTicket ──0..1 Warranty ──< WarrantyClaim
Shop ──< Notification
Shop ──< AuditEvent
```

## 3. Tables

### `users`
- `id UUID PK`
- `email CITEXT UNIQUE NULL`
- `phone VARCHAR(32) UNIQUE NULL`
- `password_hash TEXT NULL` (only if local password auth is used)
- `display_name VARCHAR(120)`
- `is_active BOOLEAN`
- `created_at`, `updated_at`

At least one verified login identifier is required. Never store plaintext passwords.

### `shops`
- `id UUID PK`
- `name VARCHAR(160)`
- `slug VARCHAR(100) UNIQUE`
- `phone VARCHAR(32)`
- `email VARCHAR(254) NULL`
- `address TEXT NULL`
- `city VARCHAR(100) NULL`
- `country_code CHAR(2) DEFAULT 'ET'`
- `currency CHAR(3) DEFAULT 'ETB'`
- `timezone VARCHAR(64) DEFAULT 'Africa/Addis_Ababa'`
- `settings JSONB` (small validated settings only)
- `created_at`, `updated_at`

### `shop_memberships`
- `id UUID PK`
- `shop_id UUID FK shops`
- `user_id UUID FK users`
- `role ENUM(owner, manager, receptionist, technician)`
- `permissions JSONB NULL` (optional constrained overrides; prefer normalized permissions if complex)
- `status ENUM(invited, active, suspended, removed)`
- `created_at`, `updated_at`
- Unique `(shop_id, user_id)`

### `customers`
- `id UUID PK`
- `shop_id UUID FK shops`
- `full_name VARCHAR(160)`
- `phone VARCHAR(32)`
- `email VARCHAR(254) NULL`
- `notes TEXT NULL` (limit length and avoid sensitive data)
- `created_by UUID FK users`
- `created_at`, `updated_at`
- Index `(shop_id, phone)`, `(shop_id, full_name)`

Phone normalization strategy must be documented. Preserve display format while storing normalized searchable value.

### `devices`
- `id UUID PK`
- `shop_id UUID FK shops`
- `customer_id UUID FK customers`
- `device_type ENUM(phone, laptop, tablet, desktop, appliance, other)`
- `brand VARCHAR(100) NULL`
- `model VARCHAR(120) NULL`
- `serial_number VARCHAR(120) NULL`
- `imei VARCHAR(32) NULL`
- `color VARCHAR(60) NULL`
- `created_at`, `updated_at`
- Index `(shop_id, customer_id)`, optional scoped identifier indexes.

IMEI/serial values are sensitive business identifiers. Mask in list views and restrict access where appropriate. Do not require IMEI for all devices.

### `repair_tickets`
- `id UUID PK`
- `shop_id UUID FK shops`
- `ticket_number VARCHAR(40)` (human-readable, unique per shop)
- `customer_id UUID FK customers`
- `device_id UUID FK devices`
- `reported_issue TEXT`
- `condition_on_intake TEXT NULL`
- `accessories_received TEXT[] or normalized child table`
- `status ENUM(...)`
- `priority ENUM(normal, urgent)` with permissioned use
- `estimated_cost NUMERIC(14,2) NULL`
- `final_cost NUMERIC(14,2) NULL`
- `currency CHAR(3)`
- `expected_completion_at TIMESTAMPTZ NULL`
- `received_at TIMESTAMPTZ`
- `completed_at TIMESTAMPTZ NULL`
- `collected_at TIMESTAMPTZ NULL`
- `created_by UUID FK users`
- `created_at`, `updated_at`
- Unique `(shop_id, ticket_number)`
- Index `(shop_id, status, received_at DESC)`, `(shop_id, customer_id)`

### `repair_status_events`
- `id UUID PK`
- `shop_id UUID FK shops`
- `repair_ticket_id UUID FK repair_tickets`
- `from_status ENUM NULL`
- `to_status ENUM`
- `reason TEXT NULL`
- `actor_user_id UUID FK users`
- `created_at TIMESTAMPTZ`
- Index `(shop_id, repair_ticket_id, created_at)`

Append-only for normal app roles.

### `repair_notes`
- `id UUID PK`
- `shop_id UUID FK shops`
- `repair_ticket_id UUID FK repair_tickets`
- `author_user_id UUID FK users`
- `note_type ENUM(internal, customer_visible)`
- `body TEXT`
- `created_at TIMESTAMPTZ`

Customer-visible notes must be explicitly approved and sanitized before sharing.

### `repair_assignments`
- `id UUID PK`
- `shop_id UUID FK shops`
- `repair_ticket_id UUID FK repair_tickets`
- `technician_user_id UUID FK users`
- `assigned_by UUID FK users`
- `assigned_at TIMESTAMPTZ`
- `unassigned_at TIMESTAMPTZ NULL`
- Index `(shop_id, technician_user_id, unassigned_at)`

### `estimates`
- `id UUID PK`
- `shop_id UUID FK shops`
- `repair_ticket_id UUID FK repair_tickets`
- `version INTEGER`
- `labor_amount NUMERIC(14,2)`
- `parts_amount NUMERIC(14,2)`
- `discount_amount NUMERIC(14,2) DEFAULT 0`
- `total_amount NUMERIC(14,2)`
- `currency CHAR(3)`
- `status ENUM(draft, sent, approved, rejected, superseded)`
- `approved_at TIMESTAMPTZ NULL`
- `created_by UUID FK users`
- `created_at`
- Unique `(shop_id, repair_ticket_id, version)`

### `payments`
- `id UUID PK`
- `shop_id UUID FK shops`
- `repair_ticket_id UUID FK repair_tickets`
- `amount NUMERIC(14,2)`
- `currency CHAR(3)`
- `method ENUM(cash, bank_transfer, mobile_money, card, other)`
- `reference VARCHAR(120) NULL`
- `status ENUM(recorded, reversed, refunded)`
- `recorded_by UUID FK users`
- `recorded_at TIMESTAMPTZ`
- `reversal_of_payment_id UUID FK payments NULL`
- Index `(shop_id, repair_ticket_id, recorded_at)`

Payment entries should be immutable except for explicit reversal/refund workflows. Validate positive amounts and currency.

### P1 inventory tables
`parts`: `id`, `shop_id`, `sku`, `name`, `description`, `unit`, `reorder_level`, `is_active`, timestamps; unique `(shop_id, sku)`.

`stock_movements`: `id`, `shop_id`, `part_id`, `movement_type`, `quantity_delta`, `unit_cost`, `reference_type`, `reference_id`, `created_by`, `created_at`. Append-only; stock is derived from movements or maintained transactionally with reconciliation.

`repair_part_usages`: `id`, `shop_id`, `repair_ticket_id`, `part_id`, `quantity`, `unit_cost`, `created_by`, `created_at`.

### P1 warranty tables
`warranties`: `id`, `shop_id`, `repair_ticket_id UNIQUE`, `starts_at`, `ends_at`, `terms`, `status`.

`warranty_claims`: `id`, `shop_id`, `warranty_id`, `customer_description`, `status`, `resolution`, `created_at`, `updated_at`.

### `notifications`
- `id UUID PK`
- `shop_id UUID FK shops`
- `repair_ticket_id UUID FK repair_tickets NULL`
- `customer_id UUID FK customers NULL`
- `channel ENUM(sms, email, in_app)`
- `template_key VARCHAR(80)`
- `destination_masked VARCHAR(64)`
- `provider_message_id VARCHAR(160) NULL`
- `status ENUM(queued, sent, delivered, failed, unknown, cancelled)`
- `idempotency_key VARCHAR(120) UNIQUE`
- `cost_amount NUMERIC(14,4) NULL`
- `failure_code_safe VARCHAR(80) NULL`
- `created_at`, `updated_at`

Do not store provider secrets or unnecessary raw provider responses here.

### `audit_events`
- `id UUID PK`
- `shop_id UUID FK shops`
- `actor_user_id UUID FK users NULL`
- `action VARCHAR(100)`
- `entity_type VARCHAR(80)`
- `entity_id UUID`
- `request_id VARCHAR(80) NULL`
- `metadata JSONB` (allowlisted, no secrets or full sensitive payload)
- `created_at`
- Index `(shop_id, created_at DESC)`, `(shop_id, entity_type, entity_id)`

Append-only for application roles.

## 4. RLS requirements

Enable and force RLS on every tenant-owned table, including memberships where the policy is appropriate. Use `shop_id` to isolate data. Membership reads require a carefully designed policy so users can resolve only their own active memberships. Avoid circular policy dependencies.

For every table:
- `USING` restricts rows visible/updateable/deletable.
- `WITH CHECK` restricts rows inserted or updated.
- Test SELECT, INSERT, UPDATE and DELETE behavior.
- Test missing tenant context (must return no tenant rows / reject writes).
- Test cross-tenant foreign-key combinations.
- Runtime role must not bypass RLS.

The `shops` table has its own membership-based policy. `users` is global identity data; expose only the current user's safe profile fields through controlled API queries.

## 5. Transaction boundaries and invariants

- Creating a repair ticket + initial status event + ticket number allocation occurs in one transaction.
- Payment entry + recalculated balance snapshot (if stored) + audit event occurs in one transaction.
- Status transition + status event + outbox notification event occurs in one transaction.
- Part usage + stock movement occurs in one transaction.
- Ticket number generation must be concurrency-safe (sequence/counter table or collision-safe retry), not a naive count of existing tickets.
- Do not calculate balances from client-submitted totals.
- Do not cascade-delete financial records or audit events.

## 6. Prisma and SQL migration guidance

Prisma schema defines models and relations. RLS policies, extensions, partial indexes, triggers and advanced constraints may require raw SQL migrations. Keep these migrations in source control and review generated SQL. Do not disable RLS to make Prisma queries pass; set tenant context correctly.

## 7. Example tenant-scoped transaction

```ts
await prisma.$transaction(async (tx) => {
  await tx.$executeRaw`SELECT set_config('app.current_shop_id', ${shopId}, true)`;
  // Membership was already verified by the API.
  // All tenant-scoped reads/writes happen through this tx client.
  return tx.customer.findMany({ where: { shopId } });
});
```

The third argument `true` makes the setting transaction-local. Confirm driver and pool behavior in integration tests. Never set tenant context globally on a pooled connection.
