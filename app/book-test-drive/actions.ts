"use server";

import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import { parseBookingDateTime } from "@/lib/bookings/date-time";
import { searchCarsBySlugOrName } from "@/lib/db/queries";
import { bookings } from "@/lib/db/schema";
import { DEFAULT_LOCALE, normalizeLocale } from "@/lib/i18n/config";
import { getLocalizedCarName } from "@/lib/i18n/cars";
import { withLocalePath } from "@/lib/i18n/path";
import { getTranslator } from "@/lib/i18n/server";
import { sendTelegramNewBookingNotification } from "@/lib/notifications/telegram";
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

const FIELD_ERROR_KEY_MAP: Partial<Record<keyof BookingFormValues, string>> = {
  name: "booking.form.errors.name",
  email: "booking.form.errors.email",
  phone: "booking.form.errors.phone",
  preferredModel: "booking.form.errors.preferredModel",
  preferredDateTime: "booking.form.errors.preferredDateTime",
  location: "booking.form.errors.location",
  note: "booking.form.errors.note",
};

function mapFieldErrors(
  fieldErrors: Partial<Record<keyof BookingFormValues, string[]>>,
  t: (key: string) => string,
): Partial<Record<keyof BookingFormValues, string[]>> {
  const translated: Partial<Record<keyof BookingFormValues, string[]>> = {};

  for (const [fieldName, errors] of Object.entries(fieldErrors) as Array<[
    keyof BookingFormValues,
    string[] | undefined,
  ]>) {
    if (!errors || errors.length === 0) {
      continue;
    }

    const messageKey = FIELD_ERROR_KEY_MAP[fieldName];
    translated[fieldName] = [messageKey ? t(messageKey) : errors[0]];
  }

  return translated;
}

export async function submitBookingAction(
  _prevState: BookingActionState,
  formData: FormData,
): Promise<BookingActionState> {
  const locale = normalizeLocale(String(formData.get("locale") ?? "")) ?? DEFAULT_LOCALE;
  const { t } = await getTranslator(locale);

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
      error: t("booking.form.errors.generic"),
      fieldErrors: mapFieldErrors(parsed.error.flatten().fieldErrors, t),
    };
  }

  const selectedCar = parsed.data.preferredModel
    ? await searchCarsBySlugOrName(parsed.data.preferredModel)
    : null;
  const preferredDateTime = parseBookingDateTime(parsed.data.preferredDateTime);

  if (!preferredDateTime) {
    return {
      error: t("booking.form.errors.generic"),
      fieldErrors: {
        preferredDateTime: [t("booking.form.errors.preferredDateTime")],
      },
    };
  }

  const [created] = await db
    .insert(bookings)
    .values({
      carId: selectedCar?.id ?? null,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      preferredDateTime,
      location: parsed.data.location,
      note: parsed.data.note || null,
      status: "PENDING",
    })
    .returning({ id: bookings.id });

  try {
    await sendTelegramNewBookingNotification({
      bookingId: created.id,
      name: parsed.data.name,
      email: parsed.data.email,
      phone: parsed.data.phone,
      modelName: selectedCar ? getLocalizedCarName(selectedCar, locale) : null,
      preferredDateTime,
      location: parsed.data.location,
      note: parsed.data.note || null,
    });
  } catch (error) {
    console.error("Failed to send Telegram booking notification", error);
  }

  redirect(withLocalePath(locale, `/book-test-drive/success?booking=${created.id}`));
}
