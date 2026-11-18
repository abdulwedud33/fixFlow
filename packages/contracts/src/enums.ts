export const UserRole = {
  OWNER: "owner",
  MANAGER: "manager",
  RECEPTIONIST: "receptionist",
  TECHNICIAN: "technician",
} as const;
export type UserRole = (typeof UserRole)[keyof typeof UserRole];

export const MembershipStatus = {
  INVITED: "invited",
  ACTIVE: "active",
  SUSPENDED: "suspended",
  REMOVED: "removed",
} as const;
export type MembershipStatus = (typeof MembershipStatus)[keyof typeof MembershipStatus];

export const RepairStatus = {
  RECEIVED: "RECEIVED",
  DIAGNOSING: "DIAGNOSING",
  WAITING_FOR_APPROVAL: "WAITING_FOR_APPROVAL",
  WAITING_FOR_PARTS: "WAITING_FOR_PARTS",
  IN_PROGRESS: "IN_PROGRESS",
  COMPLETED: "COMPLETED",
  READY_FOR_PICKUP: "READY_FOR_PICKUP",
  COLLECTED: "COLLECTED",
  CANCELLED: "CANCELLED",
} as const;
export type RepairStatus = (typeof RepairStatus)[keyof typeof RepairStatus];

export const RepairPriority = {
  NORMAL: "normal",
  URGENT: "urgent",
} as const;
export type RepairPriority = (typeof RepairPriority)[keyof typeof RepairPriority];

export const DeviceType = {
  PHONE: "phone",
  LAPTOP: "laptop",
  TABLET: "tablet",
  DESKTOP: "desktop",
  APPLIANCE: "appliance",
  OTHER: "other",
} as const;
export type DeviceType = (typeof DeviceType)[keyof typeof DeviceType];

export const NoteType = {
  INTERNAL: "internal",
  CUSTOMER_VISIBLE: "customer_visible",
} as const;
export type NoteType = (typeof NoteType)[keyof typeof NoteType];

export const PaymentMethod = {
  CASH: "cash",
  BANK_TRANSFER: "bank_transfer",
  MOBILE_MONEY: "mobile_money",
  CARD: "card",
  OTHER: "other",
} as const;
export type PaymentMethod = (typeof PaymentMethod)[keyof typeof PaymentMethod];

export const PaymentStatus = {
  RECORDED: "recorded",
  REVERSED: "reversed",
  REFUNDED: "refunded",
} as const;
export type PaymentStatus = (typeof PaymentStatus)[keyof typeof PaymentStatus];

export const EstimateStatus = {
  DRAFT: "draft",
  SENT: "sent",
  APPROVED: "approved",
  REJECTED: "rejected",
  SUPERSEDED: "superseded",
} as const;
export type EstimateStatus = (typeof EstimateStatus)[keyof typeof EstimateStatus];

export const WarrantyStatus = {
  ACTIVE: "active",
  CLAIMED: "claimed",
  EXPIRED: "expired",
  VOIDED: "voided",
} as const;
export type WarrantyStatus = (typeof WarrantyStatus)[keyof typeof WarrantyStatus];

export const StockMovementType = {
  PURCHASE: "purchase",
  REPAIR_USAGE: "repair_usage",
  ADJUSTMENT: "adjustment",
  RETURN: "return",
} as const;
export type StockMovementType = (typeof StockMovementType)[keyof typeof StockMovementType];

export const NotificationChannel = {
  SMS: "sms",
  EMAIL: "email",
  IN_APP: "in_app",
} as const;
export type NotificationChannel = (typeof NotificationChannel)[keyof typeof NotificationChannel];

export const NotificationStatus = {
  QUEUED: "queued",
  SENT: "sent",
  DELIVERED: "delivered",
  FAILED: "failed",
  UNKNOWN: "unknown",
  CANCELLED: "cancelled",
} as const;
export type NotificationStatus = (typeof NotificationStatus)[keyof typeof NotificationStatus];
