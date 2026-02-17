import type { Metadata } from "next";

import { BookingForm } from "@/components/bookings/booking-form";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getModelOptions } from "@/lib/db/queries";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { resolveLocaleParam } from "@/lib/i18n/locale-param";
import { getTranslator } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type BookTestDrivePageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ model?: string }>;
};

export async function generateMetadata({ params }: BookTestDrivePageProps): Promise<Metadata> {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return buildLocalizedMetadata({
    locale,
    pathname: "/book-test-drive",
    title: t("meta.booking.title"),
    description: t("meta.booking.description"),
  });
}

export default async function BookTestDrivePage({ params, searchParams }: BookTestDrivePageProps) {
  const locale = await resolveLocaleParam(params);
  const resolvedSearchParams = await searchParams;
  const [models, { t }] = await Promise.all([getModelOptions(locale), getTranslator(locale)]);

  return (
    <MarketingLayout locale={locale}>
      <section className="container-shell py-14 md:py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{t("booking.title")}</h1>
        <p className="mt-3 max-w-3xl text-muted-foreground">{t("booking.subtitle")}</p>

        <div className="mt-8 grid gap-5 lg:grid-cols-[1.2fr_0.8fr]">
          <Card className="bg-white/92">
            <CardContent className="pt-6">
              <BookingForm
                locale={locale}
                models={models}
                defaultModel={resolvedSearchParams.model}
                labels={{
                  submit: t("booking.form.submit"),
                  submitting: t("booking.form.submitting"),
                  nameLabel: t("booking.form.name"),
                  emailLabel: t("booking.form.email"),
                  phoneLabel: t("booking.form.phone"),
                  preferredModelLabel: t("booking.form.preferredModel"),
                  anyModelOption: t("booking.form.anyModel"),
                  preferredDateLabel: t("booking.form.preferredDate"),
                  preferredTimeLabel: t("booking.form.preferredTime"),
                  selectTimeSlotOption: t("booking.form.selectTimeSlot"),
                  availableWindow: t("booking.form.availableWindow"),
                  noSlotsToday: t("booking.form.noSlotsToday"),
                  locationLabel: t("booking.form.location"),
                  locationPlaceholder: t("booking.form.locationPlaceholder"),
                  noteLabel: t("booking.form.note"),
                }}
              />
            </CardContent>
          </Card>
          <Card className="hero-shine">
            <CardHeader>
              <CardTitle className="font-display text-2xl">{t("booking.nextSteps.title")}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-sm text-muted-foreground">
              <p>{t("booking.nextSteps.step1")}</p>
              <p>{t("booking.nextSteps.step2")}</p>
              <p>{t("booking.nextSteps.step3")}</p>
            </CardContent>
          </Card>
        </div>
      </section>
    </MarketingLayout>
  );
}
