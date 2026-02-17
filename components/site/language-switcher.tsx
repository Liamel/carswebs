"use client";

import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";

import { LOCALE_DISPLAY_NAME, SUPPORTED_LOCALES, type Locale } from "@/lib/i18n/config";
import { extractLocaleFromPath, withLocalePath } from "@/lib/i18n/path";
import { cn } from "@/lib/utils";

type LanguageSwitcherProps = {
  currentLocale: Locale;
  ariaLabel: string;
};

export function LanguageSwitcher({ currentLocale, ariaLabel }: LanguageSwitcherProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { pathname: pathWithoutLocale } = extractLocaleFromPath(pathname || "/");
  const serializedSearchParams = searchParams.toString();

  return (
    <nav aria-label={ariaLabel} className="inline-flex items-center gap-1 rounded-full border border-border/80 bg-background/90 p-1">
      {SUPPORTED_LOCALES.map((locale) => {
        const baseHref = withLocalePath(locale, pathWithoutLocale);
        const href = serializedSearchParams ? `${baseHref}?${serializedSearchParams}` : baseHref;
        const isActive = locale === currentLocale;

        return (
          <Link
            key={locale}
            href={href}
            className={cn(
              "rounded-full px-2.5 py-1 text-xs font-semibold transition",
              isActive ? "bg-primary text-white" : "text-muted-foreground hover:text-foreground",
            )}
          >
            {LOCALE_DISPLAY_NAME[locale]}
          </Link>
        );
      })}
    </nav>
  );
}
