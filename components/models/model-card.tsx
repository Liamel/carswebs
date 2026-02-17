import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Car } from "@/lib/db/schema";
import type { Locale } from "@/lib/i18n/config";
import { getLocalizedCarDescription, getLocalizedCarName } from "@/lib/i18n/cars";
import { withLocalePath } from "@/lib/i18n/path";
import { formatUsdPrice } from "@/lib/i18n/price";

type ModelCardProps = {
  car: Car;
  locale: Locale;
  bodyTypeLabel: string;
  labels: {
    featured: string;
    from: string;
    viewDetails: string;
    bookTestDrive: string;
  };
  modelsQueryString?: string;
};

export function ModelCard({ car, locale, bodyTypeLabel, labels, modelsQueryString }: ModelCardProps) {
  const image = car.images[0] ?? "/models/placeholder.jpg";
  const detailPath = modelsQueryString ? `/models/${car.slug}?${modelsQueryString}` : `/models/${car.slug}`;
  const detailHref = withLocalePath(locale, detailPath);
  const bookingHref = withLocalePath(locale, `/book-test-drive?model=${car.slug}`);

  return (
    <Card className="h-full overflow-hidden border-border/60 py-0">
      <div className="hero-shine border-b border-border/60 p-4">
        <div
          className="h-44 w-full"
          style={{
            backgroundImage: image ? `url(${image})` : undefined,
            backgroundSize: "contain",
            backgroundPosition: "center",
            backgroundRepeat: "no-repeat",
          }}
        />
      </div>
      <CardHeader className="pb-0">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-display line-clamp-2 text-3xl leading-tight capitalize">
            {getLocalizedCarName(car, locale)}
          </CardTitle>
          {car.featured ? <Badge variant="success">{labels.featured}</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">
          {getLocalizedCarDescription(car, locale)}
        </p>
        <div className="mt-auto flex items-center justify-between gap-3 text-sm">
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{bodyTypeLabel}</span>
          <span className="text-right font-semibold">
            {labels.from} {formatUsdPrice(car.priceFrom, locale)}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pb-5">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          <Link className="min-w-0" href={detailHref}>
            <Button className="w-full whitespace-normal px-4 text-sm leading-tight" variant="outline">
              {labels.viewDetails}
            </Button>
          </Link>
          <Link className="min-w-0" href={bookingHref}>
            <Button className="w-full whitespace-normal px-4 text-sm leading-tight">{labels.bookTestDrive}</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
