import { z } from "zod";
import { ethiopianPhoneRegex } from "./auth";

export const updateShopSchema = z.object({
  name: z.string().min(2).max(160),
  phone: z.string().refine((val) => ethiopianPhoneRegex.test(val.replace(/[\s\-()]/g, "")), {
    message: "Invalid phone number",
  }),
  email: z.string().email().optional().or(z.literal("")),
  address: z.string().max(300).optional(),
  city: z.string().max(100).optional(),
  countryCode: z.string().length(2).default("ET"),
  currency: z.string().length(3).default("ETB"),
  timezone: z.string().default("Africa/Addis_Ababa"),
  settings: z
    .object({
      receiptFooterText: z.string().optional(),
      termsAndConditions: z.string().optional(),
      smsEnabled: z.boolean().optional(),
      logoUrl: z.string().url().optional().or(z.literal("")),
    })
    .optional(),
});
export type UpdateShopInput = z.infer<typeof updateShopSchema>;
