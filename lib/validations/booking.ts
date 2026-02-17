import { z } from "zod";

import { isBookingDateTimeInFutureOrNow, parseBookingDateTime } from "@/lib/bookings/date-time";

export const bookingStatusSchema = z.enum(["PENDING", "CONFIRMED", "CANCELLED"]);

export const bookingSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.email(),
  phone: z.string().trim().min(7).max(50),
  preferredModel: z.string().trim().optional(),
  preferredDateTime: z
    .string()
    .trim()
    .refine((value) => parseBookingDateTime(value) !== null, "Invalid preferred date/time")
    .refine((value) => isBookingDateTimeInFutureOrNow(value), "Preferred date/time cannot be in the past"),
  location: z.string().trim().min(2).max(150),
  note: z.string().trim().max(2000).optional(),
});

export type BookingInput = z.infer<typeof bookingSchema>;
