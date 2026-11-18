import { z } from "zod";
import { DeviceType } from "./enums";

export const deviceSchema = z.object({
  customerId: z.string().min(1, "Invalid customer ID"),
  deviceType: z.enum([
    DeviceType.PHONE,
    DeviceType.LAPTOP,
    DeviceType.TABLET,
    DeviceType.DESKTOP,
    DeviceType.APPLIANCE,
    DeviceType.OTHER,
  ]),
  brand: z.string().min(1, "Brand is required").max(100),
  model: z.string().min(1, "Model is required").max(120),
  serialNumber: z.string().max(120).optional(),
  imei: z.string().max(32).optional(),
  color: z.string().max(60).optional(),
});
export type DeviceInput = z.infer<typeof deviceSchema>;
