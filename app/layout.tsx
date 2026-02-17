import type { Metadata } from "next";

import "@/app/globals.css";
import { Toaster } from "@/components/ui/sonner";
import { DEFAULT_LOCALE, LOCALE_HTML_LANG } from "@/lib/i18n/config";

export const metadata: Metadata = {
  metadataBase: new URL("https://example.com"),
  title: {
    default: "Astra Motors",
    template: "%s | Astra Motors",
  },
  description: "Modern SUVs and crossovers designed for comfort, technology, and electric-ready mobility.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang={LOCALE_HTML_LANG[DEFAULT_LOCALE]}>
      <body className="antialiased">
        {children}
        <Toaster />
      </body>
    </html>
  );
}
