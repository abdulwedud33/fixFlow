import bcrypt from "bcryptjs";
import { db } from "./store";
import {
  UserRole,
  MembershipStatus,
  DeviceType,
  RepairStatus,
  RepairPriority,
  PaymentMethod,
  StockMovementType,
} from "@fixflow/contracts";

export async function seedDatabaseIfEmpty() {
  if (db.users.length > 0) return;

  const now = new Date();
  const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
  const threeDaysAgo = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);

  // 1. Password hash for demo users
  const salt = await bcrypt.genSalt(10);
  const passwordHash = await bcrypt.hash("Password123!", salt);

  // 2. Demo Shop Owner User (Supports both owner@example.com and abebe@fixflow.et and 0911223344)
  const ownerUser = {
    id: "user_owner_abebe",
    displayName: "Abebe Kebede",
    phone: "+251911223344",
    email: "owner@example.com",
    passwordHash,
    isActive: true,
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
  };

  const techUser = {
    id: "user_tech_dawit",
    displayName: "Dawit Haile",
    phone: "+251922334455",
    email: "dawit@fixflow.et",
    passwordHash,
    isActive: true,
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
  };

  db.users.push(ownerUser, techUser);

  // 3. Shop
  const shop = {
    id: "shop_abebe_care",
    name: "Addis Precision Repair",
    slug: "addis-precision-repair",
    phone: "+251911223344",
    email: "owner@example.com",
    address: "Bole Medhanialem, Edna Mall Area, Shop #104",
    city: "Addis Ababa",
    countryCode: "ET",
    currency: "ETB",
    timezone: "Africa/Addis_Ababa",
    settings: {
      receiptFooterText: "Thank you for choosing Addis Precision Repair for your device repairs!",
      termsAndConditions: "30-day service warranty on hardware repairs. Water damage voids warranty.",
      smsEnabled: true,
    },
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
  };
  db.shops.push(shop);

  // 4. Memberships
  db.memberships.push(
    {
      id: "memb_owner",
      shopId: shop.id,
      userId: ownerUser.id,
      role: UserRole.OWNER,
      permissions: { all: true },
      status: MembershipStatus.ACTIVE,
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    },
    {
      id: "memb_tech",
      shopId: shop.id,
      userId: techUser.id,
      role: UserRole.TECHNICIAN,
      permissions: {},
      status: MembershipStatus.ACTIVE,
      createdAt: threeDaysAgo,
      updatedAt: threeDaysAgo,
    }
  );

  // 5. Customers
  const customer1 = {
    id: "cust_almaz",
    shopId: shop.id,
    fullName: "Almaz Bekele",
    phone: "+251912345678",
    email: "almaz@gmail.com",
    notes: "Prefers updates via SMS",
    createdBy: ownerUser.id,
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
  };

  const customer2 = {
    id: "cust_solomon",
    shopId: shop.id,
    fullName: "Solomon Tadesse",
    phone: "+251933445566",
    email: "solomon@gmail.com",
    notes: "Regular client from Kazanchis",
    createdBy: ownerUser.id,
    createdAt: yesterday,
    updatedAt: yesterday,
  };
  db.customers.push(customer1, customer2);

  // 6. Devices
  const device1 = {
    id: "dev_samsung_a54",
    shopId: shop.id,
    customerId: customer1.id,
    deviceType: DeviceType.PHONE,
    brand: "Samsung",
    model: "Galaxy A54",
    serialNumber: null,
    imei: "354892019482710",
    color: "Awesome Graphite",
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
  };

  const device2 = {
    id: "dev_iphone_13",
    shopId: shop.id,
    customerId: customer2.id,
    deviceType: DeviceType.PHONE,
    brand: "Apple",
    model: "iPhone 13",
    serialNumber: "C39ZX802N",
    imei: null,
    color: "Midnight Blue",
    createdAt: yesterday,
    updatedAt: yesterday,
  };
  db.devices.push(device1, device2);

  // 7. Inventory Parts
  const part1 = {
    id: "part_screen_a54",
    shopId: shop.id,
    sku: "SCR-SAM-A54",
    name: "Samsung A54 Super AMOLED Display",
    description: "Original service pack replacement display",
    unit: "pcs",
    costPrice: 2800,
    sellingPrice: 4200,
    reorderLevel: 2,
    currentQuantity: 5,
    isActive: true,
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
  };

  const part2 = {
    id: "part_battery_ip13",
    shopId: shop.id,
    sku: "BAT-APP-IP13",
    name: "iPhone 13 3227mAh Battery Cell",
    description: "OEM high capacity replacement cell",
    unit: "pcs",
    costPrice: 950,
    sellingPrice: 1800,
    reorderLevel: 3,
    currentQuantity: 1, // Triggers low stock alert
    isActive: true,
    createdAt: threeDaysAgo,
    updatedAt: threeDaysAgo,
  };
  db.parts.push(part1, part2);

  // 8. Repair Tickets
  const ticket1 = {
    id: "ticket_001",
    shopId: shop.id,
    ticketNumber: "FF-2611-0001",
    customerId: customer1.id,
    deviceId: device1.id,
    reportedIssue: "Screen shattered after drop; touch digitizer unresponsive",
    conditionOnIntake: "Heavy glass cracking; bezel dented at bottom left",
    accessoriesReceived: ["Phone Case", "SIM Tray"],
    status: RepairStatus.READY_FOR_PICKUP,
    priority: RepairPriority.NORMAL,
    estimatedCost: 4500,
    finalCost: 4500,
    currency: "ETB",
    expectedCompletionAt: yesterday,
    receivedAt: threeDaysAgo,
    completedAt: yesterday,
    collectedAt: null,
    createdBy: ownerUser.id,
    createdAt: threeDaysAgo,
    updatedAt: yesterday,
  };

  const ticket2 = {
    id: "ticket_002",
    shopId: shop.id,
    ticketNumber: "FF-2611-0002",
    customerId: customer2.id,
    deviceId: device2.id,
    reportedIssue: "Battery drains rapidly; shuts down at 20%",
    conditionOnIntake: "Clean cosmetic condition; battery health shows 71%",
    accessoriesReceived: ["Charger"],
    status: RepairStatus.IN_PROGRESS,
    priority: RepairPriority.URGENT,
    estimatedCost: 2000,
    finalCost: null,
    currency: "ETB",
    expectedCompletionAt: new Date(now.getTime() + 4 * 60 * 60 * 1000),
    receivedAt: yesterday,
    completedAt: null,
    collectedAt: null,
    createdBy: ownerUser.id,
    createdAt: yesterday,
    updatedAt: now,
  };
  db.repairTickets.push(ticket1, ticket2);

  // 9. Assignments & Notes
  db.repairAssignments.push(
    {
      id: "assign_1",
      shopId: shop.id,
      repairTicketId: ticket1.id,
      technicianUserId: techUser.id,
      assignedBy: ownerUser.id,
      assignedAt: threeDaysAgo,
      unassignedAt: null,
    },
    {
      id: "assign_2",
      shopId: shop.id,
      repairTicketId: ticket2.id,
      technicianUserId: techUser.id,
      assignedBy: ownerUser.id,
      assignedAt: yesterday,
      unassignedAt: null,
    }
  );

  db.repairNotes.push(
    {
      id: "note_1",
      shopId: shop.id,
      repairTicketId: ticket1.id,
      authorUserId: techUser.id,
      noteType: "internal",
      body: "Replaced AMOLED assembly. Calibrated touch digitizer. Tested charging.",
      createdAt: yesterday,
    },
    {
      id: "note_2",
      shopId: shop.id,
      repairTicketId: ticket1.id,
      authorUserId: techUser.id,
      noteType: "customer_visible",
      body: "Screen replacement complete. Tested and ready for collection!",
      createdAt: yesterday,
    }
  );

  // 10. Payments on Ticket 1
  db.payments.push({
    id: "pay_001",
    shopId: shop.id,
    repairTicketId: ticket1.id,
    amount: 2000,
    currency: "ETB",
    method: PaymentMethod.MOBILE_MONEY,
    reference: "Telebirr-TX-781920",
    status: "recorded",
    idempotencyKey: "seed_pay_001",
    notes: "Advance deposit at intake",
    recordedBy: ownerUser.id,
    recordedAt: threeDaysAgo,
    reversalOfPaymentId: null,
  });

  console.log("FixFlow In-Memory Database initialized with default demo shop & owner.");
}
