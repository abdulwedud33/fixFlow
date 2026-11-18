import { z } from "zod";
import { PaymentMethod, EstimateStatus } from "./enums";

export const createEstimateSchema = z.object({
  laborAmount: z.number().min(0, "Labor amount must be 0 or more"),
  partsAmount: z.number().min(0, "Parts amount must be 0 or more"),
  discountAmount: z.number().min(0, "Discount amount must be 0 or more").default(0),
  currency: z.string().length(3).default("ETB"),
  notes: z.string().max(1000).optional(),
});
export type CreateEstimateInput = z.infer<typeof createEstimateSchema>;

export const updateEstimateStatusSchema = z.object({
  status: z.enum([
    EstimateStatus.APPROVED,
    EstimateStatus.REJECTED,
    EstimateStatus.SUPERSEDED,
  ]),
});
export type UpdateEstimateStatusInput = z.infer<typeof updateEstimateStatusSchema>;

export const recordPaymentSchema = z.object({
  amount: z.number().positive("Payment amount must be greater than zero"),
  method: z.enum([
    PaymentMethod.CASH,
    PaymentMethod.BANK_TRANSFER,
    PaymentMethod.MOBILE_MONEY,
    PaymentMethod.CARD,
    PaymentMethod.OTHER,
  ]),
  reference: z.string().max(120).optional(),
  idempotencyKey: z.string().min(8, "Idempotency key is required").max(120),
  notes: z.string().max(500).optional(),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const reversePaymentSchema = z.object({
  reason: z.string().min(5, "A reason for reversal is required").max(500),
});
export type ReversePaymentInput = z.infer<typeof reversePaymentSchema>;
