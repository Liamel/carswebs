export const SUPPORTED_LOCALES = ["geo", "en", "ru"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export const DEFAULT_LOCALE: Locale = "geo";
export const LOCALE_COOKIE_NAME = "preferred-locale";
export const LOCALE_COOKIE_MAX_AGE = 60 * 60 * 24 * 365;

const LOCALE_ALIASES: Record<string, Locale> = {
  geo: "geo",
  ge: "geo",
  ka: "geo",
  en: "en",
  eng: "en",
  ru: "ru",
  rus: "ru",
};

export const LOCALE_DISPLAY_NAME: Record<Locale, string> = {
  geo: "GEO",
  en: "ENG",
  ru: "RUS",
};

export const LOCALE_HREF_LANG: Record<Locale, string> = {
  geo: "ka",
  en: "en",
  ru: "ru",
};

export const LOCALE_HTML_LANG: Record<Locale, string> = {
  geo: "ka-GE",
  en: "en-US",
  ru: "ru",
};

export function isLocale(value: string): value is Locale {
  return SUPPORTED_LOCALES.includes(value as Locale);
}

export function normalizeLocale(input: string | null | undefined): Locale | null {
  if (!input) {
    return null;
  }

  return LOCALE_ALIASES[input.trim().toLowerCase()] ?? null;
}
