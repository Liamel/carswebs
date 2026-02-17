import type { Metadata } from "next";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { resolveLocaleParam } from "@/lib/i18n/locale-param";
import { getTranslator } from "@/lib/i18n/server";

type AboutPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: AboutPageProps): Promise<Metadata> {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return buildLocalizedMetadata({
    locale,
    pathname: "/about",
    title: t("meta.about.title"),
    description: t("meta.about.description"),
  });
}

export default async function AboutPage({ params }: AboutPageProps) {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return (
    <MarketingLayout locale={locale}>
      <section className="container-shell py-14 md:py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{t("about.title")}</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">{t("about.subtitle")}</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>{t("about.cards.design.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t("about.cards.design.description")}</CardContent>
          </Card>
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>{t("about.cards.engineering.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t("about.cards.engineering.description")}</CardContent>
          </Card>
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>{t("about.cards.service.title")}</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">{t("about.cards.service.description")}</CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
