import { Router, Response } from "express";
import { authenticate, requireTenant, requireRole, AuthRequest } from "../../middleware/auth";
import {
  db,
  RepairTicketEntity,
  RepairStatusEventEntity,
  RepairNoteEntity,
  RepairAssignmentEntity,
  CustomerEntity,
  DeviceEntity,
} from "../../db/store";
import {
  createRepairTicketSchema,
  transitionStatusSchema,
  assignTechnicianSchema,
  createRepairNoteSchema,
  isValidTransition,
  RepairStatus,
  UserRole,
  normalizeEthiopianPhone,
} from "@fixflow/contracts";
import { logAuditEvent } from "../audit/audit.service";
import { getSmsProvider } from "../../providers/sms/sms.provider";
import { config } from "../../config";

export const repairsRouter = Router();
repairsRouter.use(authenticate, requireTenant);

// List / filter repairs
repairsRouter.get("/", (req: AuthRequest, res: Response, next) => {
  try {
    const { status, priority, technicianId, q, page = "1", limit = "50" } = req.query;

    let tickets = db.repairTickets.filter((t) => t.shopId === req.shopId);

    // If logged in as technician, show only assigned tickets unless they are owner/manager
    if (req.role === UserRole.TECHNICIAN) {
      const myActiveAssignments = db.repairAssignments
        .filter(
          (a) =>
            a.shopId === req.shopId &&
            a.technicianUserId === req.user!.id &&
            a.unassignedAt === null
        )
        .map((a) => a.repairTicketId);

      tickets = tickets.filter((t) => myActiveAssignments.includes(t.id));
    } else if (technicianId) {
      const techAssignments = db.repairAssignments
        .filter(
          (a) =>
            a.shopId === req.shopId &&
            a.technicianUserId === technicianId &&
            a.unassignedAt === null
        )
        .map((a) => a.repairTicketId);

      tickets = tickets.filter((t) => techAssignments.includes(t.id));
    }

    if (status) {
      tickets = tickets.filter((t) => t.status === status);
    }

    if (priority) {
      tickets = tickets.filter((t) => t.priority === priority);
    }

    if (q) {
      const search = (q as string).toLowerCase().trim();
      tickets = tickets.filter((t) => {
        const customer = db.customers.find((c) => c.id === t.customerId);
        const device = db.devices.find((d) => d.id === t.deviceId);
        return (
          t.ticketNumber.toLowerCase().includes(search) ||
          customer?.fullName.toLowerCase().includes(search) ||
          customer?.phone.includes(search) ||
          device?.brand.toLowerCase().includes(search) ||
          device?.model.toLowerCase().includes(search)
        );
      });
    }

    // Sort by receivedAt descending
    tickets.sort((a, b) => b.receivedAt.getTime() - a.receivedAt.getTime());

    // Enrich with customer and device summary
    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 50;
    const startIndex = (pageNum - 1) * limitNum;
    const paginated = tickets.slice(startIndex, startIndex + limitNum);

    const enriched = paginated.map((t) => {
      const customer = db.customers.find((c) => c.id === t.customerId);
      const device = db.devices.find((d) => d.id === t.deviceId);
      const assignment = db.repairAssignments.find(
        (a) => a.repairTicketId === t.id && a.unassignedAt === null
      );
      const technician = assignment
        ? db.users.find((u) => u.id === assignment.technicianUserId)
        : null;

      // Calculate paid and balance
      const payments = db.payments.filter(
        (p) => p.repairTicketId === t.id && p.status === "recorded"
      );
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalCost = t.finalCost ?? t.estimatedCost ?? 0;
      const balance = Math.max(0, totalCost - totalPaid);

      return {
        ...t,
        customer: customer
          ? { id: customer.id, fullName: customer.fullName, phone: customer.phone }
          : null,
        device: device
          ? { id: device.id, brand: device.brand, model: device.model, deviceType: device.deviceType }
          : null,
        assignedTechnician: technician
          ? { id: technician.id, displayName: technician.displayName }
          : null,
        totalCost,
        totalPaid,
        balance,
      };
    });

    res.json({
      data: enriched,
      meta: {
        requestId: req.requestId,
        total: tickets.length,
        page: pageNum,
        limit: limitNum,
      },
    });
  } catch (err) {
    next(err);
  }
});

// Get repair ticket details
repairsRouter.get("/:id", (req: AuthRequest, res: Response, next) => {
  try {
    const ticket = db.repairTickets.find(
      (t) => (t.id === req.params.id || t.ticketNumber === req.params.id) && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    // Role-based visibility check for technicians
    if (req.role === UserRole.TECHNICIAN) {
      const isAssigned = db.repairAssignments.some(
        (a) =>
          a.repairTicketId === ticket.id &&
          a.technicianUserId === req.user!.id &&
          a.unassignedAt === null
      );
      if (!isAssigned) {
        return res.status(403).json({
          error: {
            code: "FORBIDDEN",
            message: "You can only view tickets assigned to you",
            requestId: req.requestId,
          },
        });
      }
    }

    const customer = db.customers.find((c) => c.id === ticket.customerId);
    const device = db.devices.find((d) => d.id === ticket.deviceId);
    const events = db.repairStatusEvents
      .filter((e) => e.repairTicketId === ticket.id)
      .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
      .map((e) => {
        const actor = db.users.find((u) => u.id === e.actorUserId);
        return {
          ...e,
          actorDisplayName: actor?.displayName || "System",
        };
      });

    const notes = db.repairNotes
      .filter((n) => n.repairTicketId === ticket.id)
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime())
      .map((n) => {
        const author = db.users.find((u) => u.id === n.authorUserId);
        return {
          ...n,
          authorDisplayName: author?.displayName || "Staff",
        };
      });

    const assignment = db.repairAssignments.find(
      (a) => a.repairTicketId === ticket.id && a.unassignedAt === null
    );
    const technician = assignment
      ? db.users.find((u) => u.id === assignment.technicianUserId)
      : null;

    const estimates = db.estimates
      .filter((e) => e.repairTicketId === ticket.id)
      .sort((a, b) => b.version - a.version);

    const payments = db.payments
      .filter((p) => p.repairTicketId === ticket.id)
      .sort((a, b) => b.recordedAt.getTime() - a.recordedAt.getTime());

    const totalPaid = payments
      .filter((p) => p.status === "recorded")
      .reduce((sum, p) => sum + p.amount, 0);

    const totalCost = ticket.finalCost ?? ticket.estimatedCost ?? 0;
    const balance = Math.max(0, totalCost - totalPaid);

    const warranty = db.warranties.find((w) => w.repairTicketId === ticket.id);
    const partUsages = db.repairPartUsages
      .filter((u) => u.repairTicketId === ticket.id)
      .map((u) => {
        const part = db.parts.find((p) => p.id === u.partId);
        return {
          ...u,
          partName: part?.name || "Unknown Part",
          partSku: part?.sku || "",
        };
      });

    res.json({
      data: {
        ...ticket,
        customer,
        device,
        assignedTechnician: technician
          ? { id: technician.id, displayName: technician.displayName }
          : null,
        events,
        notes,
        estimates,
        payments,
        totalPaid,
        balance,
        warranty,
        partUsages,
      },
      meta: { requestId: req.requestId },
    });
  } catch (err) {
    next(err);
  }
});

// Create repair ticket (Atomic Intake)
repairsRouter.post("/", async (req: AuthRequest, res: Response, next) => {
  try {
    const validated = createRepairTicketSchema.parse(req.body);
    const now = new Date();

    // 1. Resolve or create customer
    let customerId = validated.customerId;
    if (!customerId && validated.customer) {
      const normalizedPhone = normalizeEthiopianPhone(validated.customer.phone);
      let existingCustomer = db.customers.find(
        (c) => c.shopId === req.shopId && c.phone === normalizedPhone
      );

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        const newCustomer: CustomerEntity = {
          id: `cust_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          shopId: req.shopId!,
          fullName: validated.customer.fullName.trim(),
          phone: normalizedPhone,
          email: validated.customer.email || null,
          notes: null,
          createdBy: req.user!.id,
          createdAt: now,
          updatedAt: now,
        };
        db.customers.push(newCustomer);
        customerId = newCustomer.id;
      }
    }

    if (!customerId) {
      return res.status(400).json({
        error: {
          code: "CUSTOMER_REQUIRED",
          message: "Please select an existing customer or enter new customer details",
          requestId: req.requestId,
        },
      });
    }

    // 2. Resolve or create device
    let deviceId = validated.deviceId;
    if (!deviceId && validated.device) {
      const newDevice: DeviceEntity = {
        id: `dev_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        shopId: req.shopId!,
        customerId,
        deviceType: validated.device.deviceType,
        brand: validated.device.brand.trim(),
        model: validated.device.model.trim(),
        serialNumber: validated.device.serialNumber?.trim() || null,
        imei: validated.device.imei?.trim() || null,
        color: validated.device.color?.trim() || null,
        createdAt: now,
        updatedAt: now,
      };
      db.devices.push(newDevice);
      deviceId = newDevice.id;
    }

    if (!deviceId) {
      return res.status(400).json({
        error: {
          code: "DEVICE_REQUIRED",
          message: "Please select an existing device or enter device details",
          requestId: req.requestId,
        },
      });
    }

    // 3. Generate sequential collision-safe ticket number
    const ticketNumber = db.getNextTicketNumber(req.shopId!);
    const ticketId = `ticket_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

    const ticket: RepairTicketEntity = {
      id: ticketId,
      shopId: req.shopId!,
      ticketNumber,
      customerId,
      deviceId,
      reportedIssue: validated.reportedIssue.trim(),
      conditionOnIntake: validated.conditionOnIntake?.trim() || null,
      accessoriesReceived: validated.accessoriesReceived || [],
      status: RepairStatus.RECEIVED,
      priority: validated.priority || "normal",
      estimatedCost: validated.estimatedCost ?? null,
      finalCost: null,
      currency: "ETB",
      expectedCompletionAt: validated.expectedCompletionAt
        ? new Date(validated.expectedCompletionAt)
        : null,
      receivedAt: now,
      completedAt: null,
      collectedAt: null,
      createdBy: req.user!.id,
      createdAt: now,
      updatedAt: now,
    };

    db.repairTickets.push(ticket);

    // 4. Initial status event
    const statusEvent: RepairStatusEventEntity = {
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      repairTicketId: ticket.id,
      fromStatus: null,
      toStatus: RepairStatus.RECEIVED,
      reason: "Device intake recorded",
      actorUserId: req.user!.id,
      createdAt: now,
    };
    db.repairStatusEvents.push(statusEvent);

    // 5. Initial assignment if given
    if (validated.assignedTechnicianUserId) {
      const techMembership = db.memberships.find(
        (m) =>
          m.shopId === req.shopId &&
          m.userId === validated.assignedTechnicianUserId &&
          m.status === "active"
      );

      if (techMembership) {
        const assignment: RepairAssignmentEntity = {
          id: `assign_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          shopId: req.shopId!,
          repairTicketId: ticket.id,
          technicianUserId: validated.assignedTechnicianUserId,
          assignedBy: req.user!.id,
          assignedAt: now,
          unassignedAt: null,
        };
        db.repairAssignments.push(assignment);
      }
    }

    // 6. Optional SMS notification outbox
    const customer = db.customers.find((c) => c.id === customerId);
    if (validated.sendCustomerSms && customer?.phone) {
      const shop = db.shops.find((s) => s.id === req.shopId);
      const smsMessage = `FixFlow: We have received your device at ${shop?.name || "our shop"}. Tracking #: ${ticket.ticketNumber}. View status at ${config.webOrigin}/track`;

      const smsProvider = getSmsProvider();
      await smsProvider.send({
        to: customer.phone,
        message: smsMessage,
        idempotencyKey: `sms_intake_${ticket.id}`,
      });
    }

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "repair.created",
      entityType: "repair_ticket",
      entityId: ticket.id,
      requestId: req.requestId,
      metadata: { ticketNumber: ticket.ticketNumber },
    });

    res.status(201).json({ data: ticket, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// Transition status
repairsRouter.post("/:id/transitions", async (req: AuthRequest, res: Response, next) => {
  try {
    const validated = transitionStatusSchema.parse(req.body);
    const ticket = db.repairTickets.find(
      (t) => (t.id === req.params.id || t.ticketNumber === req.params.id) && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    // Validate lifecycle transition
    if (!isValidTransition(ticket.status, validated.toStatus)) {
      return res.status(400).json({
        error: {
          code: "INVALID_STATUS_TRANSITION",
          message: `Cannot transition repair from ${ticket.status} to ${validated.toStatus}`,
          requestId: req.requestId,
        },
      });
    }

    // If transitioning to COLLECTED, check balance and payment policy
    if (validated.toStatus === RepairStatus.COLLECTED) {
      const payments = db.payments.filter(
        (p) => p.repairTicketId === ticket.id && p.status === "recorded"
      );
      const totalPaid = payments.reduce((sum, p) => sum + p.amount, 0);
      const totalCost = ticket.finalCost ?? ticket.estimatedCost ?? 0;
      const balance = totalCost - totalPaid;

      if (balance > 0 && !validated.overrideCollectionWithoutPayment) {
        return res.status(400).json({
          error: {
            code: "UNPAID_BALANCE",
            message: `Cannot mark device as collected: outstanding balance of ${balance} ETB remaining. Record payment or provide manager override.`,
            requestId: req.requestId,
            outstandingBalance: balance,
          },
        });
      }

      ticket.collectedAt = new Date();
    }

    if (validated.toStatus === RepairStatus.COMPLETED) {
      ticket.completedAt = new Date();
    }

    const previousStatus = ticket.status;
    ticket.status = validated.toStatus;
    ticket.updatedAt = new Date();

    const statusEvent: RepairStatusEventEntity = {
      id: `event_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      repairTicketId: ticket.id,
      fromStatus: previousStatus,
      toStatus: validated.toStatus,
      reason: validated.reason || null,
      actorUserId: req.user!.id,
      createdAt: new Date(),
    };
    db.repairStatusEvents.push(statusEvent);

    // Send SMS on READY_FOR_PICKUP
    if (validated.toStatus === RepairStatus.READY_FOR_PICKUP) {
      const customer = db.customers.find((c) => c.id === ticket.customerId);
      const shop = db.shops.find((s) => s.id === req.shopId);
      if (customer?.phone) {
        const smsProvider = getSmsProvider();
        await smsProvider.send({
          to: customer.phone,
          message: `FixFlow: Your device (${ticket.ticketNumber}) is ready for pickup at ${shop?.name || "our shop"}!`,
          idempotencyKey: `sms_ready_${ticket.id}_${Date.now()}`,
        });
      }
    }

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "repair.status_transition",
      entityType: "repair_ticket",
      entityId: ticket.id,
      requestId: req.requestId,
      metadata: { from: previousStatus, to: validated.toStatus, reason: validated.reason },
    });

    res.json({ data: ticket, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// Assign technician
repairsRouter.post("/:id/assignments", requireRole([UserRole.OWNER, UserRole.MANAGER]), (req: AuthRequest, res: Response, next) => {
  try {
    const validated = assignTechnicianSchema.parse(req.body);
    const ticket = db.repairTickets.find(
      (t) => t.id === req.params.id && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    const techMembership = db.memberships.find(
      (m) =>
        m.shopId === req.shopId &&
        m.userId === validated.technicianUserId &&
        m.status === "active"
    );

    if (!techMembership) {
      return res.status(400).json({
        error: {
          code: "INVALID_TECHNICIAN",
          message: "The assigned technician is not an active team member of this shop",
          requestId: req.requestId,
        },
      });
    }

    const now = new Date();

    // Close any previous active assignments
    const activeAssignments = db.repairAssignments.filter(
      (a) => a.repairTicketId === ticket.id && a.unassignedAt === null
    );
    for (const a of activeAssignments) {
      a.unassignedAt = now;
    }

    const newAssignment: RepairAssignmentEntity = {
      id: `assign_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      repairTicketId: ticket.id,
      technicianUserId: validated.technicianUserId,
      assignedBy: req.user!.id,
      assignedAt: now,
      unassignedAt: null,
    };
    db.repairAssignments.push(newAssignment);

    logAuditEvent({
      shopId: req.shopId!,
      actorUserId: req.user!.id,
      action: "repair.assigned",
      entityType: "repair_ticket",
      entityId: ticket.id,
      requestId: req.requestId,
      metadata: { technicianUserId: validated.technicianUserId },
    });

    res.json({ data: newAssignment, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// Add work note
repairsRouter.post("/:id/notes", (req: AuthRequest, res: Response, next) => {
  try {
    const validated = createRepairNoteSchema.parse(req.body);
    const ticket = db.repairTickets.find(
      (t) => t.id === req.params.id && t.shopId === req.shopId
    );

    if (!ticket) {
      return res.status(404).json({
        error: { code: "NOT_FOUND", message: "Repair ticket not found", requestId: req.requestId },
      });
    }

    const note: RepairNoteEntity = {
      id: `note_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
      shopId: req.shopId!,
      repairTicketId: ticket.id,
      authorUserId: req.user!.id,
      noteType: validated.noteType,
      body: validated.body.trim(),
      createdAt: new Date(),
    };
    db.repairNotes.push(note);

    res.status(201).json({ data: note, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});
