import { z } from "zod";
import { StockMovementType } from "./enums";

export const partSchema = z.object({
  sku: z.string().min(2).max(60),
  name: z.string().min(2).max(160),
  description: z.string().max(500).optional(),
  unit: z.string().max(30).default("pcs"),
  costPrice: z.number().min(0).default(0),
  sellingPrice: z.number().min(0).default(0),
  reorderLevel: z.number().int().min(0).default(5),
  initialQuantity: z.number().int().min(0).default(0),
});
export type PartInput = z.infer<typeof partSchema>;

export const stockAdjustmentSchema = z.object({
  partId: z.string().min(1),
  quantityDelta: z.number().int(),
  movementType: z.enum([
    StockMovementType.PURCHASE,
    StockMovementType.ADJUSTMENT,
    StockMovementType.RETURN,
  ]),
  unitCost: z.number().min(0).optional(),
  notes: z.string().max(500).optional(),
});
export type StockAdjustmentInput = z.infer<typeof stockAdjustmentSchema>;

export const consumePartSchema = z.object({
  partId: z.string().min(1),
  quantity: z.number().int().positive("Quantity must be at least 1"),
  unitCost: z.number().min(0).optional(),
});
export type ConsumePartInput = z.infer<typeof consumePartSchema>;
