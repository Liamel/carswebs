import Link from "next/link";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <MarketingLayout>
      <section className="container-shell py-24 text-center">
        <p className="text-sm text-primary">404</p>
        <h1 className="font-display mt-2 text-4xl font-semibold">Page not found</h1>
        <p className="mt-3 text-muted-foreground">The page you requested does not exist.</p>
        <Link className="mt-6 inline-flex" href="/">
          <Button>Back home</Button>
        </Link>
      </section>
    </MarketingLayout>
  );
}
