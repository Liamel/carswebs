import Link from "next/link";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type SuccessPageProps = {
  searchParams: Promise<{ booking?: string }>;
};

export default async function BookingSuccessPage({ searchParams }: SuccessPageProps) {
  const params = await searchParams;

  return (
    <MarketingLayout>
      <section className="container-shell py-16">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="font-display text-3xl">Booking request received</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>
              Your test drive request has been submitted. Our team will contact you shortly with final confirmation.
            </p>
            {params.booking ? <p className="text-sm">Reference: #{params.booking}</p> : null}
            <div className="flex gap-2">
              <Link href="/models">
                <Button variant="outline">Browse models</Button>
              </Link>
              <Link href="/">
                <Button>Back home</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingLayout>
  );
}
