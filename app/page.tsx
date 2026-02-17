import Link from "next/link";

import { HomepageSlider, type HomepageSlide } from "@/components/site/homepage-slider";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getActiveHomepageSlides, getFeaturedCars, getHomepageContent } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

function formatPrice(priceFrom: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceFrom);
}

export default async function HomePage() {
  const [featuredCars, homepageContent, activeSlides] = await Promise.all([
    getFeaturedCars(),
    getHomepageContent(),
    getActiveHomepageSlides(),
  ]);

  const hero = homepageContent.hero as {
    eyebrow?: string;
    title?: string;
    subtitle?: string;
    primaryCta?: { label?: string; href?: string };
    secondaryCta?: { label?: string; href?: string };
  };

  const highlights = Array.isArray(homepageContent.highlights)
    ? (homepageContent.highlights as Array<{ title?: string; description?: string }>)
    : [];
  const heroSlides = activeSlides.length
    ? activeSlides.map(
        (slide): HomepageSlide => ({
          title: slide.title,
          description: slide.description ?? hero.subtitle ?? "",
          imageUrl: slide.imageUrl,
          ctaLabel: slide.ctaLabel ?? "View model",
          ctaHref: slide.ctaHref ?? "/models",
        }),
      )
    : [
        {
          title: hero.title ?? "Precision engineered for daily confidence.",
          description:
            hero.subtitle ??
            "From compact city crossovers to family-ready SUVs, Astra Motors blends comfort, safety, and electric-ready performance.",
          imageUrl:
            featuredCars[0]?.images[0] ??
            "https://images.unsplash.com/photo-1511919884226-fd3cad34687c?auto=format&fit=crop&w=1600&q=80",
          ctaHref: hero.primaryCta?.href ?? "/models",
          ctaLabel: hero.primaryCta?.label ?? "Explore models",
        } satisfies HomepageSlide,
      ];

  return (
    <MarketingLayout>
      <section className="container-shell pt-16 pb-16 md:pt-24">
        <HomepageSlider slides={heroSlides} />
      </section>

      <section className="container-shell pb-16">
        <div className="mb-8 flex items-end justify-between">
          <div>
            <p className="text-sm text-primary">Featured range</p>
            <h2 className="font-display text-3xl font-semibold">Drive what fits your next chapter</h2>
          </div>
          <Link className="text-sm font-medium text-muted-foreground hover:text-foreground" href="/models">
            View all models
          </Link>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {featuredCars.length === 0 ? (
            <Card>
              <CardContent className="pt-6 text-sm text-muted-foreground">
                No featured models yet. Add them from the admin CMS.
              </CardContent>
            </Card>
          ) : (
            featuredCars.map((car) => (
              <Card key={car.id} className="h-full overflow-hidden border-border/60 py-0">
                <div className="hero-shine border-b border-border/60 p-4">
                  <div
                    className="h-40 w-full"
                    style={{
                      backgroundImage: car.images[0] ? `url(${car.images[0]})` : undefined,
                      backgroundSize: "contain",
                      backgroundPosition: "center",
                      backgroundRepeat: "no-repeat",
                    }}
                  />
                </div>
                <CardHeader className="pb-0">
                  <CardTitle className="font-display line-clamp-2 text-3xl leading-tight capitalize">{car.name}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col gap-4">
                  <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{car.description}</p>
                  <div className="mt-auto flex items-center justify-between gap-3 text-sm">
                    <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{car.bodyType}</span>
                    <span className="font-semibold">From {formatPrice(car.priceFrom)}</span>
                  </div>
                  <Link href={`/models/${car.slug}`} className="my-4 inline-flex">
                    <Button variant="outline" className="whitespace-normal px-4 leading-tight">
                      See details
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            ))
          )}
        </div>
      </section>

      <section className="container-shell pb-12">
        <h2 className="font-display text-3xl font-semibold">Why drivers choose Astra</h2>
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
