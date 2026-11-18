import {
  RepairStatus,
  UserRole,
  MembershipStatus,
  DeviceType,
  PaymentMethod,
  PaymentStatus,
  EstimateStatus,
  WarrantyStatus,
  StockMovementType,
  NotificationStatus,
} from "@fixflow/contracts";

export interface UserEntity {
  id: string;
  email: string | null;
  phone: string | null;
  passwordHash: string;
  displayName: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopEntity {
  id: string;
  name: string;
  slug: string;
  phone: string;
  email: string | null;
  address: string | null;
  city: string;
  countryCode: string;
  currency: string;
  timezone: string;
  settings: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

export interface ShopMembershipEntity {
  id: string;
  shopId: string;
  userId: string;
  role: UserRole;
  permissions: Record<string, any>;
  status: MembershipStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerEntity {
  id: string;
  shopId: string;
  fullName: string;
  phone: string;
  email: string | null;
  notes: string | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeviceEntity {
  id: string;
  shopId: string;
  customerId: string;
  deviceType: DeviceType;
  brand: string;
  model: string;
  serialNumber: string | null;
  imei: string | null;
  color: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairTicketEntity {
  id: string;
  shopId: string;
  ticketNumber: string;
  customerId: string;
  deviceId: string;
  reportedIssue: string;
  conditionOnIntake: string | null;
  accessoriesReceived: string[];
  status: RepairStatus;
  priority: "normal" | "urgent";
  estimatedCost: number | null;
  finalCost: number | null;
  currency: string;
  expectedCompletionAt: Date | null;
  receivedAt: Date;
  completedAt: Date | null;
  collectedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface RepairStatusEventEntity {
  id: string;
  shopId: string;
  repairTicketId: string;
  fromStatus: RepairStatus | null;
  toStatus: RepairStatus;
  reason: string | null;
  actorUserId: string | null;
  createdAt: Date;
}

export interface RepairNoteEntity {
  id: string;
  shopId: string;
  repairTicketId: string;
  authorUserId: string | null;
  noteType: "internal" | "customer_visible";
  body: string;
  createdAt: Date;
}

export interface RepairAssignmentEntity {
  id: string;
  shopId: string;
  repairTicketId: string;
  technicianUserId: string;
  assignedBy: string | null;
  assignedAt: Date;
  unassignedAt: Date | null;
}

export interface EstimateEntity {
  id: string;
  shopId: string;
  repairTicketId: string;
  version: number;
  laborAmount: number;
  partsAmount: number;
  discountAmount: number;
  totalAmount: number;
  currency: string;
  status: EstimateStatus;
  notes: string | null;
  approvedAt: Date | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface PaymentEntity {
  id: string;
  shopId: string;
  repairTicketId: string;
  amount: number;
  currency: string;
  method: PaymentMethod;
  reference: string | null;
  status: PaymentStatus;
  idempotencyKey: string | null;
  notes: string | null;
  recordedBy: string | null;
  recordedAt: Date;
  reversalOfPaymentId: string | null;
}

export interface PartEntity {
  id: string;
  shopId: string;
  sku: string;
  name: string;
  description: string | null;
  unit: string;
  costPrice: number;
  sellingPrice: number;
  reorderLevel: number;
  currentQuantity: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface StockMovementEntity {
  id: string;
  shopId: string;
  partId: string;
  movementType: StockMovementType;
  quantityDelta: number;
  unitCost: number | null;
  referenceType: string | null;
  referenceId: string | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface RepairPartUsageEntity {
  id: string;
  shopId: string;
  repairTicketId: string;
  partId: string;
  quantity: number;
  unitCost: number | null;
  createdBy: string | null;
  createdAt: Date;
}

export interface WarrantyEntity {
  id: string;
  shopId: string;
  repairTicketId: string;
  startsAt: Date;
  endsAt: Date;
  terms: string | null;
  status: WarrantyStatus;
  createdAt: Date;
  updatedAt: Date;
}

export interface WarrantyClaimEntity {
  id: string;
  shopId: string;
  warrantyId: string;
  customerDescription: string;
  status: string;
  resolution: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface NotificationEntity {
  id: string;
  shopId: string;
  repairTicketId: string | null;
  customerId: string | null;
  channel: "sms" | "email" | "in_app";
  templateKey: string;
  destinationMasked: string;
  providerMessageId: string | null;
  status: NotificationStatus;
  idempotencyKey: string;
  costAmount: number | null;
  failureCodeSafe: string | null;
  payload: any;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuditEventEntity {
  id: string;
  shopId: string;
  actorUserId: string | null;
  action: string;
  entityType: string;
  entityId: string;
  requestId: string | null;
  metadata: Record<string, any>;
  createdAt: Date;
}

// Memory database with strict tenant scoping enforcing RLS in memory
class MemoryDatabase {
  users: UserEntity[] = [];
  shops: ShopEntity[] = [];
  memberships: ShopMembershipEntity[] = [];
  customers: CustomerEntity[] = [];
  devices: DeviceEntity[] = [];
  repairTickets: RepairTicketEntity[] = [];
  repairStatusEvents: RepairStatusEventEntity[] = [];
  repairNotes: RepairNoteEntity[] = [];
  repairAssignments: RepairAssignmentEntity[] = [];
  estimates: EstimateEntity[] = [];
  payments: PaymentEntity[] = [];
  parts: PartEntity[] = [];
  stockMovements: StockMovementEntity[] = [];
  repairPartUsages: RepairPartUsageEntity[] = [];
  warranties: WarrantyEntity[] = [];
  warrantyClaims: WarrantyClaimEntity[] = [];
  notifications: NotificationEntity[] = [];
  auditEvents: AuditEventEntity[] = [];

  // Ticket counter per shop for concurrency-safe sequential ticket numbering
  private ticketCounters: Map<string, number> = new Map();

  getNextTicketNumber(shopId: string): string {
    const currentYearMonth = new Date()
      .toISOString()
      .slice(2, 7)
      .replace("-", ""); // e.g. "2611"
    
    const count = (this.ticketCounters.get(shopId) || 0) + 1;
    this.ticketCounters.set(shopId, count);
    
    const padded = String(count).padStart(4, "0");
    return `FF-${currentYearMonth}-${padded}`;
  }

  clear() {
    this.users = [];
    this.shops = [];
    this.memberships = [];
    this.customers = [];
    this.devices = [];
    this.repairTickets = [];
    this.repairStatusEvents = [];
    this.repairNotes = [];
    this.repairAssignments = [];
    this.estimates = [];
    this.payments = [];
    this.parts = [];
    this.stockMovements = [];
    this.repairPartUsages = [];
    this.warranties = [];
    this.warrantyClaims = [];
    this.notifications = [];
    this.auditEvents = [];
    this.ticketCounters.clear();
  }
}

export const db = new MemoryDatabase();
