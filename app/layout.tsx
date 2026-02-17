import type { Metadata } from "next";
import { cookies } from "next/headers";

import "@/app/globals.css";
import {
  AdminCommandPalette,
  type AdminCommandPaletteLabels,
} from "@/components/admin/admin-command-palette";
import { Toaster } from "@/components/ui/sonner";
import { isServerSessionAdmin } from "@/lib/auth";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALE_HTML_LANG, normalizeLocale } from "@/lib/i18n/config";
import { getTranslator } from "@/lib/i18n/server";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Astra Motors",
    template: "%s | Astra Motors",
  },
  description: "Modern SUVs and crossovers designed for comfort, technology, and electric-ready mobility.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [cookieStore, isAdmin] = await Promise.all([cookies(), isServerSessionAdmin()]);
  const cookieLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const locale = cookieLocale ?? DEFAULT_LOCALE;
  let adminPaletteLabels: AdminCommandPaletteLabels | null = null;

  if (isAdmin) {
    const { t } = await getTranslator(locale);
    const translatedOrFallback = (key: string, fallback: string) => {
      const translated = t(key);
      return translated === key || translated.startsWith("[missing:") ? fallback : translated;
    };

    adminPaletteLabels = {
      hotkeyHint: translatedOrFallback("admin.cmsShortcut.hotkeyHint", "Ctrl/Cmd + Shift + K"),
      dialogTitle: translatedOrFallback("admin.cmsShortcut.dialogTitle", "CMS shortcut"),
      dialogDescription: translatedOrFallback(
        "admin.cmsShortcut.dialogDescription",
        "Search and jump directly to an admin page.",
      ),
      searchPlaceholder: translatedOrFallback("admin.cmsShortcut.searchPlaceholder", "Search CMS pages..."),
      emptyState: translatedOrFallback("admin.cmsShortcut.emptyState", "No matching destinations."),
      selectHint: translatedOrFallback("admin.cmsShortcut.selectHint", "Use ↑ ↓ and Enter to navigate"),
      sections: {
        cms: translatedOrFallback("admin.cmsShortcut.sections.cms", "CMS"),
        management: translatedOrFallback("admin.cmsShortcut.sections.management", "Management"),
        content: translatedOrFallback("admin.cmsShortcut.sections.content", "Content"),
      },
      routes: {
        dashboard: {
          label: translatedOrFallback("admin.cmsShortcut.routes.dashboard.label", "Dashboard"),
          description: translatedOrFallback("admin.cmsShortcut.routes.dashboard.description", "Overview and stats"),
          keywords: translatedOrFallback("admin.cmsShortcut.routes.dashboard.keywords", "overview,stats,home"),
        },
        bookings: {
          label: translatedOrFallback("admin.cmsShortcut.routes.bookings.label", "Bookings"),
          description: translatedOrFallback(
            "admin.cmsShortcut.routes.bookings.description",
            "Test drive requests, orders, and leads",
          ),
          keywords: translatedOrFallback(
            "admin.cmsShortcut.routes.bookings.keywords",
            "bookings,test drive,orders,leads,requests,status",
          ),
        },
        cars: {
          label: translatedOrFallback("admin.cmsShortcut.routes.cars.label", "Cars"),
          description: translatedOrFallback("admin.cmsShortcut.routes.cars.description", "Inventory and model catalog"),
          keywords: translatedOrFallback("admin.cmsShortcut.routes.cars.keywords", "cars,inventory,models,catalog"),
        },
        homepageSlider: {
          label: translatedOrFallback("admin.cmsShortcut.routes.homepageSlider.label", "Homepage Slider"),
          description: translatedOrFallback(
            "admin.cmsShortcut.routes.homepageSlider.description",
            "Hero carousel slides and ordering",
          ),
          keywords: translatedOrFallback(
            "admin.cmsShortcut.routes.homepageSlider.keywords",
            "slider,carousel,hero,banner,homepage",
          ),
        },
        content: {
          label: translatedOrFallback("admin.cmsShortcut.routes.content.label", "Site Content"),
          description: translatedOrFallback("admin.cmsShortcut.routes.content.description", "Homepage copy and highlights"),
          keywords: translatedOrFallback(
            "admin.cmsShortcut.routes.content.keywords",
            "content,copy,homepage,highlights,text",
          ),
        },
        i18n: {
          label: translatedOrFallback("admin.cmsShortcut.routes.i18n.label", "I18n"),
          description: translatedOrFallback("admin.cmsShortcut.routes.i18n.description", "GEO / ENG / RUS strings"),
          keywords: translatedOrFallback(
            "admin.cmsShortcut.routes.i18n.keywords",
            "i18n,translations,localization,geo,en,ru",
          ),
        },
      },
    };
  }

  return (
    <html lang={LOCALE_HTML_LANG[locale]}>
      <body className="antialiased">
        {children}
        <AdminCommandPalette isAdmin={isAdmin} labels={adminPaletteLabels} />
        <Toaster />
      </body>
    </html>
  );
}
