"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { searchCarsBySlugOrName } from "@/lib/db/queries";
import { bookings } from "@/lib/db/schema";
import { bookingSchema } from "@/lib/validations/booking";

export type BookingActionState = {
  error?: string;
  fieldErrors?: Partial<Record<keyof BookingFormValues, string[]>>;
};

type BookingFormValues = {
  name: string;
  email: string;
  phone: string;
  preferredModel: string;
  preferredDateTime: string;
  location: string;
  note: string;
};

export async function submitBookingAction(
  _prevState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const rawValues: BookingFormValues = {
    name: String(formData.get("name") ?? ""),
    email: String(formData.get("email") ?? ""),
    phone: String(formData.get("phone") ?? ""),
    preferredModel: String(formData.get("preferredModel") ?? ""),
    preferredDateTime: String(formData.get("preferredDateTime") ?? ""),
    location: String(formData.get("location") ?? ""),
    note: String(formData.get("note") ?? ""),
  };

  const parsed = bookingSchema.safeParse(rawValues);

  if (!parsed.success) {
    return {
      error: "Please review the highlighted fields.",
      fieldErrors: parsed.error.flatten().fieldErrors,
    };
  }

  const selectedCar = parsed.data.preferredModel
    ? await searchCarsBySlugOrName(parsed.data.preferredModel)
    : null;

  const [created] = await db
    .insert(bookings)
    .values({
      carId: selectedCar?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      preferredDateTime: new Date(parsed.data.preferredDateTime),
      location: parsed.data.location,
      note: parsed.data.note || null,
      status: "PENDING",
    })
    .returning({ id: bookings.id });

  console.log("email sent", {
    to: parsed.data.email,
    bookingId: created.id,
    model: selectedCar?.name ?? "No specific model",
  });

  redirect(`/book-test-drive/success?booking=${created.id}`);
}
