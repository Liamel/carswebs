import type { Metadata } from "next";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "About",
  description: "Learn about Astra Motors and our approach to modern mobility.",
};

export default function AboutPage() {
  return (
    <MarketingLayout>
      <section className="container-shell py-14 md:py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Built for modern movement</h1>
        <p className="mt-4 max-w-3xl text-muted-foreground">
          Astra Motors develops practical vehicles with a premium feel: efficient platforms, clean design, and software-first cabin experiences.
        </p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>Design language</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Contemporary silhouettes with aerodynamic detailing and durable material choices.
            </CardContent>
          </Card>
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>Engineering focus</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Tuned suspensions, low-noise cabins, and safety-first electrical architecture.
            </CardContent>
          </Card>
          <Card className="bg-white/92">
            <CardHeader>
              <CardTitle>After-sales care</CardTitle>
            </CardHeader>
            <CardContent className="text-sm text-muted-foreground">
              Nationwide support teams, digital service booking, and transparent maintenance plans.
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
