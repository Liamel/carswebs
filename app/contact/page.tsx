import type { Metadata } from "next";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with Astra Motors sales and service teams.",
};

export default function ContactPage() {
  return (
    <MarketingLayout>
      <section className="container-shell py-14">
        <h1 className="font-display text-4xl font-semibold">Contact Astra Motors</h1>
        <p className="mt-3 text-muted-foreground">Speak with sales, service, or fleet advisors.</p>
        <div className="mt-8 grid gap-4 md:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Sales desk</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>sales@astramotors.example</p>
              <p>+1 (555) 018-4040</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Service center</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>service@astramotors.example</p>
              <p>+1 (555) 018-4041</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle>Visit us</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2 text-sm text-muted-foreground">
              <p>211 Harbor Avenue</p>
              <p>Austin, TX 78701</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
