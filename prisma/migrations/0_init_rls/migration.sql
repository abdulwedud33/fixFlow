-- FixFlow Row-Level Security Policies Migration
-- This migration enables and enforces RLS across all tenant-owned tables.

-- Function to safely get tenant ID from session context
CREATE OR REPLACE FUNCTION app_current_shop_id() RETURNS uuid AS $$
BEGIN
  RETURN NULLIF(current_setting('app.current_shop_id', true), '')::uuid;
EXCEPTION WHEN OTHERS THEN
  RETURN NULL;
END;
$$ LANGUAGE plpgsql STABLE;

-- 1. shops table
ALTER TABLE shops ENABLE ROW LEVEL SECURITY;
ALTER TABLE shops FORCE ROW LEVEL SECURITY;

CREATE POLICY shops_tenant_isolation ON shops
  FOR ALL
  USING (id = app_current_shop_id())
  WITH CHECK (id = app_current_shop_id());

-- 2. shop_memberships table
ALTER TABLE shop_memberships ENABLE ROW LEVEL SECURITY;
ALTER TABLE shop_memberships FORCE ROW LEVEL SECURITY;

CREATE POLICY shop_memberships_tenant_isolation ON shop_memberships
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 3. customers table
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE customers FORCE ROW LEVEL SECURITY;

CREATE POLICY customers_tenant_isolation ON customers
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 4. devices table
ALTER TABLE devices ENABLE ROW LEVEL SECURITY;
ALTER TABLE devices FORCE ROW LEVEL SECURITY;

CREATE POLICY devices_tenant_isolation ON devices
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 5. repair_tickets table
ALTER TABLE repair_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_tickets FORCE ROW LEVEL SECURITY;

CREATE POLICY repair_tickets_tenant_isolation ON repair_tickets
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 6. repair_status_events table
ALTER TABLE repair_status_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_status_events FORCE ROW LEVEL SECURITY;

CREATE POLICY repair_status_events_tenant_isolation ON repair_status_events
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 7. repair_notes table
ALTER TABLE repair_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_notes FORCE ROW LEVEL SECURITY;

CREATE POLICY repair_notes_tenant_isolation ON repair_notes
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 8. repair_assignments table
ALTER TABLE repair_assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_assignments FORCE ROW LEVEL SECURITY;

CREATE POLICY repair_assignments_tenant_isolation ON repair_assignments
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 9. estimates table
ALTER TABLE estimates ENABLE ROW LEVEL SECURITY;
ALTER TABLE estimates FORCE ROW LEVEL SECURITY;

CREATE POLICY estimates_tenant_isolation ON estimates
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 10. payments table (immutable ledger, append-only)
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments FORCE ROW LEVEL SECURITY;

CREATE POLICY payments_tenant_isolation ON payments
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 11. parts table
ALTER TABLE parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE parts FORCE ROW LEVEL SECURITY;

CREATE POLICY parts_tenant_isolation ON parts
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 12. stock_movements table
ALTER TABLE stock_movements ENABLE ROW LEVEL SECURITY;
ALTER TABLE stock_movements FORCE ROW LEVEL SECURITY;

CREATE POLICY stock_movements_tenant_isolation ON stock_movements
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 13. repair_part_usages table
ALTER TABLE repair_part_usages ENABLE ROW LEVEL SECURITY;
ALTER TABLE repair_part_usages FORCE ROW LEVEL SECURITY;

CREATE POLICY repair_part_usages_tenant_isolation ON repair_part_usages
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 14. warranties table
ALTER TABLE warranties ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranties FORCE ROW LEVEL SECURITY;

CREATE POLICY warranties_tenant_isolation ON warranties
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 15. warranty_claims table
ALTER TABLE warranty_claims ENABLE ROW LEVEL SECURITY;
ALTER TABLE warranty_claims FORCE ROW LEVEL SECURITY;

CREATE POLICY warranty_claims_tenant_isolation ON warranty_claims
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 16. notifications table
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications FORCE ROW LEVEL SECURITY;

CREATE POLICY notifications_tenant_isolation ON notifications
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());

-- 17. audit_events table (append-only)
ALTER TABLE audit_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_events FORCE ROW LEVEL SECURITY;

CREATE POLICY audit_events_tenant_isolation ON audit_events
  FOR ALL
  USING (shop_id = app_current_shop_id())
  WITH CHECK (shop_id = app_current_shop_id());
