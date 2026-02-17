import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCarBySlug } from "@/lib/db/queries";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { getBodyTypeTranslationKey } from "@/lib/i18n/body-type";
import { getLocalizedCarDescription, getLocalizedCarName } from "@/lib/i18n/cars";
import { parseLocaleOrNotFound } from "@/lib/i18n/locale-param";
import { withLocalePath } from "@/lib/i18n/path";
import { formatUsdPrice } from "@/lib/i18n/price";
import { getTranslator } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type ModelDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
  searchParams: Promise<{ search?: string; type?: string | string[]; featured?: string }>;
};

export async function generateMetadata({ params }: ModelDetailPageProps): Promise<Metadata> {
  const { locale: rawLocale, slug } = await params;
  const locale = parseLocaleOrNotFound(rawLocale);
  const car = await getCarBySlug(slug);

  if (!car) {
    const { t } = await getTranslator(locale);

    return buildLocalizedMetadata({
      locale,
      pathname: `/models/${slug}`,
      title: t("models.detail.notFoundTitle"),
      description: t("models.detail.notFoundDescription"),
    });
  }

  return buildLocalizedMetadata({
    locale,
    pathname: `/models/${slug}`,
    title: getLocalizedCarName(car, locale),
    description: getLocalizedCarDescription(car, locale),
  });
}

function appendMultiValue(searchParams: URLSearchParams, key: string, value: string | string[] | undefined) {
  if (!value) {
    return;
  }

  const values = Array.isArray(value) ? value : [value];

  for (const entry of values.map((item) => item.trim()).filter(Boolean)) {
    searchParams.append(key, entry);
  }
}

export default async function ModelDetailPage({ params, searchParams }: ModelDetailPageProps) {
  const [{ locale: rawLocale, slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  const locale = parseLocaleOrNotFound(rawLocale);
  const [car, { t }] = await Promise.all([getCarBySlug(slug), getTranslator(locale)]);

  if (!car) {
    redirect(withLocalePath(locale, "/models"));
  }

  const modelsQueryParams = new URLSearchParams();

  if (typeof resolvedSearchParams.search === "string" && resolvedSearchParams.search.trim()) {
    modelsQueryParams.set("search", resolvedSearchParams.search.trim());
  }

  appendMultiValue(modelsQueryParams, "type", resolvedSearchParams.type);

  if (resolvedSearchParams.featured === "1") {
    modelsQueryParams.set("featured", "1");
  }

  const backToModelsPath = modelsQueryParams.toString() ? `/models?${modelsQueryParams.toString()}` : "/models";
  const backToModelsHref = withLocalePath(locale, backToModelsPath);
  const bodyTypeKey = getBodyTypeTranslationKey(car.bodyType);
  const bodyTypeLabel = bodyTypeKey ? t(bodyTypeKey) : car.bodyType;

  return (
    <MarketingLayout locale={locale}>
      <section className="container-shell py-12">
        <Link className="text-sm text-muted-foreground hover:text-foreground" href={backToModelsHref}>
          {t("models.detail.back")}
        </Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="hero-shine rounded-3xl border border-border/60 p-8">
              <Badge className="mb-4" variant="secondary">
                {bodyTypeLabel}
              </Badge>
              <h1 className="font-display text-4xl font-semibold capitalize">{getLocalizedCarName(car, locale)}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {getLocalizedCarDescription(car, locale)}
              </p>
              <p className="mt-6 text-xl font-semibold">
                {t("common.from")} {formatUsdPrice(car.priceFrom, locale)}
              </p>
              <Link href={withLocalePath(locale, `/book-test-drive?model=${car.slug}`)} className="mt-6 inline-flex">
                <Button size="lg">{t("models.card.bookTestDrive")}</Button>
              </Link>
            </div>

            <div className="grid gap-3 sm:grid-cols-3">
              {(car.images.length ? car.images : ["", "", ""]).slice(0, 3).map((image, index) => (
                <div
                  key={`${car.slug}-${index}`}
                  className="h-40 rounded-2xl border border-border/70 bg-muted"
                  style={{
                    backgroundImage: image
                      ? `linear-gradient(145deg, rgba(255,255,255,0.35), rgba(15, 118, 110, 0.18)), url(${image})`
                      : undefined,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
              ))}
            </div>
          </div>

          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle className="font-display text-2xl">{t("models.detail.keySpecs")}</CardTitle>
            </CardHeader>
            <CardContent>
              <dl className="space-y-3">
                {Object.entries(car.specs).map(([key, value]) => (
                  <div key={key} className="flex items-center justify-between border-b border-border/70 pb-2 text-sm">
                    <dt className="text-muted-foreground">{key}</dt>
                    <dd className="font-medium">{value}</dd>
                  </div>
                ))}
              </dl>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
