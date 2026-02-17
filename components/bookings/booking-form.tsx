"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitBookingAction, type BookingActionState } from "@/app/book-test-drive/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { Locale } from "@/lib/i18n/config";

type ModelOption = {
  id: number;
  name: string;
  slug: string;
};

export type BookingFormLabels = {
  submit: string;
  submitting: string;
  nameLabel: string;
  emailLabel: string;
  phoneLabel: string;
  preferredModelLabel: string;
  anyModelOption: string;
  preferredDateLabel: string;
  preferredTimeLabel: string;
  selectTimeSlotOption: string;
  availableWindow: string;
  noSlotsToday: string;
  locationLabel: string;
  locationPlaceholder: string;
  noteLabel: string;
};

type BookingFormProps = {
  locale: Locale;
  labels: BookingFormLabels;
  models: ModelOption[];
  defaultModel?: string;
};

const initialState: BookingActionState = {};
const BOOKING_TIME_ZONE = "Etc/GMT-4";
const TIME_SLOT_INTERVAL_MINUTES = 30;
const BUSINESS_DAY_START_MINUTES = 9 * 60;
const BUSINESS_DAY_END_MINUTES = 20 * 60;
const BUSINESS_TIME_SLOT_COUNT =
  Math.floor((BUSINESS_DAY_END_MINUTES - BUSINESS_DAY_START_MINUTES) / TIME_SLOT_INTERVAL_MINUTES) + 1;
const TIME_SLOT_MINUTES = Array.from(
  { length: BUSINESS_TIME_SLOT_COUNT },
  (_, index) => BUSINESS_DAY_START_MINUTES + index * TIME_SLOT_INTERVAL_MINUTES,
);

const bookingDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: BOOKING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

const LOCALE_NUMBER_FORMAT: Record<Locale, string> = {
  geo: "ka-GE",
  en: "en-US",
  ru: "ru-RU",
};

function getBookingPartsMap(date = new Date()) {
  return new Map(bookingDateTimeFormatter.formatToParts(date).map((part) => [part.type, part.value]));
}

function getBookingDateValue(date = new Date()) {
  const partsMap = getBookingPartsMap(date);
  const year = partsMap.get("year") ?? "1970";
  const month = partsMap.get("month") ?? "01";
  const day = partsMap.get("day") ?? "01";

  return `${year}-${month}-${day}`;
}

function getCurrentBookingDateMeta(date = new Date()) {
  const partsMap = getBookingPartsMap(date);
  const year = partsMap.get("year") ?? "1970";
  const month = partsMap.get("month") ?? "01";
  const day = partsMap.get("day") ?? "01";
  const hours = Number.parseInt(partsMap.get("hour") ?? "0", 10);
  const minutes = Number.parseInt(partsMap.get("minute") ?? "0", 10);

  return {
    dateValue: `${year}-${month}-${day}`,
    minutesOfDay: hours * 60 + minutes,
  };
}

function getMinutesOfDay(timeValue: string) {
  const [hoursText, minutesText] = timeValue.split(":");
  const hours = Number.parseInt(hoursText ?? "", 10);
  const minutes = Number.parseInt(minutesText ?? "", 10);

  if (Number.isNaN(hours) || Number.isNaN(minutes)) {
    return -1;
  }

  return hours * 60 + minutes;
}

function toTimeValue(minutesOfDay: number) {
  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;

  return `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
}

function buildTimeSlotOptions(locale: Locale) {
  const formatter = new Intl.DateTimeFormat(LOCALE_NUMBER_FORMAT[locale], {
    hour: "numeric",
    minute: "2-digit",
  });

  return TIME_SLOT_MINUTES.map((minutesOfDay) => {
    const hours = Math.floor(minutesOfDay / 60);
    const minutes = minutesOfDay % 60;
    const displayDate = new Date(Date.UTC(2026, 0, 1, hours, minutes));

    return {
      value: toTimeValue(minutesOfDay),
      label: formatter.format(displayDate),
      minutesOfDay,
    };
  });
}

function SubmitButton({ labels }: { labels: BookingFormLabels }) {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? labels.submitting : labels.submit}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return <p className="text-sm text-rose-600">{errors[0]}</p>;
}

export function BookingForm({ locale, labels, models, defaultModel }: BookingFormProps) {
  const [state, formAction] = useActionState(submitBookingAction, initialState);
  const bookingNow = useMemo(() => getCurrentBookingDateMeta(new Date()), []);
  const minimumPreferredDate = bookingNow.dateValue;
  const timeSlotOptions = useMemo(() => buildTimeSlotOptions(locale), [locale]);
  const hasAvailableTimeSlotsToday = useMemo(
    () => timeSlotOptions.some((slot) => slot.minutesOfDay >= bookingNow.minutesOfDay),
    [bookingNow.minutesOfDay, timeSlotOptions],
  );
  const [preferredDate, setPreferredDate] = useState(() =>
    hasAvailableTimeSlotsToday
      ? minimumPreferredDate
      : getBookingDateValue(new Date(Date.now() + 24 * 60 * 60_000)),
  );
  const [preferredTime, setPreferredTime] = useState(() =>
    timeSlotOptions.find((slot) => slot.minutesOfDay >= bookingNow.minutesOfDay)?.value ??
      timeSlotOptions[0]?.value ??
      "",
  );
  const nextAvailableTodaySlotValue = useMemo(
    () => timeSlotOptions.find((slot) => slot.minutesOfDay >= bookingNow.minutesOfDay)?.value ?? "",
    [bookingNow.minutesOfDay, timeSlotOptions],
  );
  const isTodaySelected = preferredDate === minimumPreferredDate;
  const hasAvailableSlotsForSelectedDate = !isTodaySelected || hasAvailableTimeSlotsToday;
  const preferredDateTime = preferredDate && preferredTime ? `${preferredDate}T${preferredTime}` : "";

  const handlePreferredDateChange = (nextDateValue: string) => {
    setPreferredDate(nextDateValue);

    if (nextDateValue !== minimumPreferredDate) {
      if (!preferredTime) {
        setPreferredTime(timeSlotOptions[0]?.value ?? "");
      }

      return;
    }

    if (getMinutesOfDay(preferredTime) >= bookingNow.minutesOfDay) {
      return;
    }

    setPreferredTime(nextAvailableTodaySlotValue);
  };

  return (
    <form action={formAction} className="grid gap-5 sm:gap-4">
      <input type="hidden" name="locale" value={locale} />

      <div className="grid gap-2">
        <Label htmlFor="name">{labels.nameLabel}</Label>
        <Input id="name" name="name" required />
        <FieldError errors={state.fieldErrors?.name} />
      </div>
      <div className="grid gap-4 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">{labels.emailLabel}</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">{labels.phoneLabel}</Label>
          <Input id="phone" name="phone" required />
          <FieldError errors={state.fieldErrors?.phone} />
        </div>
      </div>
      <div className="grid gap-4 md:grid-cols-3 md:items-start">
        <div className="grid gap-2">
          <Label htmlFor="preferredModel">{labels.preferredModelLabel}</Label>
          <select
            id="preferredModel"
            name="preferredModel"
            defaultValue={defaultModel ?? ""}
            className="form-native-select h-11 rounded-xl border border-border px-3 text-sm shadow-xs"
          >
            <option value="">{labels.anyModelOption}</option>
            {models.map((model) => (
              <option key={model.id} value={model.slug}>
                {model.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.preferredModel} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preferredDate">{labels.preferredDateLabel}</Label>
          <Input
            id="preferredDate"
            type="date"
            className="bg-white pr-10"
            min={minimumPreferredDate}
            value={preferredDate}
            onChange={(event) => handlePreferredDateChange(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preferredTime">{labels.preferredTimeLabel}</Label>
          <select
            id="preferredTime"
            value={preferredTime}
            onChange={(event) => setPreferredTime(event.target.value)}
            className="form-native-select h-11 rounded-xl border border-border px-3 text-sm shadow-xs"
            required
          >
            <option value="" disabled>
              {labels.selectTimeSlotOption}
            </option>
            {timeSlotOptions.map((slot) => (
              <option
                key={slot.value}
                value={slot.value}
                disabled={isTodaySelected && slot.minutesOfDay < bookingNow.minutesOfDay}
              >
                {slot.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">{labels.availableWindow}</p>
          <input type="hidden" name="preferredDateTime" value={preferredDateTime} />
          {isTodaySelected && !hasAvailableSlotsForSelectedDate ? (
            <p className="text-xs text-muted-foreground">{labels.noSlotsToday}</p>
          ) : null}
          <FieldError errors={state.fieldErrors?.preferredDateTime} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">{labels.locationLabel}</Label>
        <Input id="location" name="location" placeholder={labels.locationPlaceholder} required />
        <FieldError errors={state.fieldErrors?.location} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="note">{labels.noteLabel}</Label>
        <Textarea id="note" name="note" rows={4} />
        <FieldError errors={state.fieldErrors?.note} />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <SubmitButton labels={labels} />
    </form>
  );
}
