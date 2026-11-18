import { Router, Response } from "express";
import { authenticate, requireTenant, AuthRequest } from "../../middleware/auth";
import { db, WarrantyEntity, WarrantyClaimEntity } from "../../db/store";
import { createWarrantySchema, warrantyClaimSchema, WarrantyStatus } from "@fixflow/contracts";
import { logAuditEvent } from "../audit/audit.service";

export const warrantiesRouter = Router();
warrantiesRouter.use(authenticate, requireTenant);

// Create warranty for completed repair
warrantiesRouter.post("/", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = createWarrantySchema.parse(req.body);
    const ticket = db.repairTickets.find(
      (t) => t.id === validated.repairTicketId && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    const existing = db.warranties.find((w) => w.repairTicketId === ticket.id);
    if (existing) {
      return res.status(409).json({
        error: { code: "WARRANTY_EXISTS", message: "Warranty already issued for this repair", requestId: req.requestId },
      });
    }

    const startsAt = new Date();
    const endsAt = new Date(startsAt.getTime() + validated.durationDays * 24 * 60 * 60 * 1000);

    const warranty: WarrantyEntity = {
      id: `warr_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      repairTicketId: ticket.id,
      startsAt,
      endsAt,
      terms: validated.terms || "Standard service warranty covers replaced parts against manufacturer defects.",
      status: WarrantyStatus.ACTIVE,
      createdAt: startsAt,
      updatedAt: startsAt,
    };

    db.warranties.push(warranty);

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "warranty.created",
      entityType: "warranty",
      entityId: warranty.id,
      requestId: req.requestId,
      metadata: { durationDays: validated.durationDays, endsAt },
    });

    res.status(201).json({ data: warranty, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// File a warranty claim
warrantiesRouter.post("/:id/claims", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = warrantyClaimSchema.parse(req.body);
    const warranty = db.warranties.find(
      (w) => w.id === req.params.id && w.shopId === req.shopId
    );

    if (!warranty) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Warranty not found", requestId: req.requestId },
      });
    }

    // Check expiration
    const now = new Date();
    if (now > warranty.endsAt) {
      warranty.status = WarrantyStatus.EXPIRED;
      return res.status(400).json({
        error: {
          code: "WARRANTY_EXPIRED",
          message: `This warranty expired on ${warranty.endsAt.toLocaleDateString()}`,
          requestId: req.requestId,
        },
      });
    }

    const claim: WarrantyClaimEntity = {
      id: `claim_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      warrantyId: warranty.id,
      customerDescription: validated.customerDescription.trim(),
      status: "open",
      resolution: null,
      createdAt: now,
      updatedAt: now,
    };

    db.warrantyClaims.push(claim);
    warranty.status = WarrantyStatus.CLAIMED;

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "warranty.claim_filed",
      entityType: "warranty_claim",
      entityId: claim.id,
      requestId: req.requestId,
    });

    res.status(201).json({ data: claim, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});
