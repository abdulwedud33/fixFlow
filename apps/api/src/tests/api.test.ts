import { describe, it, expect, beforeEach } from "vitest";
import request from "supertest";
import { app } from "../server";
import { db } from "../db/store";
import { RepairStatus, UserRole } from "@fixflow/contracts";

describe("FixFlow API & Security Evaluation Suite", () => {
  beforeEach(() => {
    db.clear();
  });

  describe("1. Authentication & Multi-Tenant Isolation", () => {
    it("registers shop owner and derives tenant context", async () => {
      const res = await request(app)
        .post("/api/v1/auth/register")
        .send({
          displayName: "Abebe Kebede",
          phone: "0911223344",
          password: "Password123!",
          shopName: "Abebe Mobile Care",
          shopCity: "Addis Ababa",
        });

      expect(res.status).toBe(201);
      expect(res.body.data.user.displayName).toBe("Abebe Kebede");
      expect(res.body.data.shop.name).toBe("Abebe Mobile Care");
      expect(res.body.data.token).toBeDefined();
    });

    it("enforces strict cross-tenant isolation: Shop B cannot access Shop A's repairs", async () => {
      // 1. Register Shop A (Abebe)
      const resA = await request(app)
        .post("/api/v1/auth/register")
        .send({
          displayName: "Abebe",
          phone: "0911000001",
          password: "Password123!",
          shopName: "Shop A",
        });
      const tokenA = resA.body.data.token;

      // 2. Register Shop B (Dawit)
      const resB = await request(app)
        .post("/api/v1/auth/register")
        .send({
          displayName: "Dawit",
          phone: "0911000002",
          password: "Password123!",
          shopName: "Shop B",
        });
      const tokenB = resB.body.data.token;

      // 3. Create customer and repair in Shop A
      const createRepairRes = await request(app)
        .post("/api/v1/repairs")
        .set("Authorization", `Bearer ${tokenA}`)
        .send({
          customer: { fullName: "Almaz", phone: "0912334455" },
          device: { deviceType: "phone", brand: "Samsung", model: "A54" },
          reportedIssue: "Cracked screen",
        });

      expect(createRepairRes.status).toBe(201);
      const ticketId = createRepairRes.body.data.id;

      // 4. Shop B attempts to access Shop A's ticket (IDOR test)
      const getResB = await request(app)
        .get(`/api/v1/repairs/${ticketId}`)
        .set("Authorization", `Bearer ${tokenB}`);

      // Must be 404 NOT_FOUND (preventing information disclosure of another tenant's existence)
      expect(getResB.status).toBe(404);
      expect(getResB.body.error.code).toBe("NOT_FOUND");
    });
  });

  describe("2. Status Transition Finite State Machine", () => {
    it("allows valid lifecycle transitions and rejects invalid jumps", async () => {
      const reg = await request(app)
        .post("/api/v1/auth/register")
        .send({
          displayName: "Solomon",
          phone: "0911998877",
          password: "Password123!",
          shopName: "Solomon Repairs",
        });
      const token = reg.body.data.token;

      const ticketRes = await request(app)
        .post("/api/v1/repairs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customer: { fullName: "Kassahun", phone: "0911112233" },
          device: { deviceType: "phone", brand: "Apple", model: "iPhone 13" },
          reportedIssue: "Battery replacement",
        });
      const ticketId = ticketRes.body.data.id;

      // RECEIVED -> DIAGNOSING (Valid)
      const trans1 = await request(app)
        .post(`/api/v1/repairs/${ticketId}/transitions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ toStatus: RepairStatus.DIAGNOSING, reason: "Started inspection" });

      expect(trans1.status).toBe(200);
      expect(trans1.body.data.status).toBe(RepairStatus.DIAGNOSING);

      // DIAGNOSING -> COLLECTED (Invalid: cannot jump directly from diagnosing to collected!)
      const invalidTrans = await request(app)
        .post(`/api/v1/repairs/${ticketId}/transitions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ toStatus: RepairStatus.COLLECTED });

      expect(invalidTrans.status).toBe(400);
      expect(invalidTrans.body.error.code).toBe("INVALID_STATUS_TRANSITION");
    });
  });

  describe("3. Payment Ledger & Balance Calculations", () => {
    it("handles payments idempotently and prevents double-recording", async () => {
      const reg = await request(app)
        .post("/api/v1/auth/register")
        .send({
          displayName: "Tigist",
          phone: "0911445566",
          password: "Password123!",
          shopName: "Tigist Tech",
        });
      const token = reg.body.data.token;

      const ticketRes = await request(app)
        .post("/api/v1/repairs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customer: { fullName: "Bethelhem", phone: "0922334455" },
          device: { deviceType: "laptop", brand: "Dell", model: "XPS 13" },
          reportedIssue: "OS reinstall",
          estimatedCost: 1500,
        });
      const ticketId = ticketRes.body.data.id;

      const idempotencyKey = "unique_pay_req_123456";

      // 1. First payment attempt
      const pay1 = await request(app)
        .post(`/api/v1/repairs/${ticketId}/payments`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 500,
          method: "mobile_money",
          reference: "Telebirr-TX-987",
          idempotencyKey,
        });

      expect(pay1.status).toBe(201);
      expect(pay1.body.data.summary.totalPaid).toBe(500);
      expect(pay1.body.data.summary.balance).toBe(1000);

      // 2. Retry with same idempotency key (must NOT charge/record again)
      const payRetry = await request(app)
        .post(`/api/v1/repairs/${ticketId}/payments`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 500,
          method: "mobile_money",
          reference: "Telebirr-TX-987",
          idempotencyKey,
        });

      expect(payRetry.status).toBe(200);
      expect(payRetry.body.meta.idempotentReplay).toBe(true);

      // Ensure total recorded payments is still exactly 1
      const ticketDetails = await request(app)
        .get(`/api/v1/repairs/${ticketId}`)
        .set("Authorization", `Bearer ${token}`);

      expect(ticketDetails.body.data.payments.length).toBe(1);
      expect(ticketDetails.body.data.totalPaid).toBe(500);
    });

    it("enforces payment before marking device as collected", async () => {
      const reg = await request(app)
        .post("/api/v1/auth/register")
        .send({
          displayName: "Owner",
          phone: "0911776655",
          password: "Password123!",
          shopName: "Quality Repairs",
        });
      const token = reg.body.data.token;

      const ticketRes = await request(app)
        .post("/api/v1/repairs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customer: { fullName: "Henok", phone: "0912121212" },
          device: { deviceType: "phone", brand: "Xiaomi", model: "Redmi Note 12" },
          reportedIssue: "Charging port repair",
          estimatedCost: 800,
        });
      const ticketId = ticketRes.body.data.id;

      // Move to COMPLETED -> READY_FOR_PICKUP
      await request(app)
        .post(`/api/v1/repairs/${ticketId}/transitions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ toStatus: RepairStatus.IN_PROGRESS });

      await request(app)
        .post(`/api/v1/repairs/${ticketId}/transitions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ toStatus: RepairStatus.COMPLETED });

      await request(app)
        .post(`/api/v1/repairs/${ticketId}/transitions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ toStatus: RepairStatus.READY_FOR_PICKUP });

      // Attempt COLLECTED without payment (must fail)
      const collectFail = await request(app)
        .post(`/api/v1/repairs/${ticketId}/transitions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ toStatus: RepairStatus.COLLECTED });

      expect(collectFail.status).toBe(400);
      expect(collectFail.body.error.code).toBe("UNPAID_BALANCE");

      // Pay full balance
      await request(app)
        .post(`/api/v1/repairs/${ticketId}/payments`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          amount: 800,
          method: "cash",
          idempotencyKey: "pay_full_cash_999",
        });

      // Now collect succeeds
      const collectSuccess = await request(app)
        .post(`/api/v1/repairs/${ticketId}/transitions`)
        .set("Authorization", `Bearer ${token}`)
        .send({ toStatus: RepairStatus.COLLECTED });

      expect(collectSuccess.status).toBe(200);
      expect(collectSuccess.body.data.status).toBe(RepairStatus.COLLECTED);
    });
  });

  describe("4. Public Repair Tracking Security", () => {
    it("allows tracking with valid ticket number + phoneLast4, stripping internal notes and financials", async () => {
      const reg = await request(app)
        .post("/api/v1/auth/register")
        .send({
          displayName: "Shop Owner",
          phone: "0911554433",
          password: "Password123!",
          shopName: "Downtown Electronics",
        });
      const token = reg.body.data.token;

      // Customer phone ends with '8899'
      const ticketRes = await request(app)
        .post("/api/v1/repairs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customer: { fullName: "Secret Customer", phone: "0911228899" },
          device: { deviceType: "phone", brand: "Tecno", model: "Camon 20", color: "Blue" },
          reportedIssue: "Speaker not working",
          estimatedCost: 650,
        });

      const ticket = ticketRes.body.data;

      // Add one internal note and one customer-visible note
      await request(app)
        .post(`/api/v1/repairs/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${token}`)
        .send({ noteType: "internal", body: "Customer was upset about wait time" });

      await request(app)
        .post(`/api/v1/repairs/${ticket.id}/notes`)
        .set("Authorization", `Bearer ${token}`)
        .send({ noteType: "customer_visible", body: "Replaced speaker module. Testing sound." });

      // Public track with correct phoneLast4
      const trackRes = await request(app)
        .post("/api/v1/tracking")
        .send({
          ticketNumber: ticket.ticketNumber,
          phoneLast4: "8899",
        });

      expect(trackRes.status).toBe(200);
      const data = trackRes.body.data;
      expect(data.ticketNumber).toBe(ticket.ticketNumber);
      expect(data.status).toBe("RECEIVED");
      expect(data.deviceSummary).toContain("Tecno Camon 20");

      // Verify ZERO PII or financial leakage
      expect(data.customer).toBeUndefined();
      expect(data.fullName).toBeUndefined();
      expect(data.totalCost).toBeUndefined();
      expect(data.balance).toBeUndefined();

      // Only customer_visible note is exposed
      expect(data.publicNotes.length).toBe(1);
      expect(data.publicNotes[0].body).toBe("Replaced speaker module. Testing sound.");

      // Test wrong phoneLast4
      const wrongTrack = await request(app)
        .post("/api/v1/tracking")
        .send({
          ticketNumber: ticket.ticketNumber,
          phoneLast4: "0000",
        });

      expect(wrongTrack.status).toBe(404);
    });
  });

  describe("5. Inventory Consumption & Low Stock Tracking", () => {
    it("atomically consumes parts on repair and updates stock", async () => {
      const reg = await request(app)
        .post("/api/v1/auth/register")
        .send({
          displayName: "Owner",
          phone: "0911332211",
          password: "Password123!",
          shopName: "FixFlow Labs",
        });
      const token = reg.body.data.token;

      // Create part with 10 units
      const partRes = await request(app)
        .post("/api/v1/inventory")
        .set("Authorization", `Bearer ${token}`)
        .send({
          sku: "BAT-IP11",
          name: "iPhone 11 Replacement Battery",
          unit: "pcs",
          costPrice: 400,
          sellingPrice: 850,
          reorderLevel: 3,
          initialQuantity: 10,
        });

      expect(partRes.status).toBe(201);
      const partId = partRes.body.data.id;

      // Create ticket
      const ticketRes = await request(app)
        .post("/api/v1/repairs")
        .set("Authorization", `Bearer ${token}`)
        .send({
          customer: { fullName: "Amanuel", phone: "0933445566" },
          device: { deviceType: "phone", brand: "Apple", model: "iPhone 11" },
          reportedIssue: "Dead battery",
        });
      const ticketId = ticketRes.body.data.id;

      // Consume 2 batteries for this repair
      const consumeRes = await request(app)
        .post(`/api/v1/inventory/repairs/${ticketId}/consume`)
        .set("Authorization", `Bearer ${token}`)
        .send({
          partId,
          quantity: 2,
        });

      expect(consumeRes.status).toBe(201);
      expect(consumeRes.body.data.remainingStock).toBe(8);

      // Verify stock in inventory list
      const invList = await request(app)
        .get("/api/v1/inventory")
        .set("Authorization", `Bearer ${token}`);

      const partInList = invList.body.data.find((p: any) => p.id === partId);
      expect(partInList.currentQuantity).toBe(8);
    });
  });
});
