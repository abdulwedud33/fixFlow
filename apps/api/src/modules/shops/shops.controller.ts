import { Router, Response } from "express";
import { authenticate, requireTenant, requireRole, AuthRequest } from "../../middleware/auth";
import { db, ShopMembershipEntity } from "../../db/store";
import { updateShopSchema, inviteStaffSchema, UserRole, MembershipStatus, normalizeEthiopianPhone } from "@fixflow/contracts";
import { logAuditEvent } from "../audit/audit.service";
import bcrypt from "bcryptjs";

export const shopsRouter = Router();

shopsRouter.use(authenticate, requireTenant);

// Get current shop profile
shopsRouter.get("/current", (req: AuthRequest, res: Response, next) => {
  try {
    const shop = db.shops.find((s) => s.id === req.shopId);
    if (!shop) {
      return res.status(404).json({ error: { code: "NOT_FOUND", message: "Shop not found" } });
    }
    res.json({ data: shop, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// Update shop profile (Owners and Managers only)
shopsRouter.patch(
  "/current",
  requireRole([UserRole.OWNER, UserRole.MANAGER]),
  (req: AuthRequest, res: Response, next) => {
    try {
      const validated = updateShopSchema.parse(req.body);
      const shop = db.shops.find((s) => s.id === req.shopId);
      if (!shop) {
        return res.status(404).json({ error: { code: "NOT_FOUND", message: "Shop not found" } });
      }

      shop.name = validated.name.trim();
      shop.phone = normalizeEthiopianPhone(validated.phone);
      if (validated.email !== undefined) shop.email = validated.email || null;
      if (validated.address !== undefined) shop.address = validated.address || null;
      if (validated.city !== undefined) shop.city = validated.city || "Addis Ababa";
      if (validated.settings) {
        shop.settings = { ...shop.settings, ...validated.settings };
      }
      shop.updatedAt = new Date();

      logAuditEvent({
        shopId: req.shopId!,
        actorUserId: req.user!.id,
        action: "shop.updated",
        entityType: "shop",
        entityId: shop.id,
        requestId: req.requestId,
      });

      res.json({ data: shop, meta: { requestId: req.requestId } });
    } catch (err) {
      next(err);
    }
  }
);

// List team members
shopsRouter.get("/team", (req: AuthRequest, res: Response, next) => {
  try {
    const memberships = db.memberships.filter((m) => m.shopId === req.shopId);
    const members = memberships.map((m) => {
      const user = db.users.find((u) => u.id === m.userId);
      return {
        id: m.id,
        userId: m.userId,
        displayName: user?.displayName || "Unknown",
        email: user?.email,
        phone: user?.phone,
        role: m.role,
        status: m.status,
        createdAt: m.createdAt,
      };
    });

    res.json({ data: members, meta: { requestId: req.requestId } });
  } catch (err) {
    next(err);
  }
});

// Invite / add staff member (Owner only)
shopsRouter.post(
  "/team/invite",
  requireRole([UserRole.OWNER]),
  async (req: AuthRequest, res: Response, next) => {
    try {
      const validated = inviteStaffSchema.parse(req.body);
      const normalizedPhone = normalizeEthiopianPhone(validated.phone);

      let user = db.users.find((u) => u.phone === normalizedPhone);
      if (!user) {
        // Create user with default temporary password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash("FixFlow@2026", salt);
        user = {
          id: `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
          email: validated.email?.trim().toLowerCase() || null,
          phone: normalizedPhone,
          passwordHash,
          displayName: validated.displayName.trim(),
          isActive: true,
          createdAt: new Date(),
          updatedAt: new Date(),
        };
        db.users.push(user);
      }

      // Check if already member
      const existingMembership = db.memberships.find(
        (m) => m.shopId === req.shopId && m.userId === user!.id
      );

      if (existingMembership) {
        return res.status(409).json({
          error: {
            code: "ALREADY_MEMBER",
            message: "This user is already a member of this shop",
            requestId: req.requestId,
          },
        });
      }

      const membership: ShopMembershipEntity = {
        id: `memb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`,
        shopId: req.shopId!,
        userId: user.id,
        role: validated.role,
        permissions: {},
        status: MembershipStatus.ACTIVE,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      db.memberships.push(membership);

      logAuditEvent({
        shopId: req.shopId!,
        actorUserId: req.user!.id,
        action: "team.member_invited",
        entityType: "shop_membership",
        entityId: membership.id,
        requestId: req.requestId,
        metadata: { role: validated.role, phone: normalizedPhone },
      });

      res.status(201).json({
        data: {
          id: membership.id,
          userId: user.id,
          displayName: user.displayName,
          phone: user.phone,
          role: membership.role,
          status: membership.status,
        },
        meta: { requestId: req.requestId },
      });
    } catch (err) {
      next(err);
    }
  }
);
