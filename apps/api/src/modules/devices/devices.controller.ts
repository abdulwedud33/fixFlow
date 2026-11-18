import { Router, Response } from "express";
import { authenticate, requireTenant, AuthRequest } from "../../middleware/auth";
import { db, DeviceEntity } from "../../db/store";
import { deviceSchema } from "@fixflow/contracts";
import { logAuditEvent } from "../audit/audit.service";

export const devicesRouter = Router();
devicesRouter.use(authenticate, requireTenant);

// List devices (optionally filter by customerId)
devicesRouter.get("/", (req: AuthRequest, res: Response, next) => {
  try {
    const customerId = req.query.customerId as string;
    let devices = db.devices.filter((d) => d.shopId === req.shopId);

    if (customerId) {
      devices = devices.filter((d) => d.customerId === customerId);
    }

    devices.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    res.json({ data: devices, meta: { requestId: req.requestId, total: devices.length } });
  } catch (err) {
    next(err);
  }
});

// Create device
devicesRouter.post("/", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = deviceSchema.parse(req.body);

    // Verify customer exists and belongs to this shop
    const customer = db.customers.find(
      (c) => c.id === validated.customerId && c.shopId === req.shopId
    );
    if (!customer) {
      return res.status(404).json({
        error: { code: "CUSTOMER_NOT_FOUND", message: "Customer not found in this shop", requestId: req.requestId },
      });
    }

    const now = new Date();
    const device: DeviceEntity = {
      id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      customerId: validated.customerId,
      deviceType: validated.deviceType,
      brand: validated.brand.trim(),
      model: validated.model.trim(),
      serialNumber: validated.serialNumber?.trim() || null,
      imei: validated.imei?.trim() || null,
      color: validated.color?.trim() || null,
      createdAt: now,
      updatedAt: now,
    };

    db.devices.push(device);

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "device.created",
      entityType: "device",
      entityId: device.id,
      requestId: req.requestId,
      metadata: { brand: device.brand, model: device.model },
    });

    res.status(201).json({ data: device, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});
