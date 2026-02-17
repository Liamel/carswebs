import { formatBookingDateTimeForTelegram } from "@/lib/bookings/date-time";

type NewBookingNotificationInput = {
  bookingId: number;
  name: string;
  email: string;
  phone: string;
  modelName: string | null;
  preferredDateTime: Date;
  location: string;
  note: string | null;
};

const TELEGRAM_API_BASE_URL = "https://api.telegram.org";

type TelegramConfig = {
  botToken: string;
  chatId: string;
  messageThreadId?: number;
};

function getTelegramConfig(): TelegramConfig | null {
  const botToken = process.env.TELEGRAM_BOT_TOKEN?.trim();
  const chatId = process.env.TELEGRAM_CHAT_ID?.trim();

  if (!botToken || !chatId) {
    return null;
  }

  const threadIdRaw = process.env.TELEGRAM_MESSAGE_THREAD_ID?.trim();
  if (!threadIdRaw) {
    return { botToken, chatId };
  }

  const parsedThreadId = Number.parseInt(threadIdRaw, 10);
  if (Number.isNaN(parsedThreadId)) {
    console.warn("Ignoring TELEGRAM_MESSAGE_THREAD_ID because it is not a valid integer.");
    return { botToken, chatId };
  }

  return {
    botToken,
    chatId,
    messageThreadId: parsedThreadId,
  };
}

function buildBookingMessage(input: NewBookingNotificationInput) {
  const preferredDate = formatBookingDateTimeForTelegram(input.preferredDateTime);
  const note = input.note?.trim() ? input.note.trim() : "-";

  return [
    "New test drive booking",
    `Booking ID: #${input.bookingId}`,
    `Name: ${input.name}`,
    `Email: ${input.email}`,
    `Phone: ${input.phone}`,
    `Model: ${input.modelName ?? "Not specified"}`,
    `Preferred date/time: ${preferredDate}`,
    `Location: ${input.location}`,
    `Note: ${note}`,
  ].join("\n");
}

export async function sendTelegramNewBookingNotification(input: NewBookingNotificationInput) {
  const config = getTelegramConfig();

  if (!config) {
    console.warn("Telegram notification skipped: TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_ID is missing.");
    return false;
  }

  const response = await fetch(`${TELEGRAM_API_BASE_URL}/bot${config.botToken}/sendMessage`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      chat_id: config.chatId,
      text: buildBookingMessage(input),
      disable_web_page_preview: true,
      ...(config.messageThreadId !== undefined ? { message_thread_id: config.messageThreadId } : {}),
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    const body = await response.text();
    throw new Error(`Telegram sendMessage failed with HTTP ${response.status}: ${body}`);
  }

  const data = (await response.json()) as { ok?: boolean; description?: string };
  if (!data.ok) {
    throw new Error(`Telegram sendMessage returned ok=false${data.description ? `: ${data.description}` : ""}`);
  }

  return true;
}
