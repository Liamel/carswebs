import type { Metadata } from "next";
import { cookies } from "next/headers";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, LOCALE_HTML_LANG, normalizeLocale } from "@/lib/i18n/config";

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
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const locale = cookieLocale ?? DEFAULT_LOCALE;

  return (
    <html lang={LOCALE_HTML_LANG[locale]}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
