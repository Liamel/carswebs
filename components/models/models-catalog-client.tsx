"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useSearchParams } from "next/navigation";

import { ModelCard } from "@/components/models/model-card";
import { Button } from "@/components/ui/button";
import type { Car } from "@/lib/db/schema";
import { getLocalizedCarName } from "@/lib/i18n/cars";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";

type ModelsCatalogClientLabels = {
  title: string;
  subtitle: string;
  searchLabel: string;
  searchPlaceholder: string;
  vehicleType: string;
  featuredOnly: string;
  apply: string;
  reset: string;
  showingCountTemplate: string;
  empty: string;
  cardFeatured: string;
  cardFrom: string;
  cardViewDetails: string;
  cardBookTestDrive: string;
};

type ModelsCatalogClientProps = {
  locale: Locale;
  cars: Car[];
  bodyTypes: string[];
  bodyTypeLabels: Record<string, string>;
  labels: ModelsCatalogClientLabels;
};

function parseSearchParamsMultiValue(value: string[]) {
  return [...new Set(value.map((item) => item.trim()).filter(Boolean))];
}

function formatShowingCount(template: string, count: number) {
  return template
    .replaceAll("{{count}}", String(count))
    .replaceAll("{count}", String(count));
}

export function ModelsCatalogClient({ locale, cars, bodyTypes, bodyTypeLabels, labels }: ModelsCatalogClientProps) {
  const searchParams = useSearchParams();
  const search = searchParams.get("search")?.trim() ?? "";
  const selectedTypes = parseSearchParamsMultiValue(searchParams.getAll("type"));
  const featuredOnly = searchParams.get("featured") === "1";
  const normalizedSearch = search.toLowerCase();
  const selectedTypesSet = useMemo(
    () => new Set(selectedTypes.map((value) => value.toLowerCase())),
    [selectedTypes],
  );

  const carsToShow = useMemo(() => {
    return cars.filter((car) => {
      if (selectedTypesSet.size > 0 && !selectedTypesSet.has(car.bodyType.trim().toLowerCase())) {
        return false;
      }

      if (featuredOnly && !car.featured) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return getLocalizedCarName(car, locale).toLowerCase().includes(normalizedSearch);
    });
  }, [cars, featuredOnly, locale, normalizedSearch, selectedTypesSet]);

  const modelsDetailQueryString = useMemo(() => {
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

    return detailQuery.toString();
  }, [featuredOnly, search, selectedTypes]);

  return (
    <section className="container-shell py-14 md:py-16">
      <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">{labels.title}</h1>
      <p className="mt-2 max-w-3xl text-lg text-muted-foreground">{labels.subtitle}</p>

      <div className="mt-8 grid gap-6 xl:grid-cols-[300px_1fr]">
        <aside>
          <form
            method="GET"
            className="space-y-5 rounded-2xl border border-border/70 bg-white/85 p-5 shadow-sm xl:sticky xl:top-24"
          >
            <div className="space-y-2">
              <label htmlFor="search" className="text-sm font-medium">
                {labels.searchLabel}
              </label>
              <input
                id="search"
                type="text"
                name="search"
                defaultValue={search}
                placeholder={labels.searchPlaceholder}
                className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-xs"
              />
            </div>

            <fieldset className="space-y-2 border-t border-border/70 pt-4">
              <legend className="text-sm font-medium">{labels.vehicleType}</legend>
              <div className="space-y-2">
                {bodyTypes.map((type) => (
                  <label key={type} className="flex items-center gap-2 text-sm text-muted-foreground">
                    <input
                      type="checkbox"
                      name="type"
                      value={type}
                      defaultChecked={selectedTypes.includes(type)}
                      className="h-4 w-4 rounded border-border accent-primary"
                    />
                    {bodyTypeLabels[type] ?? type}
                  </label>
                ))}
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
              {labels.featuredOnly}
            </label>

            <div className="grid grid-cols-2 gap-2">
              <Button type="submit" className="w-full">
                {labels.apply}
              </Button>
              <Link href={withLocalePath(locale, "/models")} className="min-w-0">
                <Button type="button" variant="outline" className="w-full">
                  {labels.reset}
                </Button>
              </Link>
            </div>
          </form>
        </aside>

        <div className="min-w-0">
          <p className="text-sm text-muted-foreground">
            {formatShowingCount(labels.showingCountTemplate, carsToShow.length)}
          </p>

          <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
            {carsToShow.map((car) => (
              <ModelCard
                key={car.id}
                car={car}
                locale={locale}
                bodyTypeLabel={bodyTypeLabels[car.bodyType] ?? car.bodyType}
                labels={{
                  featured: labels.cardFeatured,
                  from: labels.cardFrom,
                  viewDetails: labels.cardViewDetails,
                  bookTestDrive: labels.cardBookTestDrive,
                }}
                modelsQueryString={modelsDetailQueryString}
              />
            ))}
          </div>

          {carsToShow.length === 0 ? <p className="mt-8 text-sm text-muted-foreground">{labels.empty}</p> : null}
        </div>
      </div>
    </section>
  );
}
