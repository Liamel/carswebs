import { normalizeLocale, type Locale } from "@/lib/i18n/config";

const EXTERNAL_LINK_PATTERN = /^[a-zA-Z][a-zA-Z\d+\-.]*:/;

export function normalizePathname(pathname: string) {
  if (!pathname) {
    return "/";
  }

  return pathname.startsWith("/") ? pathname : `/${pathname}`;
}

export function extractLocaleFromPath(pathname: string): { locale: Locale | null; pathname: string } {
  const normalizedPath = normalizePathname(pathname);
  const [pathPart] = normalizedPath.split(/[?#]/, 1);
  const segments = pathPart.split("/").filter(Boolean);
  const firstSegment = segments[0] ?? "";
  const resolvedLocale = normalizeLocale(firstSegment);

  if (!resolvedLocale) {
    return { locale: null, pathname: pathPart || "/" };
  }

  const restSegments = segments.slice(1);
  const restPath = restSegments.length > 0 ? `/${restSegments.join("/")}` : "/";
  return { locale: resolvedLocale, pathname: restPath };
}

export function withLocalePath(locale: Locale, href: string) {
  if (!href || href.startsWith("#") || EXTERNAL_LINK_PATTERN.test(href)) {
    return href;
  }

  const normalizedHref = normalizePathname(href);
  const match = normalizedHref.match(/^([^?#]*)(.*)$/);
  const pathname = match?.[1] ?? "/";
  const suffix = match?.[2] ?? "";
  const { pathname: restPath } = extractLocaleFromPath(pathname);
  const localizedPath = restPath === "/" ? `/${locale}` : `/${locale}${restPath}`;

  return `${localizedPath}${suffix}`;
}
