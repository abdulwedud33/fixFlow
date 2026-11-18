import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { config } from "../config";
import { db } from "../db/store";
import { UserRole, MembershipStatus } from "@fixflow/contracts";

export interface AuthenticatedUser {
  id: string;
  email: string | null;
  phone: string | null;
  displayName: string;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
  shopId?: string;
  role?: UserRole;
  requestId?: string;
}

export function requestIdMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const reqId = req.headers["x-request-id"] as string || `req_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  req.requestId = reqId;
  res.setHeader("X-Request-Id", reqId);
  next();
}

export function authenticate(req: AuthRequest, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      error: {
        code: "UNAUTHORIZED",
        message: "Authentication required",
        requestId: req.requestId,
      },
    });
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = jwt.verify(token, config.jwtSecret) as {
      userId: string;
      shopId?: string;
    };

    const user = db.users.find((u) => u.id === payload.userId && u.isActive);
    if (!user) {
      return res.status(401).json({
        error: {
          code: "UNAUTHORIZED",
          message: "User not found or inactive",
          requestId: req.requestId,
        },
      });
    }

    req.user = {
      id: user.id,
      email: user.email,
      phone: user.phone,
      displayName: user.displayName,
    };

    // Determine target shop: header or token
    const requestedShopId = (req.headers["x-shop-id"] as string) || payload.shopId;
    if (requestedShopId) {
      const membership = db.memberships.find(
        (m) =>
          m.userId === user.id &&
          m.shopId === requestedShopId &&
          m.status === MembershipStatus.ACTIVE
      );

      if (membership) {
        req.shopId = membership.shopId;
        req.role = membership.role;
      }
    }

    // If still no shopId, pick the user's first active membership
    if (!req.shopId) {
      const defaultMembership = db.memberships.find(
        (m) => m.userId === user.id && m.status === MembershipStatus.ACTIVE
      );
      if (defaultMembership) {
        req.shopId = defaultMembership.shopId;
        req.role = defaultMembership.role;
      }
    }

    next();
  } catch (err) {
    return res.status(401).json({
      error: {
        code: "INVALID_TOKEN",
        message: "Invalid or expired session token",
        requestId: req.requestId,
      },
    });
  }
}

export function requireTenant(req: AuthRequest, res: Response, next: NextFunction) {
  if (!req.shopId || !req.role) {
    return res.status(403).json({
      error: {
        code: "NO_ACTIVE_SHOP",
        message: "No active shop membership found for this user",
        requestId: req.requestId,
      },
    });
  }
  next();
}

export function requireRole(allowedRoles: UserRole[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.role || !allowedRoles.includes(req.role)) {
      return res.status(403).json({
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
          requestId: req.requestId,
        },
      });
    }
    next();
  };
}

// Centralized Safe Error Handler
export function errorHandler(
  err: any,
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  const reqId = req.requestId || "req_unknown";

  // Check if it's a Zod validation error
  if (err.name === "ZodError" && err.errors) {
    const fieldErrors: Record<string, string> = {};
    for (const sub of err.errors) {
      const path = sub.path.join(".");
      fieldErrors[path] = sub.message;
    }
    return res.status(400).json({
      error: {
        code: "VALIDATION_ERROR",
        message: "Please check the highlighted fields",
        fieldErrors,
        requestId: reqId,
      },
    });
  }

  // General safe error response (NEVER leak stack traces or raw DB errors)
  const statusCode = err.statusCode || 500;
  const safeMessage =
    statusCode < 500
      ? err.message || "Request could not be processed"
      : "An unexpected error occurred. Please try again later.";

  res.status(statusCode).json({
    error: {
      code: err.code || "INTERNAL_ERROR",
      message: safeMessage,
      requestId: reqId,
    },
  });
}
