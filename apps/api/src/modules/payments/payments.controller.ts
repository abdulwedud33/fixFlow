import { Router, Response } from "express";
import { authenticate, requireTenant, requireRole, AuthRequest } from "../../middleware/auth";
import { db, PaymentEntity, EstimateEntity } from "../../db/store";
import {
  createEstimateSchema,
  updateEstimateStatusSchema,
  recordPaymentSchema,
  reversePaymentSchema,
  EstimateStatus,
  UserRole,
} from "@fixflow/contracts";
import { logAuditEvent } from "../audit/audit.service";

export const paymentsRouter = Router();
paymentsRouter.use(authenticate, requireTenant);

// Create or update estimate for a repair ticket
paymentsRouter.post("/repairs/:id/estimates", requireRole([UserRole.OWNER, UserRole.MANAGER, UserRole.RECEPTIONIST]), (req: AuthRequest, res: Response, next) => {
  try {
    const validated = createEstimateSchema.parse(req.body);
    const ticket = db.repairTickets.find(
      (t) => (t.id === req.params.id || t.ticketNumber === req.params.id) && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    // Get current version number
    const existingEstimates = db.estimates.filter(
      (e) => e.repairTicketId === ticket.id
    );
    const nextVersion = existingEstimates.length + 1;

    // Server-side total calculation: total = labor + parts - discount
    const totalAmount = Math.max(
      0,
      validated.laborAmount + validated.partsAmount - validated.discountAmount
    );

    const estimate: EstimateEntity = {
      id: `est_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      repairTicketId: ticket.id,
      version: nextVersion,
      laborAmount: validated.laborAmount,
      partsAmount: validated.partsAmount,
      discountAmount: validated.discountAmount,
      totalAmount,
      currency: validated.currency || "ETB",
      status: EstimateStatus.DRAFT,
      notes: validated.notes || null,
      approvedAt: null,
      createdBy: req.user!.id,
      createdAt: new Date(),
    };

    db.estimates.push(estimate);

    // Update ticket's estimatedCost
    ticket.estimatedCost = totalAmount;
    ticket.updatedAt = new Date();

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "estimate.created",
      entityType: "estimate",
      entityId: estimate.id,
      requestId: req.requestId,
      metadata: { version: nextVersion, totalAmount },
    });

    res.status(201).json({ data: estimate, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// Update estimate status (Approve / Reject)
paymentsRouter.patch("/estimates/:id/status", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = updateEstimateStatusSchema.parse(req.body);
    const estimate = db.estimates.find(
      (e) => e.id === req.params.id && e.shopId === req.shopId
    );

    if (!estimate) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Estimate not found", requestId: req.requestId },
      });
    }

    estimate.status = validated.status;
    if (validated.status === EstimateStatus.APPROVED) {
      estimate.approvedAt = new Date();
      // Update ticket finalCost if approved
      const ticket = db.repairTickets.find((t) => t.id === estimate.repairTicketId);
      if (ticket) {
        ticket.finalCost = estimate.totalAmount;
      }
    }

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "estimate.status_updated",
      entityType: "estimate",
      entityId: estimate.id,
      requestId: req.requestId,
      metadata: { status: validated.status },
    });

    res.json({ data: estimate, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// Record a payment for a repair ticket (Idempotent)
paymentsRouter.post("/repairs/:id/payments", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = recordPaymentSchema.parse(req.body);
    const ticket = db.repairTickets.find(
      (t) => (t.id === req.params.id || t.ticketNumber === req.params.id) && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    // Idempotency check: if a payment with this idempotency key already exists, return it
    const existing = db.payments.find(
      (p) => p.shopId === req.shopId && p.idempotencyKey === validated.idempotencyKey
    );
    if (existing) {
      return res.status(200).json({
        data: existing,
        meta: { requestId: req.requestId, idempotentReplay: true },
      });
    }

    const now = new Date();
    const payment: PaymentEntity = {
      id: `pay_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      repairTicketId: ticket.id,
      amount: validated.amount,
      currency: "ETB",
      method: validated.method,
      reference: validated.reference?.trim() || null,
      status: "recorded",
      idempotencyKey: validated.idempotencyKey,
      notes: validated.notes?.trim() || null,
      recordedBy: req.user!.id,
      recordedAt: now,
      reversalOfPaymentId: null,
    };

    db.payments.push(payment);

    // Calculate current total paid and remaining balance
    const payments = db.payments.filter(
      (p) => p.repairTicketId === ticket.id && p.status === "recorded"
    );
    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCost = ticket.finalCost ?? ticket.estimatedCost ?? 0;
    const balance = Math.max(0, totalCost - totalPaid);

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "payment.recorded",
      entityType: "payment",
      entityId: payment.id,
      requestId: req.requestId,
      metadata: {
        amount: payment.amount,
        method: payment.method,
        ticketNumber: ticket.ticketNumber,
      },
    });

    res.status(201).json({
      data: {
        payment,
        summary: {
          totalCost,
          totalPaid,
          balance,
        },
      },
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});

// Reverse a payment (Owner and Manager only)
paymentsRouter.post(
  "/payments/:id/reversal",
  requireRole([UserRole.OWNER, UserRole.MANAGER]),
  (req: AuthRequest, res: Response, next) => {
    try {
      const validated = reversePaymentSchema.parse(req.body);
      const originalPayment = db.payments.find(
        (p) => p.id === req.params.id && p.shopId === req.shopId
      );

      if (!originalPayment) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Payment record not found", requestId: req.requestId },
        });
      }

      if (originalPayment.status === "reversed") {
        return res.status(400).json({
          error: {
            code: "ALREADY_REVERSED",
            message: "This payment has already been reversed",
            requestId: req.requestId,
          },
        });
      }

      originalPayment.status = "reversed";

      // Create reversing entry in ledger
      const reversalPayment: PaymentEntity = {
        id: `rev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        shopId: req.shopId!,
        repairTicketId: originalPayment.repairTicketId,
        amount: -originalPayment.amount,
        currency: originalPayment.currency,
        method: originalPayment.method,
        reference: `Reversal of ${originalPayment.id}`,
        status: "reversed",
        idempotencyKey: null,
        notes: validated.reason,
        recordedBy: req.user!.id,
        recordedAt: new Date(),
        reversalOfPaymentId: originalPayment.id,
      };

      db.payments.push(reversalPayment);

      logAuditEvent({
        shopId: req.shopId!,
        actorUserId: req.user!.id,
        action: "payment.reversed",
        entityType: "payment",
        entityId: originalPayment.id,
        requestId: req.requestId,
        metadata: { reason: validated.reason, amount: originalPayment.amount },
      });

      res.json({
        data: {
          originalPayment,
          reversal: reversalPayment,
        },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Get receipt payload for printing (80mm thermal or standard invoice)
paymentsRouter.get("/repairs/:id/receipt", (req: AuthRequest, res: Response, next) => {
  try {
    const ticket = db.repairTickets.find(
      (t) => (t.id === req.params.id || t.ticketNumber === req.params.id) && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    const shop = db.shops.find((s) => s.id === req.shopId);
    const customer = db.customers.find((c) => c.id === ticket.customerId);
    const device = db.devices.find((d) => d.id === ticket.deviceId);
    const payments = db.payments.filter(
      (p) => p.repairTicketId === ticket.id && p.status === "recorded"
    );

    const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
    const totalCost = ticket.finalCost ?? ticket.estimatedCost ?? 0;
    const balance = Math.max(0, totalCost - totalPaid);

    const warranty = db.warranties.find((w) => w.repairTicketId === ticket.id);

    const receipt = {
      receiptNumber: `RCP-${ticket.ticketNumber}`,
      issuedAt: new Date(),
      shop: {
        name: shop?.name || "FixFlow Repair Shop",
        phone: shop?.phone,
        email: shop?.email,
        address: shop?.address,
        city: shop?.city,
        receiptFooter: shop?.settings?.receiptFooterText || "Thank you for your business!",
        terms: shop?.settings?.termsAndConditions,
      },
      customer: {
        fullName: customer?.fullName || "Walk-in Customer",
        phone: customer?.phone || "",
      },
      device: {
        brand: device?.brand,
        model: device?.model,
        serialOrImei: device?.imei || device?.serialNumber || "N/A",
        condition: ticket.conditionOnIntake || "Normal wear",
        accessories: ticket.accessoriesReceived,
      },
      repair: {
        ticketNumber: ticket.ticketNumber,
        status: ticket.status,
        reportedIssue: ticket.reportedIssue,
        receivedAt: ticket.receivedAt,
        completedAt: ticket.completedAt,
        collectedAt: ticket.collectedAt,
      },
      financials: {
        totalCost,
        totalPaid,
        balance,
        currency: "ETB",
        payments: payments.map((p) => ({
          id: p.id,
          amount: p.amount,
          method: p.method,
          reference: p.reference,
          recordedAt: p.recordedAt,
        })),
      },
      warranty: warranty
        ? {
            startsAt: warranty.startsAt,
            endsAt: warranty.endsAt,
            terms: warranty.terms,
          }
        : null,
    };

    res.json({ data: receipt, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});
