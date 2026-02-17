"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";

import { submitBookingAction, type BookingActionState } from "@/app/book-test-drive/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

type ModelOption = {
  id: number;
  name: string;
  slug: string;
};

type BookingFormProps = {
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
const TIME_SLOT_OPTIONS = Array.from({ length: BUSINESS_TIME_SLOT_COUNT }, (_, index) => {
  const minutesOfDay = BUSINESS_DAY_START_MINUTES + index * TIME_SLOT_INTERVAL_MINUTES;
  const hours = Math.floor(minutesOfDay / 60);
  const minutes = minutesOfDay % 60;
  const value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}`;
  const hour12 = hours % 12 || 12;
  const period = hours >= 12 ? "PM" : "AM";

  return {
    value,
    label: `${hour12}:${String(minutes).padStart(2, "0")} ${period}`,
    minutesOfDay,
  };
});

const bookingDateTimeFormatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: BOOKING_TIME_ZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  hourCycle: "h23",
});

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

function SubmitButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" size="lg" disabled={pending}>
      {pending ? "Submitting..." : "Submit booking"}
    </Button>
  );
}

function FieldError({ errors }: { errors?: string[] }) {
  if (!errors || errors.length === 0) {
    return null;
  }

  return <p className="text-sm text-rose-600">{errors[0]}</p>;
}

export function BookingForm({ models, defaultModel }: BookingFormProps) {
  const [state, formAction] = useActionState(submitBookingAction, initialState);
  const bookingNow = useMemo(() => getCurrentBookingDateMeta(new Date()), []);
  const minimumPreferredDate = bookingNow.dateValue;
  const hasAvailableTimeSlotsToday = useMemo(
    () => TIME_SLOT_OPTIONS.some((slot) => slot.minutesOfDay >= bookingNow.minutesOfDay),
    [bookingNow.minutesOfDay],
  );
  const [preferredDate, setPreferredDate] = useState(() =>
    hasAvailableTimeSlotsToday
      ? minimumPreferredDate
      : getBookingDateValue(new Date(Date.now() + 24 * 60 * 60_000)),
  );
  const [preferredTime, setPreferredTime] = useState(() =>
    TIME_SLOT_OPTIONS.find((slot) => slot.minutesOfDay >= bookingNow.minutesOfDay)?.value ??
      TIME_SLOT_OPTIONS[0]?.value ??
      "",
  );
  const nextAvailableTodaySlotValue = useMemo(
    () => TIME_SLOT_OPTIONS.find((slot) => slot.minutesOfDay >= bookingNow.minutesOfDay)?.value ?? "",
    [bookingNow.minutesOfDay],
  );
  const isTodaySelected = preferredDate === minimumPreferredDate;
  const hasAvailableSlotsForSelectedDate = !isTodaySelected || hasAvailableTimeSlotsToday;
  const preferredDateTime = preferredDate && preferredTime ? `${preferredDate}T${preferredTime}` : "";

  const handlePreferredDateChange = (nextDateValue: string) => {
    setPreferredDate(nextDateValue);

    if (nextDateValue !== minimumPreferredDate) {
      if (!preferredTime) {
        setPreferredTime(TIME_SLOT_OPTIONS[0]?.value ?? "");
      }

      return;
    }

    if (getMinutesOfDay(preferredTime) >= bookingNow.minutesOfDay) {
      return;
    }

    setPreferredTime(nextAvailableTodaySlotValue);
  };

  return (
    <form action={formAction} className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="name">Full name</Label>
        <Input id="name" name="name" required />
        <FieldError errors={state.fieldErrors?.name} />
      </div>
      <div className="grid gap-2 md:grid-cols-2">
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" name="email" type="email" required />
          <FieldError errors={state.fieldErrors?.email} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="phone">Phone</Label>
          <Input id="phone" name="phone" required />
          <FieldError errors={state.fieldErrors?.phone} />
        </div>
      </div>
      <div className="grid gap-2 md:grid-cols-3">
        <div className="grid gap-2">
          <Label htmlFor="preferredModel">Preferred model</Label>
          <select
            id="preferredModel"
            name="preferredModel"
            defaultValue={defaultModel ?? ""}
            className="h-11 rounded-xl border border-border bg-white px-3 text-sm shadow-xs"
          >
            <option value="">Any model</option>
            {models.map((model) => (
              <option key={model.id} value={model.slug}>
                {model.name}
              </option>
            ))}
          </select>
          <FieldError errors={state.fieldErrors?.preferredModel} />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preferredDate">Preferred date (GMT+4)</Label>
          <Input
            id="preferredDate"
            type="date"
            min={minimumPreferredDate}
            value={preferredDate}
            onChange={(event) => handlePreferredDateChange(event.target.value)}
            required
          />
        </div>
        <div className="grid gap-2">
          <Label htmlFor="preferredTime">Preferred time (GMT+4)</Label>
          <select
            id="preferredTime"
            value={preferredTime}
            onChange={(event) => setPreferredTime(event.target.value)}
            className="h-11 rounded-xl border border-border bg-white px-3 text-sm shadow-xs"
            required
          >
            <option value="" disabled>
              Select a time slot
            </option>
            {TIME_SLOT_OPTIONS.map((slot) => (
              <option
                key={slot.value}
                value={slot.value}
                disabled={isTodaySelected && slot.minutesOfDay < bookingNow.minutesOfDay}
              >
                {slot.label}
              </option>
            ))}
          </select>
          <p className="text-xs text-muted-foreground">Available daily between 9:00 AM and 8:00 PM.</p>
          <input type="hidden" name="preferredDateTime" value={preferredDateTime} />
          {isTodaySelected && !hasAvailableSlotsForSelectedDate ? (
            <p className="text-xs text-muted-foreground">No slots left for today. Please select a later date.</p>
          ) : null}
          <FieldError errors={state.fieldErrors?.preferredDateTime} />
        </div>
      </div>
      <div className="grid gap-2">
        <Label htmlFor="location">Preferred location</Label>
        <Input id="location" name="location" placeholder="City or dealership" required />
        <FieldError errors={state.fieldErrors?.location} />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="note">Note (optional)</Label>
        <Textarea id="note" name="note" rows={4} />
        <FieldError errors={state.fieldErrors?.note} />
      </div>
      {state.error ? <p className="text-sm text-rose-600">{state.error}</p> : null}
      <SubmitButton />
    </form>
  );
}
