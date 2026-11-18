import { z } from "zod";

export const createWarrantySchema = z.object({
  repairTicketId: z.string().min(1),
  durationDays: z.number().int().positive().default(30),
  terms: z.string().max(1000).optional(),
});
export type CreateWarrantyInput = z.infer<typeof createWarrantySchema>;

export const warrantyClaimSchema = z.object({
  customerDescription: z.string().min(5).max(1000),
});
export type WarrantyClaimInput = z.infer<typeof warrantyClaimSchema>;
