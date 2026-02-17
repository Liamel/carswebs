import type { Metadata } from "next";
import type { ReactNode } from "react";

import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { resolveLocaleParam } from "@/lib/i18n/locale-param";
import { getTranslator } from "@/lib/i18n/server";

type LocaleLayoutProps = {
  children: ReactNode;
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }): Promise<Metadata> {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return buildLocalizedMetadata({
    locale,
    pathname: "/",
    title: t("meta.default.title"),
    description: t("meta.default.description"),
  });
}

export default async function LocaleLayout({ children, params }: LocaleLayoutProps) {
  await resolveLocaleParam(params);
  return children;
}
