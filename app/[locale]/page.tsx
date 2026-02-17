import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";

import { HomepageSlider, type HomepageSlide } from "@/components/site/homepage-slider";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveHomepageSlides, getFeaturedCars } from "@/lib/db/queries";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { getBodyTypeTranslationKey } from "@/lib/i18n/body-type";
import { getLocalizedCarDescription, getLocalizedCarName } from "@/lib/i18n/cars";
import { resolveLocaleParam } from "@/lib/i18n/locale-param";
import { withLocalePath } from "@/lib/i18n/path";
import { formatUsdPrice } from "@/lib/i18n/price";
import { getTranslator } from "@/lib/i18n/server";

export const revalidate = 300;

type HomePageProps = {
  params: Promise<{ locale: string }>;
};

export async function generateMetadata({ params }: HomePageProps): Promise<Metadata> {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return buildLocalizedMetadata({
    locale,
    pathname: "/",
    title: t("meta.home.title"),
    description: t("meta.home.description"),
  });
}

export default async function HomePage({ params }: HomePageProps) {
  const locale = await resolveLocaleParam(params);
  const [featuredCars, activeSlides, { t }] = await Promise.all([
    getFeaturedCars(),
    getActiveHomepageSlides(),
    getTranslator(locale),
  ]);

  const heroSlides: HomepageSlide[] = activeSlides.length
    ? activeSlides.map((slide) => ({
        title: t("home.hero.title"),
        description: t("home.hero.subtitle"),
        imageUrl: slide.imageUrl,
        ctaLabel: t("home.hero.primaryCta"),
        ctaHref: slide.ctaHref ? withLocalePath(locale, slide.ctaHref) : withLocalePath(locale, "/models"),
      }))
    : [
        {
          title: t("home.hero.title"),
          description: t("home.hero.subtitle"),
          imageUrl:
            featuredCars[0]?.images[0] ??
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80",
          ctaHref: withLocalePath(locale, "/models"),
          ctaLabel: t("home.hero.primaryCta"),
        } satisfies HomepageSlide,
      ];

  const highlights = [
    {
      title: t("home.highlights.1.title"),
      description: t("home.highlights.1.description"),
    },
    {
      title: t("home.highlights.2.title"),
      description: t("home.highlights.2.description"),
    },
    {
      title: t("home.highlights.3.title"),
      description: t("home.highlights.3.description"),
    },
  ];

  return (
    <MarketingLayout locale={locale}>
      <section className="container-shell pt-16 pb-16 md:pt-24">
        <HomepageSlider
          slides={heroSlides}
          labels={{
            regionAriaLabel: t("home.slider.regionAria"),
            goToSlideAriaTemplate: t("home.slider.goToSlideAria"),
          }}
        />
      </section>

      <section className="container-shell pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm text-primary">{t("home.featured.eyebrow")}</p>
            <h2 className="font-display text-3xl font-semibold">{t("home.featured.title")}</h2>
          </div>
          <Link
            className="text-sm font-medium text-muted-foreground hover:text-foreground"
            href={withLocalePath(locale, "/models")}
          >
            {t("home.featured.viewAll")}
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredCars.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">{t("home.featured.empty")}</CardContent>
            </Card>
          ) : (
            featuredCars.map((car) => {
              const bodyTypeKey = getBodyTypeTranslationKey(car.bodyType);
              const bodyTypeLabel = bodyTypeKey ? t(bodyTypeKey) : car.bodyType;
              const localizedName = getLocalizedCarName(car, locale);
              const localizedDescription = getLocalizedCarDescription(car, locale);

              return (
                <Card key={car.id} className="h-full overflow-hidden border-border/60 py-0">
                  <div className="hero-shine border-b border-border/60">
                    <div className="relative h-60 w-full">
                      {car.images[0] ? (
                        <Image
                          src={car.images[0]}
                          alt={localizedName}
                          fill
                          sizes="(max-width: 768px) 100vw, 33vw"
                          className="object-cover"
                        />
                      ) : null}
                    </div>
                  </div>
                  <CardHeader className="pb-0">
                    <CardTitle className="font-display line-clamp-2 text-3xl leading-tight capitalize">
                      {localizedName}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col gap-4">
                    <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{localizedDescription}</p>
                    <div className="mt-auto flex items-center justify-between gap-3 text-sm">
                      <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{bodyTypeLabel}</span>
                      <span className="font-semibold">
                        {t("common.from")} {formatUsdPrice(car.priceFrom, locale)}
                      </span>
                    </div>
                    <Link href={withLocalePath(locale, `/models/${car.slug}`)} className="my-4 inline-flex">
                      <Button variant="outline" className="whitespace-normal px-4 leading-tight">
                        {t("home.featured.details")}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              );
            })
          )}
        </div>
      </section>

      <section className="container-shell pb-12">
        <h2 className="font-display text-3xl font-semibold">{t("home.highlights.title")}</h2>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {highlights.map((item, index) => (
            <Card key={`${item.title}-${index}`}>
              <CardHeader>
                <CardTitle className="font-display text-xl">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>
    </MarketingLayout>
  );
}
