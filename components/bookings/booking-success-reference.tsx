"use client";

import { useSearchParams } from "next/navigation";

type BookingSuccessReferenceProps = {
  template: string;
  className?: string;
};

function formatTemplate(template: string, bookingId: string) {
  return template
    .replaceAll("{{id}}", bookingId)
    .replaceAll("{id}", bookingId);
}

export function BookingSuccessReference({ template, className }: BookingSuccessReferenceProps) {
  const searchParams = useSearchParams();
  const bookingId = searchParams.get("booking")?.trim();

  if (!bookingId) {
    return null;
  }

  return <p className={className}>{formatTemplate(template, bookingId)}</p>;
}
