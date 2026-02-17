import type { Metadata } from "next";

import {
  DEFAULT_LOCALE,
  LOCALE_HREF_LANG,
  SUPPORTED_LOCALES,
  type Locale,
} from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";

const FALLBACK_SITE_URL = "https://example.com";

function getSiteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
}

export function buildLocaleAlternates(locale: Locale, pathname: string): Metadata["alternates"] {
  const baseUrl = getSiteUrl();
  const canonicalPath = withLocalePath(locale, pathname);
  const languages: Record<string, string> = {};

  for (const candidateLocale of SUPPORTED_LOCALES) {
    languages[LOCALE_HREF_LANG[candidateLocale]] = new URL(
      withLocalePath(candidateLocale, pathname),
      baseUrl,
    ).toString();
  }

  languages["x-default"] = new URL(withLocalePath(DEFAULT_LOCALE, pathname), baseUrl).toString();

  return {
    canonical: new URL(canonicalPath, baseUrl).toString(),
    languages,
  };
}

export function buildLocalizedMetadata(options: {
  locale: Locale;
  pathname: string;
  title: string;
  description: string;
}): Metadata {
  return {
    title: options.title,
    description: options.description,
    alternates: buildLocaleAlternates(options.locale, options.pathname),
  };
}
