import Link from "next/link";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getFeaturedCars, getHomepageContent } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [featuredCars, homepageContent] = await Promise.all([getFeaturedCars(), getHomepageContent()]);

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

  return (
    <MarketingLayout>
      <section className="container-shell pt-16 pb-16 md:pt-24">
        <div className="hero-shine relative overflow-hidden rounded-3xl border border-border/60 p-8 md:p-14">
          <div className="absolute -top-16 -right-10 h-52 w-52 rounded-full bg-primary/10 blur-3xl" />
          <p className="text-sm font-semibold tracking-[0.18em] text-primary uppercase">{hero.eyebrow}</p>
          <h1 className="font-display mt-3 max-w-3xl text-4xl leading-tight font-semibold md:text-6xl">
            {hero.title}
          </h1>
          <p className="mt-5 max-w-2xl text-base text-muted-foreground md:text-lg">{hero.subtitle}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href={hero.primaryCta?.href ?? "/book-test-drive"}>
              <Button size="lg">{hero.primaryCta?.label ?? "Book a test drive"}</Button>
            </Link>
            <Link href={hero.secondaryCta?.href ?? "/models"}>
              <Button size="lg" variant="outline">
                {hero.secondaryCta?.label ?? "Explore models"}
              </Button>
            </Link>
          </div>
        </div>
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
              <Card key={car.id} className="overflow-hidden py-0">
                <div
                  className="h-44 w-full"
                  style={{
                    backgroundImage: `linear-gradient(145deg, rgba(255,255,255,0.4), rgba(15, 118, 110, 0.2)), url(${car.images[0] ?? ""})`,
                    backgroundColor: "#dbe4ec",
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                  }}
                />
                <CardHeader>
                  <CardTitle className="font-display text-xl">{car.name}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{car.description}</p>
                  <Link href={`/models/${car.slug}`} className="mt-4 inline-flex">
                    <Button variant="outline">See details</Button>
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
