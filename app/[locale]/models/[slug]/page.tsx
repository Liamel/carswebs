import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import { redirect } from "next/navigation";

import { FinanceCalculator } from "@/components/finance/finance-calculator";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCarBySlug, getCarSlugs } from "@/lib/db/queries";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { getBodyTypeTranslationKey } from "@/lib/i18n/body-type";
import { getLocalizedCarDescription, getLocalizedCarName } from "@/lib/i18n/cars";
import { parseLocaleOrNotFound } from "@/lib/i18n/locale-param";
import { withLocalePath } from "@/lib/i18n/path";
import { formatUsdPrice } from "@/lib/i18n/price";
import { getTranslator } from "@/lib/i18n/server";

export const dynamicParams = true;
export const revalidate = 300;
export const dynamic = "force-static";

type ModelDetailPageProps = {
  params: Promise<{ locale: string; slug: string }>;
};

export async function generateStaticParams() {
  const rows = await getCarSlugs();
  return SUPPORTED_LOCALES.flatMap((locale) => rows.map(({ slug }) => ({ locale, slug })));
}

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

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { locale: rawLocale, slug } = await params;
  const locale = parseLocaleOrNotFound(rawLocale);
  const [car, { t }] = await Promise.all([getCarBySlug(slug), getTranslator(locale)]);

  if (!car) {
    redirect(withLocalePath(locale, "/models"));
  }
  const backToModelsHref = withLocalePath(locale, "/models");
  const bodyTypeKey = getBodyTypeTranslationKey(car.bodyType);
  const bodyTypeLabel = bodyTypeKey ? t(bodyTypeKey) : car.bodyType;
  const localizedCarName = getLocalizedCarName(car, locale);
  const localizedCarDescription = getLocalizedCarDescription(car, locale);

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
              <h1 className="font-display text-4xl font-semibold capitalize">{localizedCarName}</h1>
              <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted-foreground">
                {localizedCarDescription}
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
                  className="relative h-40 overflow-hidden rounded-2xl border border-border/70 bg-muted"
                >
                  {image ? (
                    <>
                      <Image
                        src={image}
                        alt={`${localizedCarName} ${index + 1}`}
                        fill
                        sizes="(max-width: 640px) 100vw, 33vw"
                        className="object-cover"
                      />
                      <div
                        className="absolute inset-0"
                        style={{
                          backgroundImage: "linear-gradient(145deg, rgba(255,255,255,0.35), rgba(15, 118, 110, 0.18))",
                        }}
                      />
                    </>
                  ) : null}
                </div>
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

        <div className="mt-8">
          <FinanceCalculator
            locale={locale}
            mode="full"
            currency="USD"
            context={{ carName: localizedCarName, slug: car.slug }}
            defaultPrice={car.priceFrom}
            defaultDownPaymentMode="percent"
            defaultDownPaymentValue={15}
            defaultAprPercent={6.9}
            defaultTermMonths={60}
            defaultTradeInValue={0}
            defaultFees={0}
            labels={{
              title: t("finance.title"),
              subtitle: t("finance.subtitle"),
              expandAriaLabel: t("finance.toggle.expandAria"),
              collapseAriaLabel: t("finance.toggle.collapseAria"),
              vehiclePriceLabel: t("finance.fields.vehiclePrice"),
              downPaymentLabel: t("finance.fields.downPayment"),
              downPaymentModeAmount: t("finance.fields.downPaymentModeAmount"),
              downPaymentModePercent: t("finance.fields.downPaymentModePercent"),
              loanTermLabel: t("finance.fields.loanTerm"),
              aprLabel: t("finance.fields.apr"),
              advancedToggleShow: t("finance.fields.advancedShow"),
              advancedToggleHide: t("finance.fields.advancedHide"),
              tradeInLabel: t("finance.fields.tradeIn"),
              feesLabel: t("finance.fields.fees"),
              monthlyPaymentLabel: t("finance.results.monthlyPayment"),
              loanPrincipalLabel: t("finance.results.loanPrincipal"),
              totalPaidLabel: t("finance.results.totalPaid"),
              totalInterestLabel: t("finance.results.totalInterest"),
              validationSummaryLabel: t("finance.validation.title"),
              validationPrincipalPositive: t("finance.validation.principalPositive"),
              validationAprNonNegative: t("finance.validation.aprNonNegative"),
              validationTermPositive: t("finance.validation.termPositive"),
              amortizationTitle: t("finance.schedule.title"),
              amortizationDescription: t("finance.schedule.description"),
              monthLabel: t("finance.schedule.month"),
              principalPaidLabel: t("finance.schedule.principalPaid"),
              interestPaidLabel: t("finance.schedule.interestPaid"),
              remainingBalanceLabel: t("finance.schedule.remainingBalance"),
              termUnit: t("finance.fields.termUnit"),
            }}
          />
        </div>
      </section>
    </MarketingLayout>
  );
}
