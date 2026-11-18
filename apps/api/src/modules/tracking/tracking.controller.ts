import { Router, Request, Response, NextFunction } from "express";
import { trackRepairQuerySchema, PublicRepairStatus } from "@fixflow/contracts";
import { db } from "../../db/store";
import rateLimit from "express-rate-limit";

export const trackingRouter = Router();

// Strict public rate limiter: max 15 requests per 15 minutes per IP
const publicTrackingLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 15,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many tracking lookups from this device. Please wait a few minutes before trying again.",
    },
  },
});

trackingRouter.use(publicTrackingLimiter);

trackingRouter.post("/", (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = trackRepairQuerySchema.parse(req.body);
    const normalizedTicketNumber = validated.ticketNumber.trim().toUpperCase();

    // Find ticket by human-readable number
    const ticket = db.repairTickets.find(
      (t) => t.ticketNumber.toUpperCase() === normalizedTicketNumber
    );

    if (!ticket) {
      return res.status(404).json({
        error: {
          code: "TRACKING_NOT_FOUND",
          message: "No repair found with this tracking number and phone combination.",
        },
      });
    }

    // Verify phoneLast4 against the customer's phone
    const customer = db.customers.find((c) => c.id === ticket.customerId);
    if (!customer || !customer.phone.endsWith(validated.phoneLast4)) {
      return res.status(404).json({
        error: {
          code: "TRACKING_NOT_FOUND",
          message: "No repair found with this tracking number and phone combination.",
        },
      });
    }

    const device = db.devices.find((d) => d.id === ticket.deviceId);
    const shop = db.shops.find((s) => s.id === ticket.shopId);

    // Only customer-visible notes
    const publicNotes = db.repairNotes
      .filter((n) => n.repairTicketId === ticket.id && n.noteType === "customer_visible")
      .map((n) => ({
        body: n.body,
        createdAt: n.createdAt.toISOString(),
      }));

    const sanitizedResponse: PublicRepairStatus = {
      ticketNumber: ticket.ticketNumber,
      status: ticket.status,
      deviceSummary: device
        ? `${device.brand} ${device.model}${device.color ? ` (${device.color})` : ""}`
        : "Device",
      receivedAt: ticket.receivedAt.toISOString(),
      expectedCompletionAt: ticket.expectedCompletionAt
        ? ticket.expectedCompletionAt.toISOString()
        : null,
      completedAt: ticket.completedAt ? ticket.completedAt.toISOString() : null,
      shopName: shop?.name || "Repair Shop",
      shopPhone: shop?.phone || "",
      shopAddress: shop?.address || undefined,
      publicNotes,
    };

    res.json({ data: sanitizedResponse });
  } catch (err) {
    next(err);
  }
});
