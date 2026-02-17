import type { Locale } from "@/lib/i18n/config";

const NUMBER_LOCALE_BY_LOCALE: Record<Locale, string> = {
  geo: "ka-GE",
  en: "en-US",
  ru: "ru-RU",
};

export function formatUsdPrice(price: number, locale: Locale) {
  return new Intl.NumberFormat(NUMBER_LOCALE_BY_LOCALE[locale], {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(price);
}
