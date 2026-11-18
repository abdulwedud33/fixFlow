import { z } from "zod";

export const trackRepairQuerySchema = z.object({
  ticketNumber: z.string().min(3).max(40),
  phoneLast4: z.string().length(4, "Enter the last 4 digits of the phone number used at intake"),
});
export type TrackRepairQuery = z.infer<typeof trackRepairQuerySchema>;

// Sanitized public tracking response (Zero PII, no internal notes, no financials)
export interface PublicRepairStatus {
  ticketNumber: string;
  status: string;
  deviceSummary: string;
  receivedAt: string;
  expectedCompletionAt: string | null;
  completedAt: string | null;
  shopName: string;
  shopPhone: string;
  shopAddress?: string;
  publicNotes: Array<{
    body: string;
    createdAt: string;
  }>;
}
