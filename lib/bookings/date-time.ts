const BOOKING_TIMEZONE_OFFSET = "+04:00";
const BOOKING_TIMEZONE_LABEL = "GMT+4";
const BOOKING_INTL_TIME_ZONE = "Etc/GMT-4";
const DATETIME_LOCAL_PATTERN = /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}$/;

function isValidDate(value: Date) {
  return !Number.isNaN(value.getTime());
}

export function parseBookingDateTime(value: string) {
  const normalizedValue = value.trim();

  if (!DATETIME_LOCAL_PATTERN.test(normalizedValue)) {
    return null;
  }

  const parsed = new Date(`${normalizedValue}:00${BOOKING_TIMEZONE_OFFSET}`);
  return isValidDate(parsed) ? parsed : null;
}

export function isBookingDateTimeInFutureOrNow(value: string, now = new Date()) {
  const parsed = parseBookingDateTime(value);
  if (!parsed) {
    return false;
  }

  return parsed.getTime() >= now.getTime();
}

export function formatBookingDateTimeForTelegram(value: Date) {
  if (!isValidDate(value)) {
    return "Invalid date/time";
  }

  const formattedValue = new Intl.DateTimeFormat("en-GB", {
    timeZone: BOOKING_INTL_TIME_ZONE,
    year: "numeric",
    month: "short",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(value);

  return `${formattedValue} (${BOOKING_TIMEZONE_LABEL})`;
}
