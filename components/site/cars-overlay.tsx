"use client";

import Link from "next/link";
import { Search } from "lucide-react";
import { useMemo, useState } from "react";

import {
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogIconClose,
  DialogTitle,
} from "@/components/ui/dialog";
import type { Locale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";
import { formatUsdPrice } from "@/lib/i18n/price";
import { cn } from "@/lib/utils";

export type CarsOverlayItem = {
  slug: string;
  name: string;
  priceFrom: number;
  bodyType: string;
  bodyTypeLabel: string;
  imageUrl: string | null;
};

export type CarsOverlayLabels = {
  dialogTitle: string;
  dialogDescription: string;
  closeAriaLabel: string;
  eyebrow: string;
  title: string;
  searchPlaceholder: string;
  viewAllModels: string;
  vehicleTypes: string;
  bookTestDrive: string;
  discoverModels: string;
  emptyState: string;
  allTypes: string;
  from: string;
};

type CarsOverlayProps = {
  locale: Locale;
  cars: CarsOverlayItem[];
  labels: CarsOverlayLabels;
};

const ALL_TYPES_VALUE = "__all";

export function CarsOverlay({ locale, cars, labels }: CarsOverlayProps) {
  const [selectedBodyType, setSelectedBodyType] = useState<string>(ALL_TYPES_VALUE);
  const [searchQuery, setSearchQuery] = useState("");

  const sortedCars = useMemo(
    () =>
      [...cars].sort(
        (left, right) =>
          left.bodyType.localeCompare(right.bodyType) || left.priceFrom - right.priceFrom || left.name.localeCompare(right.name),
      ),
    [cars],
  );

  const bodyTypeLabelByValue = useMemo(() => {
    const entries = sortedCars.map((car) => [car.bodyType, car.bodyTypeLabel] as const);
    return new Map(entries);
  }, [sortedCars]);

  const bodyTypeOptions = useMemo(() => {
    const options = Array.from(new Set(sortedCars.map((car) => car.bodyType))).sort((a, b) => a.localeCompare(b));
    return [ALL_TYPES_VALUE, ...options];
  }, [sortedCars]);

  const activeBodyType = bodyTypeOptions.includes(selectedBodyType) ? selectedBodyType : ALL_TYPES_VALUE;
  const normalizedSearch = searchQuery.trim().toLowerCase();

  const filteredCars = useMemo(
    () =>
      sortedCars.filter((car) => {
        const matchesType = activeBodyType === ALL_TYPES_VALUE || car.bodyType === activeBodyType;
        const matchesSearch = normalizedSearch.length === 0 || car.name.toLowerCase().includes(normalizedSearch);

        return matchesType && matchesSearch;
      }),
    [activeBodyType, normalizedSearch, sortedCars],
  );

  const modelsQuery = useMemo(() => {
    const searchParams = new URLSearchParams();

    if (activeBodyType !== ALL_TYPES_VALUE) {
      searchParams.append("type", activeBodyType);
    }

    if (normalizedSearch) {
      searchParams.set("search", searchQuery.trim());
    }

    return searchParams;
  }, [activeBodyType, normalizedSearch, searchQuery]);

  const viewAllModelsHref = modelsQuery.toString()
    ? withLocalePath(locale, `/models?${modelsQuery.toString()}`)
    : withLocalePath(locale, "/models");

  return (
    <DialogContent className="h-dvh w-screen max-w-none rounded-none border-none p-0 sm:h-[94vh] sm:w-[96vw] sm:max-w-[1500px] sm:rounded-2xl sm:border sm:border-border/70">
      <DialogTitle className="sr-only">{labels.dialogTitle}</DialogTitle>
      <DialogDescription className="sr-only">{labels.dialogDescription}</DialogDescription>
      <DialogIconClose aria-label={labels.closeAriaLabel} />

      <div className="grid h-full min-h-0 grid-rows-[auto_1fr] bg-[#f3f5f7]">
        <div className="border-b border-border/70 bg-white/95 px-4 py-4 pr-16 sm:px-6 sm:pr-20">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <p className="text-xs font-semibold tracking-[0.14em] text-muted-foreground uppercase">{labels.eyebrow}</p>
              <p className="font-display text-2xl font-semibold sm:text-3xl">{labels.title}</p>
            </div>

            <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <label className="relative flex min-w-[220px] items-center">
                <Search className="pointer-events-none absolute left-3 h-4 w-4 text-muted-foreground" />
                <input
                  type="search"
                  value={searchQuery}
                  onChange={(event) => setSearchQuery(event.target.value)}
                  placeholder={labels.searchPlaceholder}
                  className="h-11 w-full rounded-full border border-border bg-white pl-9 pr-4 text-sm"
                />
              </label>

              <DialogClose asChild>
                <Link
                  href={viewAllModelsHref}
                  className="inline-flex h-11 items-center justify-center rounded-full bg-primary px-5 text-sm font-medium text-primary-foreground transition hover:bg-primary/90"
                >
                  {labels.viewAllModels}
                </Link>
              </DialogClose>
            </div>
          </div>
        </div>

        <div className="grid min-h-0 grid-cols-1 md:grid-cols-[260px_1fr]">
          <aside className="min-h-0 overflow-y-auto border-b border-border/70 bg-[#f8f9fb] p-4 md:border-r md:border-b-0 md:p-6">
            <p className="mb-4 text-sm font-semibold text-foreground">{labels.vehicleTypes}</p>
            <div className="space-y-1.5">
              {bodyTypeOptions.map((bodyType) => {
                const isActive = bodyType === activeBodyType;
                const label = bodyType === ALL_TYPES_VALUE ? labels.allTypes : bodyTypeLabelByValue.get(bodyType) ?? bodyType;

                return (
                  <button
                    key={bodyType}
                    type="button"
                    onClick={() => setSelectedBodyType(bodyType)}
                    className={cn(
                      "flex w-full items-center justify-between rounded-xl px-3 py-2 text-left text-sm transition",
                      isActive ? "bg-foreground text-background" : "text-muted-foreground hover:bg-white hover:text-foreground",
                    )}
                  >
                    <span>{label}</span>
                  </button>
                );
              })}
            </div>

            <div className="mt-8 space-y-2 border-t border-border/70 pt-6">
              <DialogClose asChild>
                <Link
                  href={withLocalePath(locale, "/book-test-drive")}
                  className="block text-sm font-medium text-foreground transition hover:text-primary"
                >
                  {labels.bookTestDrive}
                </Link>
              </DialogClose>
              <DialogClose asChild>
                <Link href={viewAllModelsHref} className="block text-sm font-medium text-foreground transition hover:text-primary">
                  {labels.discoverModels}
                </Link>
              </DialogClose>
            </div>
          </aside>

          <section className="min-h-0 overflow-y-auto p-4 sm:p-6">
            {filteredCars.length === 0 ? (
              <div className="rounded-2xl border border-border/70 bg-white p-8 text-sm text-muted-foreground">
                {labels.emptyState}
              </div>
            ) : (
              <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4">
                {filteredCars.map((car) => {
                  const detailQuery = new URLSearchParams(modelsQuery);
                  const detailHref = detailQuery.toString()
                    ? withLocalePath(locale, `/models/${car.slug}?${detailQuery.toString()}`)
                    : withLocalePath(locale, `/models/${car.slug}`);

                  return (
                    <DialogClose key={car.slug} asChild>
                      <Link
                        href={detailHref}
                        className="group rounded-2xl border border-border/70 bg-white p-3 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                      >
                        <div className="mb-3 rounded-xl bg-gradient-to-b from-slate-50 to-slate-100 p-4">
                          <div
                            className="h-36 w-full"
                            style={{
                              backgroundImage: car.imageUrl ? `url(${car.imageUrl})` : undefined,
                              backgroundSize: "contain",
                              backgroundPosition: "center",
                              backgroundRepeat: "no-repeat",
                            }}
                          />
                        </div>

                        <div className="space-y-1">
                          <span className="inline-flex rounded-full bg-muted px-2.5 py-1 text-xs font-medium text-muted-foreground">
                            {car.bodyTypeLabel}
                          </span>
                          <p className="text-base font-semibold text-foreground">{car.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {labels.from} {formatUsdPrice(car.priceFrom, locale)}
                          </p>
                        </div>
                      </Link>
                    </DialogClose>
                  );
                })}
              </div>
            )}
          </section>
        </div>
      </div>
    </DialogContent>
  );
}
