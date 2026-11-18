import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { config } from "./config";
import { requestIdMiddleware, errorHandler } from "./middleware/auth";
import { authRouter } from "./modules/auth/auth.controller";
import { shopsRouter } from "./modules/shops/shops.controller";
import { customersRouter } from "./modules/customers/customers.controller";
import { devicesRouter } from "./modules/devices/devices.controller";
import { repairsRouter } from "./modules/repairs/repairs.controller";
import { paymentsRouter } from "./modules/payments/payments.controller";
import { inventoryRouter } from "./modules/inventory/inventory.controller";
import { warrantiesRouter } from "./modules/warranties/warranties.controller";
import { trackingRouter } from "./modules/tracking/tracking.controller";
import { dashboardRouter } from "./modules/dashboard/dashboard.controller";

export const app = express();

// Security HTTP headers
app.use(helmet());

// CORS configuration
app.use(
  cors({
    origin: [config.webOrigin, "http://localhost:3000", "http://localhost:3001"],
    credentials: true,
  })
);

// Payload size limit
app.use(express.json({ limit: "1mb" }));

// Request ID middleware
app.use(requestIdMiddleware);

// Standard API rate limiter (100 requests per minute)
const standardApiLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: 100,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: {
      code: "RATE_LIMIT_EXCEEDED",
      message: "Too many requests. Please slow down.",
    },
  },
});

app.use("/api/v1", standardApiLimiter);

// Health check endpoint
app.get("/api/v1/health", (req, res) => {
  res.json({
    status: "ok",
    app: "FixFlow API",
    version: "1.0.0",
    time: new Date().toISOString(),
  });
});

// Public Domain Routes (Unauthenticated)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/tracking", trackingRouter);

// Authenticated Domain Routes
app.use("/api/v1/shops", shopsRouter);
app.use("/api/v1/customers", customersRouter);
app.use("/api/v1/devices", devicesRouter);
app.use("/api/v1/repairs", repairsRouter);
app.use("/api/v1", paymentsRouter);
app.use("/api/v1/inventory", inventoryRouter);
app.use("/api/v1/warranties", warrantiesRouter);
app.use("/api/v1/dashboard", dashboardRouter);

// Centralized Safe Error Handling Middleware
app.use(errorHandler);

// Start server if run directly
if (process.env.NODE_ENV !== "test") {
  app.listen(config.port, () => {
    console.log(`FixFlow API Server listening on port ${config.port} [${config.nodeEnv}]`);
  });
}
