import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getCarBySlug } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

function formatPrice(priceFrom: number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(priceFrom);
}

type ModelDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: ModelDetailPageProps): Promise<Metadata> {
  const { slug } = await params;
  const car = await getCarBySlug(slug);

  if (!car) {
    return { title: "Model not found" };
  }

  return {
    title: car.name,
    description: car.description,
  };
}

export default async function ModelDetailPage({ params }: ModelDetailPageProps) {
  const { slug } = await params;
  const car = await getCarBySlug(slug);

  if (!car) {
    notFound();
  }

  return (
    <MarketingLayout>
      <section className="container-shell py-12">
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/models">
          Back to models
        </Link>
        <div className="mt-4 grid gap-8 lg:grid-cols-[1.2fr_0.8fr]">
          <div className="space-y-4">
            <div className="hero-shine rounded-3xl border border-border/60 p-8">
              <Badge className="mb-4" variant="secondary">
                {car.bodyType}
              </Badge>
              <h1 className="font-display text-4xl font-semibold">{car.name}</h1>
              <p className="mt-4 max-w-2xl text-muted-foreground">{car.description}</p>
              <p className="mt-6 text-xl font-semibold">From {formatPrice(car.priceFrom)}</p>
              <Link href={`/book-test-drive?model=${car.slug}`} className="mt-6 inline-flex">
                <Button size="lg">Book a test drive</Button>
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

          <Card>
            <CardHeader>
              <CardTitle className="font-display text-2xl">Key specs</CardTitle>
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
