import { z } from "zod";

export const bookingStatusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);

export const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().min(7).max(50),
  preferredModel: z.string().trim().optional(),
  preferredDateTime: z
    .string()
    .trim()
    .refine((value) => !Number.isNaN(Date.parse(value)), "Invalid preferred date/time"),
  location: z.string().trim().min(2).max(150),
  note: z.string().trim().max(2000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
