import Link from "next/link";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import type { Car } from "@/lib/db/schema";

function formatPrice(priceFrom: number) {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
    priceFrom,
  );
}

type ModelCardProps = {
  car: Car;
  modelsQueryString?: string;
};

export function ModelCard({ car, modelsQueryString }: ModelCardProps) {
  const image = car.images[0] ?? "/models/placeholder.jpg";
  const detailHref = modelsQueryString ? `/models/${car.slug}?${modelsQueryString}` : `/models/${car.slug}`;

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
          <CardTitle className="font-display line-clamp-2 text-3xl leading-tight capitalize">{car.name}</CardTitle>
          {car.featured ? <Badge variant="success">Featured</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-4">
        <p className="line-clamp-3 text-sm leading-relaxed text-muted-foreground">{car.description}</p>
        <div className="mt-auto flex items-center justify-between gap-3 text-sm">
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{car.bodyType}</span>
          <span className="text-right font-semibold">From {formatPrice(car.priceFrom)}</span>
        </div>
      </CardContent>
      <CardFooter className="pb-5">
        <div className="grid w-full grid-cols-1 gap-2 sm:grid-cols-2">
          <Link className="min-w-0" href={detailHref}>
            <Button className="w-full whitespace-normal px-4 text-sm leading-tight" variant="outline">
              View details
            </Button>
          </Link>
          <Link className="min-w-0" href={`/book-test-drive?model=${car.slug}`}>
            <Button className="w-full whitespace-normal px-4 text-sm leading-tight">Book test drive</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
