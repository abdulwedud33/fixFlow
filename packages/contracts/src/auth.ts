import { z } from "zod";
import { UserRole } from "./enums";

// Ethiopian phone regex: supports +251 9/7..., 09/07..., 9/7...
export const ethiopianPhoneRegex = /^(?:\+251|0)?([79]\d{8})$/;

export function normalizeEthiopianPhone(phone: string): string {
  const cleaned = phone.replace(/[\s\-()]/g, "");
  const match = cleaned.match(ethiopianPhoneRegex);
  if (!match) return cleaned;
  return `+251${match[1]}`;
}

export function formatEthiopianPhone(phone: string): string {
  const normalized = normalizeEthiopianPhone(phone);
  if (normalized.startsWith("+251") && normalized.length === 13) {
    const prefix = normalized.slice(0, 4); // +251
    const operator = normalized.slice(4, 6); // 91 or 71
    const part1 = normalized.slice(6, 9);
    const part2 = normalized.slice(9, 13);
    return `${prefix} ${operator} ${part1} ${part2}`;
  }
  return phone;
}

export const registerSchema = z.object({
  displayName: z.string().min(2, "Name must be at least 2 characters").max(120),
  email: z.string().email("Invalid email address").optional().or(z.literal("")),
  phone: z
    .string()
    .refine((val) => ethiopianPhoneRegex.test(val.replace(/[\s\-()]/g, "")), {
      message: "Please enter a valid Ethiopian phone number (e.g., 0912345678 or +251912345678)",
    }),
  password: z.string().min(8, "Password must be at least 8 characters"),
  shopName: z.string().min(2, "Shop name must be at least 2 characters").max(160),
  shopCity: z.string().optional().default("Addis Ababa"),
});
export type RegisterInput = z.infer<typeof registerSchema>;

export const loginSchema = z.object({
  identifier: z.string().min(3, "Enter your phone number or email"),
  password: z.string().min(1, "Password is required"),
});
export type LoginInput = z.infer<typeof loginSchema>;

export const inviteStaffSchema = z.object({
  displayName: z.string().min(2).max(120),
  email: z.string().email().optional().or(z.literal("")),
  phone: z.string().refine((val) => ethiopianPhoneRegex.test(val.replace(/[\s\-()]/g, "")), {
    message: "Invalid phone number",
  }),
  role: z.enum([UserRole.MANAGER, UserRole.RECEPTIONIST, UserRole.TECHNICIAN]),
});
export type InviteStaffInput = z.infer<typeof inviteStaffSchema>;
