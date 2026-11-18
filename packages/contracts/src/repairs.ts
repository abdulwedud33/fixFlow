import { z } from "zod";
import { RepairPriority, RepairStatus, NoteType, DeviceType } from "./enums";
import { ethiopianPhoneRegex } from "./auth";

// Finite State Machine allowed transitions
export const ALLOWED_TRANSITIONS: Record<RepairStatus, RepairStatus[]> = {
  [RepairStatus.RECEIVED]: [
    RepairStatus.DIAGNOSING,
    RepairStatus.WAITING_FOR_APPROVAL,
    RepairStatus.IN_PROGRESS,
    RepairStatus.CANCELLED,
  ],
  [RepairStatus.DIAGNOSING]: [
    RepairStatus.WAITING_FOR_APPROVAL,
    RepairStatus.WAITING_FOR_PARTS,
    RepairStatus.IN_PROGRESS,
    RepairStatus.CANCELLED,
  ],
  [RepairStatus.WAITING_FOR_APPROVAL]: [
    RepairStatus.IN_PROGRESS,
    RepairStatus.WAITING_FOR_PARTS,
    RepairStatus.CANCELLED,
  ],
  [RepairStatus.WAITING_FOR_PARTS]: [
    RepairStatus.IN_PROGRESS,
    RepairStatus.CANCELLED,
  ],
  [RepairStatus.IN_PROGRESS]: [
    RepairStatus.COMPLETED,
    RepairStatus.WAITING_FOR_PARTS,
    RepairStatus.CANCELLED,
  ],
  [RepairStatus.COMPLETED]: [
    RepairStatus.READY_FOR_PICKUP,
    RepairStatus.COLLECTED,
  ],
  [RepairStatus.READY_FOR_PICKUP]: [
    RepairStatus.COLLECTED,
    RepairStatus.CANCELLED,
  ],
  [RepairStatus.COLLECTED]: [], // Terminal state, reopening requires explicit admin audit
  [RepairStatus.CANCELLED]: [
    RepairStatus.RECEIVED, // Re-opened with audit reason
  ],
};

export function isValidTransition(from: RepairStatus, to: RepairStatus): boolean {
  const allowed = ALLOWED_TRANSITIONS[from];
  return !!allowed && allowed.includes(to);
}

export const createRepairTicketSchema = z.object({
  customerId: z.string().min(1).optional(),
  customer: z
    .object({
      fullName: z.string().min(2).max(160),
      phone: z.string().refine((val) => ethiopianPhoneRegex.test(val.replace(/[\s\-()]/g, "")), {
        message: "Invalid phone number",
      }),
      email: z.string().email().optional().or(z.literal("")),
    })
    .optional(),
  deviceId: z.string().min(1).optional(),
  device: z
    .object({
      deviceType: z.enum([
        DeviceType.PHONE,
        DeviceType.LAPTOP,
        DeviceType.TABLET,
        DeviceType.DESKTOP,
        DeviceType.APPLIANCE,
        DeviceType.OTHER,
      ]),
      brand: z.string().min(1).max(100),
      model: z.string().min(1).max(120),
      serialNumber: z.string().max(120).optional(),
      imei: z.string().max(32).optional(),
      color: z.string().max(60).optional(),
    })
    .optional(),
  reportedIssue: z.string().min(3, "Reported issue is required").max(2000),
  conditionOnIntake: z.string().max(1000).optional(),
  accessoriesReceived: z.array(z.string()).default([]),
  priority: z.enum([RepairPriority.NORMAL, RepairPriority.URGENT]).default(RepairPriority.NORMAL),
  estimatedCost: z.number().nonnegative().optional(),
  expectedCompletionAt: z.string().datetime().optional().nullable(),
  assignedTechnicianUserId: z.string().min(1).optional().nullable(),
  sendCustomerSms: z.boolean().default(true),
});
export type CreateRepairTicketInput = z.infer<typeof createRepairTicketSchema>;

export const transitionStatusSchema = z.object({
  toStatus: z.enum([
    RepairStatus.RECEIVED,
    RepairStatus.DIAGNOSING,
    RepairStatus.WAITING_FOR_APPROVAL,
    RepairStatus.WAITING_FOR_PARTS,
    RepairStatus.IN_PROGRESS,
    RepairStatus.COMPLETED,
    RepairStatus.READY_FOR_PICKUP,
    RepairStatus.COLLECTED,
    RepairStatus.CANCELLED,
  ]),
  reason: z.string().max(500).optional(),
  overrideCollectionWithoutPayment: z.boolean().optional(),
});
export type TransitionStatusInput = z.infer<typeof transitionStatusSchema>;

export const assignTechnicianSchema = z.object({
  technicianUserId: z.string().min(1, "Invalid technician user ID"),
});
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;

export const createRepairNoteSchema = z.object({
  noteType: z.enum([NoteType.INTERNAL, NoteType.CUSTOMER_VISIBLE]).default(NoteType.INTERNAL),
  body: z.string().min(1, "Note cannot be empty").max(2000),
});
export type CreateRepairNoteInput = z.infer<typeof createRepairNoteSchema>;
