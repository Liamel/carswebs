import type { Metadata } from "next";
import Link from "next/link";

import { ModelCard } from "@/components/models/model-card";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Button } from "@/components/ui/button";
import { getBodyTypes, getCars } from "@/lib/db/queries";
import { buildLocalizedMetadata } from "@/lib/i18n/metadata";
import { getBodyTypeTranslationKey } from "@/lib/i18n/body-type";
import { resolveLocaleParam } from "@/lib/i18n/locale-param";
import { withLocalePath } from "@/lib/i18n/path";
import { getTranslator } from "@/lib/i18n/server";

export const dynamic = "force-dynamic";

type ModelsPageSearchParams = {
  search?: string;
  type?: string | string[];
  featured?: string;
};

type ModelsPageProps = {
  params: Promise<{ locale: string }>;
  searchParams: Promise<ModelsPageSearchParams>;
};

function parseMultiValue(value: string | string[] | undefined) {
  if (!value) {
    return [];
  }

  return Array.isArray(value)
    ? value.map((item) => item.trim()).filter(Boolean)
    : [value.trim()].filter(Boolean);
}

export async function generateMetadata({ params }: ModelsPageProps): Promise<Metadata> {
  const locale = await resolveLocaleParam(params);
  const { t } = await getTranslator(locale);

  return buildLocalizedMetadata({
    locale,
    pathname: "/models",
    title: t("meta.models.title"),
    description: t("meta.models.description"),
  });
}

export default async function ModelsPage({ params, searchParams }: ModelsPageProps) {
  const locale = await resolveLocaleParam(params);
  const resolvedSearchParams = await searchParams;
  const search = typeof resolvedSearchParams.search === "string" ? resolvedSearchParams.search.trim() : "";
  const selectedTypes = [...new Set(parseMultiValue(resolvedSearchParams.type))];
  const featuredOnly = resolvedSearchParams.featured === "1";

  const [cars, bodyTypes, { t }] = await Promise.all([
    getCars(
      {
        search: search || undefined,
        bodyTypes: selectedTypes,
        featuredOnly,
      },
      locale,
    ),
    getBodyTypes(),
    getTranslator(locale),
  ]);

  const detailQuery = new URLSearchParams();
  if (search) {
    detailQuery.set("search", search);
  }
  for (const type of selectedTypes) {
    detailQuery.append("type", type);
  }
  if (featuredOnly) {
    detailQuery.set("featured", "1");
  }

  return (
    <MarketingLayout locale={locale}>
      <section className="container-shell py-14 md:py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{t("models.title")}</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted-foreground">{t("models.subtitle")}</p>

        <div className="mt-8 grid gap-6 xl:grid-cols-[300px_1fr]">
          <aside>
            <form
              method="GET"
              className="space-y-5 rounded-2xl border border-border/70 bg-white/85 p-5 shadow-sm xl:sticky xl:top-24"
            >
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  {t("models.filters.searchLabel")}
                </label>
                <input
                  id="search"
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder={t("models.filters.searchPlaceholder")}
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-xs"
                />
              </div>

              <fieldset className="space-y-2 border-t border-border/70 pt-4">
                <legend className="text-sm font-medium">{t("models.filters.vehicleType")}</legend>
                <div className="space-y-2">
                  {bodyTypes.map((type) => {
                    const bodyTypeKey = getBodyTypeTranslationKey(type);
                    const label = bodyTypeKey ? t(bodyTypeKey) : type;

                    return (
                      <label key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                        <input
                          type="checkbox"
                          name="type"
                          value={type}
                          defaultChecked={selectedTypes.includes(type)}
                          className="h-4 w-4 rounded border-border accent-primary"
                        />
                        {label}
                      </label>
                    );
                  })}
                </div>
              </fieldset>

              <label className="flex items-center gap-2 border-t border-border/70 pt-4 text-sm text-muted-foreground">
                <input
                  type="checkbox"
                  name="featured"
                  value="1"
                  defaultChecked={featuredOnly}
                  className="h-4 w-4 rounded border-border accent-primary"
                />
                {t("models.filters.featuredOnly")}
              </label>

              <div className="grid grid-cols-2 gap-2">
                <Button type="submit" className="w-full">
                  {t("models.filters.apply")}
                </Button>
                <Link href={withLocalePath(locale, "/models")} className="min-w-0">
                  <Button type="button" variant="outline" className="w-full">
                    {t("models.filters.reset")}
                  </Button>
                </Link>
              </div>
            </form>
          </aside>

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">{t("models.showingCount", { count: cars.length })}</p>

            <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {cars.map((car) => {
                const bodyTypeKey = getBodyTypeTranslationKey(car.bodyType);
                const bodyTypeLabel = bodyTypeKey ? t(bodyTypeKey) : car.bodyType;

                return (
                  <ModelCard
                    key={car.id}
                    car={car}
                    locale={locale}
                    bodyTypeLabel={bodyTypeLabel}
                    labels={{
                      featured: t("models.card.featured"),
                      from: t("common.from"),
                      viewDetails: t("models.card.viewDetails"),
                      bookTestDrive: t("models.card.bookTestDrive"),
                    }}
                    modelsQueryString={detailQuery.toString()}
                  />
                );
              })}
            </div>

            {cars.length === 0 ? <p className="mt-8 text-sm text-muted-foreground">{t("models.empty")}</p> : null}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
