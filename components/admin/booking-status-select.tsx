"use client";

import { useState } from "react";

import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import type { BookingStatus } from "@/lib/db/schema";

type BookingStatusSelectProps = {
  name: string;
  defaultValue: BookingStatus;
};

export function BookingStatusSelect({ name, defaultValue }: BookingStatusSelectProps) {
  const [status, setStatus] = useState<BookingStatus>(defaultValue);

  return (
    <>
      <input type="hidden" name={name} value={status} />
      <Select value={status} onValueChange={(nextValue) => setStatus(nextValue as BookingStatus)}>
        <SelectTrigger className="h-8 w-[148px] min-w-[148px] rounded-lg text-xs">
          <SelectValue placeholder="Set status" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="PENDING">Pending</SelectItem>
          <SelectItem value="CONFIRMED">Confirmed</SelectItem>
          <SelectItem value="CANCELLED">Cancelled</SelectItem>
        </SelectContent>
      </Select>
    </>
  );
}
