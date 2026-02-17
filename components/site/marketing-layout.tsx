import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";
import type { Locale } from "@/lib/i18n/config";

type MarketingLayoutProps = {
  locale: Locale;
  children: ReactNode;
};

export function MarketingLayout({ locale, children }: MarketingLayoutProps) {
  return (
    <>
      <SiteHeader locale={locale} />
      <main>{children}</main>
      <SiteFooter locale={locale} />
    </>
  );
}
