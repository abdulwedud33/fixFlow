import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { config } from "../../config";
import { db, UserEntity, ShopEntity, ShopMembershipEntity } from "../../db/store";
import {
  RegisterInput,
  LoginInput,
  InviteStaffInput,
  UserRole,
  MembershipStatus,
  normalizeEthiopianPhone,
} from "@fixflow/contracts";
import { logAuditEvent } from "../audit/audit.service";

export async function registerUserAndShop(input: RegisterInput, requestId?: string) {
  const normalizedPhone = normalizeEthiopianPhone(input.phone);

  // Check unique phone
  const existingPhone = db.users.find((u) => u.phone === normalizedPhone);
  if (existingPhone) {
    const error: any = new Error("A user with this phone number already exists");
    error.statusCode = 409;
    error.code = "PHONE_EXISTS";
    throw error;
  }

  // Check unique email if provided
  if (input.email) {
    const existingEmail = db.users.find(
      (u) => u.email?.toLowerCase() === input.email?.toLowerCase()
    );
    if (existingEmail) {
      const error: any = new Error("A user with this email already exists");
      error.statusCode = 409;
      error.code = "EMAIL_EXISTS";
      throw error;
    }
  }

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash(input.password, salt);

  const userId = `user_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const shopId = `shop_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
  const membershipId = `memb_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;

  const slug = input.shopName
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .substring(0, 50) + `-${Math.random().toString(36).substring(2, 6)}`;

  const now = new Date();

  const user: UserEntity = {
    id: userId,
    email: input.email?.trim().toLowerCase() || null,
    phone: normalizedPhone,
    passwordHash,
    displayName: input.displayName.trim(),
    isActive: true,
    createdAt: now,
    updatedAt: now,
  };

  const shop: ShopEntity = {
    id: shopId,
    name: input.shopName.trim(),
    slug,
    phone: normalizedPhone,
    email: input.email?.trim().toLowerCase() || null,
    address: null,
    city: input.shopCity || "Addis Ababa",
    countryCode: "ET",
    currency: "ETB",
    timezone: "Africa/Addis_Ababa",
    settings: {
      receiptFooterText: "Thank you for choosing us for your device repairs!",
      termsAndConditions: "30-day service warranty on parts replaced. Physical damage or liquid ingress voids warranty.",
      smsEnabled: true,
    },
    createdAt: now,
    updatedAt: now,
  };

  const membership: ShopMembershipEntity = {
    id: membershipId,
    shopId,
    userId,
    role: UserRole.OWNER,
    permissions: { all: true },
    status: MembershipStatus.ACTIVE,
    createdAt: now,
    updatedAt: now,
  };

  db.users.push(user);
  db.shops.push(shop);
  db.memberships.push(membership);

  logAuditEvent({
    shopId,
    actorUserId: userId,
    action: "shop.created",
    entityType: "shop",
    entityId: shopId,
    requestId,
    metadata: { shopName: shop.name },
  });

  const token = jwt.sign(
    { userId: user.id, shopId: shop.id },
    config.jwtSecret,
    { expiresIn: "7d" }
  );

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
    },
    shop: {
      id: shop.id,
      name: shop.name,
      slug: shop.slug,
      role: membership.role,
    },
    token,
  };
}

export async function loginUser(input: LoginInput, requestId?: string) {
  const normalizedIdentifier = input.identifier.trim();
  const normalizedPhone = normalizeEthiopianPhone(normalizedIdentifier);

  const user = db.users.find(
    (u) =>
      u.isActive &&
      (u.phone === normalizedPhone ||
        u.email?.toLowerCase() === normalizedIdentifier.toLowerCase())
  );

  if (!user) {
    const error: any = new Error("Invalid phone/email or password");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  const isMatch = await bcrypt.compare(input.password, user.passwordHash);
  if (!isMatch) {
    const error: any = new Error("Invalid phone/email or password");
    error.statusCode = 401;
    error.code = "INVALID_CREDENTIALS";
    throw error;
  }

  // Find active memberships
  const memberships = db.memberships.filter(
    (m) => m.userId === user.id && m.status === MembershipStatus.ACTIVE
  );

  if (memberships.length === 0) {
    const error: any = new Error("Your account has no active shop memberships");
    error.statusCode = 403;
    error.code = "NO_MEMBERSHIP";
    throw error;
  }

  const primaryMembership = memberships[0];
  const primaryShop = db.shops.find((s) => s.id === primaryMembership.shopId)!;

  const token = jwt.sign(
    { userId: user.id, shopId: primaryShop.id },
    config.jwtSecret,
    { expiresIn: "7d" }
  );

  logAuditEvent({
    shopId: primaryShop.id,
    actorUserId: user.id,
    action: "auth.login",
    entityType: "user",
    entityId: user.id,
    requestId,
  });

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
    },
    shop: {
      id: primaryShop.id,
      name: primaryShop.name,
      slug: primaryShop.slug,
      role: primaryMembership.role,
    },
    token,
  };
}

export function getCurrentUser(userId: string, activeShopId?: string) {
  const user = db.users.find((u) => u.id === userId && u.isActive);
  if (!user) {
    const error: any = new Error("User not found");
    error.statusCode = 404;
    throw error;
  }

  const memberships = db.memberships
    .filter((m) => m.userId === user.id && m.status === MembershipStatus.ACTIVE)
    .map((m) => {
      const shop = db.shops.find((s) => s.id === m.shopId);
      return {
        membershipId: m.id,
        shopId: m.shopId,
        shopName: shop?.name || "Shop",
        role: m.role,
      };
    });

  const activeMembership = activeShopId
    ? memberships.find((m) => m.shopId === activeShopId) || memberships[0]
    : memberships[0];

  return {
    user: {
      id: user.id,
      displayName: user.displayName,
      email: user.email,
      phone: user.phone,
    },
    activeShop: activeMembership
      ? {
          id: activeMembership.shopId,
          name: activeMembership.shopName,
          role: activeMembership.role,
        }
      : null,
    memberships,
  };
}
