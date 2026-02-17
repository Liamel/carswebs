import type { Metadata } from "next";
import Link from "next/link";

import { MarketingLayout } from "@/components/site/marketing-layout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { resolveLocaleParam } from "@/lib/i18n/locale-param";
import { withLocalePath } from "@/lib/i18n/path";
import { getTranslator } from "@/lib/i18n/server";

type SuccessPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ booking?: string }>;
};

export async function generateMetadata({ params }: SuccessPageProps): Promise<Metadata> {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return buildLocalizedMetadata({
    locale,
    pathname: "/book-test-drive/success",
    title: t("meta.bookingSuccess.title"),
    description: t("meta.bookingSuccess.description"),
  });
}

export default async function BookingSuccessPage({ params, searchParams }: SuccessPageProps) {
  const locale = await resolveLocaleParam(params);
  const resolvedSearchParams = await searchParams;
  const { t } = await getTranslator(locale);

  return (
    <MarketingLayout locale={locale}>
      <section className="container-shell py-16">
        <Card className="mx-auto max-w-2xl">
          <CardHeader>
            <CardTitle className="font-display text-3xl">{t("booking.success.title")}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4 text-muted-foreground">
            <p>{t("booking.success.description")}</p>
            {resolvedSearchParams.booking ? (
              <p className="text-sm">{t("booking.success.reference", { id: resolvedSearchParams.booking })}</p>
            ) : null}
            <div className="flex gap-2">
              <Link href={withLocalePath(locale, "/models")}>
                <Button variant="outline">{t("booking.success.browseModels")}</Button>
              </Link>
              <Link href={withLocalePath(locale, "/")}>
                <Button>{t("booking.success.backHome")}</Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </section>
    </MarketingLayout>
  );
}
