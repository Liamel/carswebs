import { asc } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { i18nStrings } from "@/lib/db/schema";
import { type Locale } from "@/lib/i18n/config";
import { createTranslator } from "@/lib/i18n/translate";

type I18nRow = {
  key: string;
  geo: string;
  en: string;
  ru: string;
};

const getI18nRowsCached = unstable_cache(
  async (): Promise<I18nRow[]> => {
    return db
      .select({
        key: i18nStrings.key,
        geo: i18nStrings.geo,
        en: i18nStrings.en,
        ru: i18nStrings.ru,
      })
      .from(i18nStrings)
      .orderBy(asc(i18nStrings.key));
  },
  ["i18n-strings"],
  { revalidate: 3600, tags: ["i18n"] },
);

function resolveRowValue(row: I18nRow, locale: Locale) {
  const localizedValue = row[locale].trim();

  if (localizedValue) {
    return localizedValue;
  }

  const geoValue = row.geo.trim();

  if (geoValue) {
    return geoValue;
  }

  return row.key;
}

export async function getLocaleMessages(locale: Locale) {
  const rows = await getI18nRowsCached();
  const messages: Record<string, string> = {};

  for (const row of rows) {
    messages[row.key] = resolveRowValue(row, locale);
  }

  return messages;
}

export async function getTranslator(locale: Locale) {
  const messages = await getLocaleMessages(locale);

  return {
    messages,
    t: createTranslator(messages),
  };
}
