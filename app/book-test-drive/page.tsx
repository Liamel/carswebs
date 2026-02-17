import type { Metadata } from "next";

import { BookingForm } from "@/components/bookings/booking-form";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getModelOptions } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Book Test Drive",
  description: "Book a test drive with Astra Motors and choose your preferred model, location, and date.",
};

type BookTestDrivePageProps = {
  searchParams: Promise<{ model?: string }>;
};

export default async function BookTestDrivePage({ searchParams }: BookTestDrivePageProps) {
  const params = await searchParams;
  const models = await getModelOptions();

  return (
    <MarketingLayout>
      <section className="container-shell py-14 md:py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Book a test drive</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">
          Share your preferred model and schedule. Our team will confirm your booking and walk you through available trims.
        </p>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="bg-white/92">
            <CardContent className="pt-6">
              <BookingForm models={models} defaultModel={params.model} />
            </CardContent>
          </Card>
          <Card className="hero-shine">
            <CardHeader>
              <CardTitle className="font-display text-2xl">What happens next?</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>1. We review your preferred date and model.</p>
              <p>2. A sales advisor confirms availability by email or phone.</p>
              <p>3. You receive final visit details and route information.</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
