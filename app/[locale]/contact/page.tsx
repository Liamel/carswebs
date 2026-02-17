import type { Metadata } from "next";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { resolveLocaleParam } from "@/lib/i18n/locale-param";
import { getTranslator } from "@/lib/i18n/server";

export const revalidate = 3600;

type ContactPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ContactPageProps): Promise<Metadata> {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return buildLocalizedMetadata({
    locale,
    pathname: "/contact",
    title: t("meta.contact.title"),
    description: t("meta.contact.description"),
  });
}

export default async function ContactPage({ params }: ContactPageProps) {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return (
    <MarketingLayout locale={locale}>
      <section className="container-shell py-14 md:py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{t("contact.title")}</h1>
        <p className="mt-3 text-muted-foreground">{t("contact.subtitle")}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>{t("contact.cards.sales.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{t("contact.cards.sales.email")}</p>
              <p>{t("contact.cards.sales.phone")}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>{t("contact.cards.service.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{t("contact.cards.service.email")}</p>
              <p>{t("contact.cards.service.phone")}</p>
            </CardContent>
          </Card>
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>{t("contact.cards.visit.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>{t("contact.cards.visit.addressLine1")}</p>
              <p>{t("contact.cards.visit.addressLine2")}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
