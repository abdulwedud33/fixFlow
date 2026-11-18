import { z } from "zod";
import { ethiopianPhoneRegex } from "./auth";

export const customerSchema = z.object({
  fullName: z.string().min(2, "Full name must be at least 2 characters").max(160),
  phone: z.string().refine((val) => ethiopianPhoneRegex.test(val.replace(/[\s\-()]/g, "")), {
    message: "Invalid Ethiopian phone number (e.g. 0912345678 or +251912345678)",
  }),
  email: z.string().email("Invalid email").optional().or(z.literal("")),
  notes: z.string().max(1000).optional(),
});
export type CustomerInput = z.infer<typeof customerSchema>;
