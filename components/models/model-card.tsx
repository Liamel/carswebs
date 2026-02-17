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
};

export function ModelCard({ car }: ModelCardProps) {
  const image = car.images[0] ?? "/models/placeholder.jpg";

  return (
    <Card className="overflow-hidden border-border/60 py-0">
      <div
        className="hero-shine h-48 w-full"
        style={{
          backgroundImage: `linear-gradient(145deg, rgba(255,255,255,0.4), rgba(15, 118, 110, 0.16)), url(${image})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
        }}
      />
      <CardHeader className="pb-1">
        <div className="flex items-start justify-between gap-3">
          <CardTitle className="font-display text-xl">{car.name}</CardTitle>
          {car.featured ? <Badge variant="success">Featured</Badge> : null}
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground">{car.description}</p>
        <div className="flex items-center justify-between text-sm">
          <span className="rounded-full bg-muted px-3 py-1 text-muted-foreground">{car.bodyType}</span>
          <span className="font-semibold">From {formatPrice(car.priceFrom)}</span>
        </div>
      </CardContent>
      <CardFooter>
        <div className="flex w-full gap-2">
          <Link className="flex-1" href={`/models/${car.slug}`}>
            <Button className="w-full" variant="outline">
              View details
            </Button>
          </Link>
          <Link className="flex-1" href={`/book-test-drive?model=${car.slug}`}>
            <Button className="w-full">Book test drive</Button>
          </Link>
        </div>
      </CardFooter>
    </Card>
  );
}
