import { Router, Response } from "express";
import { authenticate, requireTenant, AuthRequest } from "../../middleware/auth";
import { db, CustomerEntity } from "../../db/store";
import { customerSchema, normalizeEthiopianPhone } from "@fixflow/contracts";
import { logAuditEvent } from "../audit/audit.service";

export const customersRouter = Router();
customersRouter.use(authenticate, requireTenant);

// List/search customers
customersRouter.get("/", (req: AuthRequest, res: Response, next) => {
  try {
    const query = (req.query.q as string)?.trim().toLowerCase();
    let customers = db.customers.filter((c) => c.shopId === req.shopId);

    if (query) {
      customers = customers.filter(
        (c) =>
          c.fullName.toLowerCase().includes(query) ||
          c.phone.includes(query) ||
          (c.email && c.email.toLowerCase().includes(query))
      );
    }

    // Sort descending by created date
    customers.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

    res.json({ data: customers, meta: { requestId: req.requestId, total: customers.length } });
  } catch (err) {
    next(err);
  }
});

// Get customer by ID (with devices and tickets)
customersRouter.get("/:id", (req: AuthRequest, res: Response, next) => {
  try {
    const customer = db.customers.find(
      (c) => c.id === req.params.id && c.shopId === req.shopId
    );

    if (!customer) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Customer not found", requestId: req.requestId },
      });
    }

    const devices = db.devices.filter(
      (d) => d.customerId === customer.id && d.shopId === req.shopId
    );
    const tickets = db.repairTickets.filter(
      (t) => t.customerId === customer.id && t.shopId === req.shopId
    );

    res.json({
      data: {
        ...customer,
        devices,
        tickets,
      },
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});

// Create customer
customersRouter.post("/", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = customerSchema.parse(req.body);
    const normalizedPhone = normalizeEthiopianPhone(validated.phone);

    // Look for duplicate phone in same shop
    const existing = db.customers.find(
      (c) => c.shopId === req.shopId && c.phone === normalizedPhone
    );

    if (existing) {
      return res.status(409).json({
        error: {
          code: "CUSTOMER_EXISTS",
          message: "A customer with this phone number already exists in your shop",
          existingCustomerId: existing.id,
          requestId: req.requestId,
        },
      });
    }

    const now = new Date();
    const customer: CustomerEntity = {
      id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      fullName: validated.fullName.trim(),
      phone: normalizedPhone,
      email: validated.email?.trim().toLowerCase() || null,
      notes: validated.notes?.trim() || null,
      createdBy: req.user!.id,
      createdAt: now,
      updatedAt: now,
    };

    db.customers.push(customer);

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "customer.created",
      entityType: "customer",
      entityId: customer.id,
      requestId: req.requestId,
      metadata: { fullName: customer.fullName, phone: customer.phone },
    });

    res.status(201).json({ data: customer, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// Update customer
customersRouter.patch("/:id", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = customerSchema.partial().parse(req.body);
    const customer = db.customers.find(
      (c) => c.id === req.params.id && c.shopId === req.shopId
    );

    if (!customer) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Customer not found", requestId: req.requestId },
      });
    }

    if (validated.fullName) customer.fullName = validated.fullName.trim();
    if (validated.phone) customer.phone = normalizeEthiopianPhone(validated.phone);
    if (validated.email !== undefined) customer.email = validated.email || null;
    if (validated.notes !== undefined) customer.notes = validated.notes || null;
    customer.updatedAt = new Date();

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "customer.updated",
      entityType: "customer",
      entityId: customer.id,
      requestId: req.requestId,
    });

    res.json({ data: customer, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});
