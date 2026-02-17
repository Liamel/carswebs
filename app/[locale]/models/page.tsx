import type { Metadata } from "next";
import { Suspense } from "react";

import { ModelsCatalogClient } from "@/components/models/models-catalog-client";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { getBodyTypes, getCars } from "@/lib/db/queries";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { getBodyTypeTranslationKey } from "@/lib/i18n/body-type";
import { resolveLocaleParam } from "@/lib/i18n/locale-param";
import { getTranslator } from "@/lib/i18n/server";

export const revalidate = 300;

type ModelsPageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: ModelsPageProps): Promise<Metadata> {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return buildLocalizedMetadata({
    locale,
    pathname: "/models",
    title: t("meta.models.title"),
    description: t("meta.models.description"),
  });
}

export default async function ModelsPage({ params }: ModelsPageProps) {
  const locale = await resolveLocaleParam(params);
  const [cars, bodyTypes, { t }] = await Promise.all([getCars(undefined, locale), getBodyTypes(), getTranslator(locale)]);

  const bodyTypeLabels: Record<string, string> = {};
  for (const bodyType of bodyTypes) {
    const bodyTypeKey = getBodyTypeTranslationKey(bodyType);
    bodyTypeLabels[bodyType] = bodyTypeKey ? t(bodyTypeKey) : bodyType;
  }

  return (
    <MarketingLayout locale={locale}>
      <Suspense
        fallback={
          <section className="container-shell py-14 md:py-16">
            <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{t("models.title")}</h1>
            <p className="mt-2 max-w-3xl text-lg text-muted-foreground">{t("models.subtitle")}</p>
          </section>
        }
      >
        <ModelsCatalogClient
          locale={locale}
          cars={cars}
          bodyTypes={bodyTypes}
          bodyTypeLabels={bodyTypeLabels}
          labels={{
            title: t("models.title"),
            subtitle: t("models.subtitle"),
            searchLabel: t("models.filters.searchLabel"),
            searchPlaceholder: t("models.filters.searchPlaceholder"),
            vehicleType: t("models.filters.vehicleType"),
            featuredOnly: t("models.filters.featuredOnly"),
            apply: t("models.filters.apply"),
            reset: t("models.filters.reset"),
            showingCountTemplate: t("models.showingCount", { count: "{count}" }),
            empty: t("models.empty"),
            cardFeatured: t("models.card.featured"),
            cardFrom: t("common.from"),
            cardViewDetails: t("models.card.viewDetails"),
            cardBookTestDrive: t("models.card.bookTestDrive"),
          }}
        />
      </Suspense>
    </MarketingLayout>
  );
}
