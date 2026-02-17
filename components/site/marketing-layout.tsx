import type { ReactNode } from "react";

import { SiteFooter } from "@/components/site/footer";
import { SiteHeader } from "@/components/site/header";

type MarketingLayoutProps = {
  children: ReactNode;
};

export function MarketingLayout({ children }: MarketingLayoutProps) {
  return (
    <>
      <SiteHeader />
      <main>{children}</main>
      <SiteFooter />
    </>
  );
}
