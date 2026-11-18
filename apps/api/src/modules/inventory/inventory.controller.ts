import { Router, Response } from "express";
import { authenticate, requireTenant, requireRole, AuthRequest } from "../../middleware/auth";
import {
  db,
  PartEntity,
  StockMovementEntity,
  RepairPartUsageEntity,
} from "../../db/store";
import {
  partSchema,
  stockAdjustmentSchema,
  consumePartSchema,
  UserRole,
  StockMovementType,
} from "@fixflow/contracts";
import { logAuditEvent } from "../audit/audit.service";

export const inventoryRouter = Router();
inventoryRouter.use(authenticate, requireTenant);

// List parts
inventoryRouter.get("/", (req: AuthRequest, res: Response, next) => {
  try {
    const { lowStock } = req.query;
    let parts = db.parts.filter((p) => p.shopId === req.shopId && p.isActive);

    if (lowStock === "true") {
      parts = parts.filter((p) => p.currentQuantity <= p.reorderLevel);
    }

    parts.sort((a, b) => a.name.localeCompare(b.name));

    res.json({
      data: parts,
      meta: {
        requestId: req.requestId,
        total: parts.length,
        lowStockCount: db.parts.filter(
          (p) => p.shopId === req.shopId && p.isActive && p.currentQuantity <= p.reorderLevel
        ).length,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Create part
inventoryRouter.post(
  "/",
  requireRole([UserRole.OWNER, UserRole.MANAGER]),
  (req: AuthRequest, res: Response, next) => {
    try {
      const validated = partSchema.parse(req.body);

      // Check unique SKU
      const existing = db.parts.find(
        (p) => p.shopId === req.shopId && p.sku.toLowerCase() === validated.sku.toLowerCase()
      );
      if (existing) {
        return res.status(409).json({
          error: {
            code: "SKU_EXISTS",
            message: "A part with this SKU already exists in your inventory",
            requestId: req.requestId,
          },
        });
      }

      const now = new Date();
      const part: PartEntity = {
        id: `part_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        shopId: req.shopId!,
        sku: validated.sku.trim().toUpperCase(),
        name: validated.name.trim(),
        description: validated.description?.trim() || null,
        unit: validated.unit || "pcs",
        costPrice: validated.costPrice,
        sellingPrice: validated.sellingPrice,
        reorderLevel: validated.reorderLevel,
        currentQuantity: validated.initialQuantity,
        isActive: true,
        createdAt: now,
        updatedAt: now,
      };

      db.parts.push(part);

      // Record initial stock movement if initialQuantity > 0
      if (validated.initialQuantity > 0) {
        const movement: StockMovementEntity = {
          id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          shopId: req.shopId!,
          partId: part.id,
          movementType: StockMovementType.PURCHASE,
          quantityDelta: validated.initialQuantity,
          unitCost: validated.costPrice,
          referenceType: "initial_stock",
          referenceId: null,
          createdBy: req.user!.id,
          createdAt: now,
        };
        db.stockMovements.push(movement);
      }

      logAuditEvent({
        shopId: req.shopId!,
        actorUserId: req.user!.id,
        action: "inventory.part_created",
        entityType: "part",
        entityId: part.id,
        requestId: req.requestId,
        metadata: { sku: part.sku, name: part.name },
      });

      res.status(201).json({ data: part, meta: { requestId: req.requestId } });
    } catch (err) {
      next(err);
    }
  }
);

// Stock adjustment (Restock, Return, Adjustment)
inventoryRouter.post(
  "/adjust",
  requireRole([UserRole.OWNER, UserRole.MANAGER]),
  (req: AuthRequest, res: Response, next) => {
    try {
      const validated = stockAdjustmentSchema.parse(req.body);
      const part = db.parts.find(
        (p) => p.id === validated.partId && p.shopId === req.shopId
      );

      if (!part) {
        return res.status(404).json({
          error: { code: "NOT_FOUND", message: "Part not found", requestId: req.requestId },
        });
      }

      // Check for negative stock
      if (part.currentQuantity + validated.quantityDelta < 0) {
        return res.status(400).json({
          error: {
            code: "INSUFFICIENT_STOCK",
            message: `Cannot adjust stock below zero. Current stock: ${part.currentQuantity}`,
            requestId: req.requestId,
          },
        });
      }

      part.currentQuantity += validated.quantityDelta;
      part.updatedAt = new Date();

      const movement: StockMovementEntity = {
        id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        shopId: req.shopId!,
        partId: part.id,
        movementType: validated.movementType,
        quantityDelta: validated.quantityDelta,
        unitCost: validated.unitCost ?? part.costPrice,
        referenceType: "manual_adjustment",
        referenceId: null,
        createdBy: req.user!.id,
        createdAt: new Date(),
      };
      db.stockMovements.push(movement);

      logAuditEvent({
        shopId: req.shopId!,
        actorUserId: req.user!.id,
        action: "inventory.stock_adjusted",
        entityType: "part",
        entityId: part.id,
        requestId: req.requestId,
        metadata: { delta: validated.quantityDelta, newQuantity: part.currentQuantity },
      });

      res.json({
        data: {
          part,
          movement,
        },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
);

// Consume part during repair
inventoryRouter.post("/repairs/:id/consume", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = consumePartSchema.parse(req.body);
    const ticket = db.repairTickets.find(
      (t) => (t.id === req.params.id || t.ticketNumber === req.params.id) && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    const part = db.parts.find(
      (p) => p.id === validated.partId && p.shopId === req.shopId
    );

    if (!part) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Part not found", requestId: req.requestId },
      });
    }

    if (part.currentQuantity < validated.quantity) {
      return res.status(400).json({
        error: {
          code: "INSUFFICIENT_STOCK",
          message: `Not enough stock. Available: ${part.currentQuantity}, Requested: ${validated.quantity}`,
          requestId: req.requestId,
        },
      });
    }

    // Atomic transaction: decrement part quantity, add movement, add repair usage
    part.currentQuantity -= validated.quantity;
    part.updatedAt = new Date();

    const unitCost = validated.unitCost ?? part.sellingPrice;

    const usage: RepairPartUsageEntity = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      repairTicketId: ticket.id,
      partId: part.id,
      quantity: validated.quantity,
      unitCost,
      createdBy: req.user!.id,
      createdAt: new Date(),
    };
    db.repairPartUsages.push(usage);

    const movement: StockMovementEntity = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      partId: part.id,
      movementType: StockMovementType.REPAIR_USAGE,
      quantityDelta: -validated.quantity,
      unitCost,
      referenceType: "repair_ticket",
      referenceId: ticket.id,
      createdBy: req.user!.id,
      createdAt: new Date(),
    };
    db.stockMovements.push(movement);

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "inventory.part_consumed",
      entityType: "repair_ticket",
      entityId: ticket.id,
      requestId: req.requestId,
      metadata: { partId: part.id, quantity: validated.quantity },
    });

    res.status(201).json({
      data: {
        usage,
        remainingStock: part.currentQuantity,
      },
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});
