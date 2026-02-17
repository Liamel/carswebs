import { notFound } from "next/navigation";

import { normalizeLocale, type Locale } from "@/lib/i18n/config";

export function parseLocaleOrNotFound(input: string): Locale {
  const locale = normalizeLocale(input);

  if (!locale) {
    notFound();
  }

  return locale;
}

export async function resolveLocaleParam(params: Promise<{ locale: string }>) {
  const { locale } = await params;
  return parseLocaleOrNotFound(locale);
}
