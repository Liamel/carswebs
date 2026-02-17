import type { Metadata } from "next";
import Link from "next/link";

import { ModelCard } from "@/components/models/model-card";
import { MarketingLayout } from "@/components/site/marketing-layout";
import { Button } from "@/components/ui/button";
import { getBodyTypes, getCars } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Models",
  description: "Browse Astra Motors SUVs and crossovers with smart features and refined design.",
};

type ModelsPageSearchParams = {
  search?: string;
  type?: string | string[];
  featured?: string;
};

type ModelsPageProps = {
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

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const params = await searchParams;
  const search = typeof params.search === "string" ? params.search.trim() : "";
  const selectedTypes = [...new Set(parseMultiValue(params.type))];
  const featuredOnly = params.featured === "1";

  const [cars, bodyTypes] = await Promise.all([
    getCars({
      search: search || undefined,
      bodyTypes: selectedTypes,
      featuredOnly,
    }),
    getBodyTypes(),
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
    <MarketingLayout>
      <section className="container-shell py-14 md:py-16">
        <h1 className="font-display text-4xl font-semibold tracking-tight md:text-5xl">Model lineup</h1>
        <p className="mt-2 max-w-3xl text-lg text-muted-foreground">
          Find the right fit for city driving, family travel, and weekend escapes.
        </p>

        <div className="mt-8 grid gap-6 xl:grid-cols-[300px_1fr]">
          <aside>
            <form
              method="GET"
              className="space-y-5 rounded-2xl border border-border/70 bg-white/85 p-5 shadow-sm xl:sticky xl:top-24"
            >
              <div className="space-y-2">
                <label htmlFor="search" className="text-sm font-medium">
                  Search
                </label>
                <input
                  id="search"
                  type="text"
                  name="search"
                  defaultValue={search}
                  placeholder="Search by model name"
                  className="h-11 w-full rounded-xl border border-border bg-background px-3 text-sm shadow-xs"
                />
              </div>

              <fieldset className="space-y-2 border-t border-border/70 pt-4">
                <legend className="text-sm font-medium">Vehicle type</legend>
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
                      {type}
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
                Featured models only
              </label>

              <div className="grid grid-cols-2 gap-2">
                <Button type="submit" className="w-full">
                  Apply filters
                </Button>
                <Link href="/models" className="min-w-0">
                  <Button type="button" variant="outline" className="w-full">
                    Reset
                  </Button>
                </Link>
              </div>
            </form>
          </aside>

          <div className="min-w-0">
            <p className="text-sm text-muted-foreground">
              Showing <span className="font-semibold text-foreground">{cars.length}</span> model{cars.length === 1 ? "" : "s"}
            </p>

            <div className="mt-4 grid gap-5 md:grid-cols-2 2xl:grid-cols-3">
              {cars.map((car) => (
                <ModelCard key={car.id} car={car} modelsQueryString={detailQuery.toString()} />
              ))}
            </div>

            {cars.length === 0 ? (
              <p className="mt-8 text-sm text-muted-foreground">No models matched your filters. Try a different combination.</p>
            ) : null}
          </div>
        </div>
      </section>
    </MarketingLayout>
  );
}
