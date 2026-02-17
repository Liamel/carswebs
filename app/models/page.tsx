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

type ModelsPageProps = {
  searchParams: Promise<{ search?: string; bodyType?: string }>;
};

export default async function ModelsPage({ searchParams }: ModelsPageProps) {
  const params = await searchParams;
  const search = params.search?.trim() ?? "";
  const bodyType = params.bodyType?.trim() ?? "";

  const [cars, bodyTypes] = await Promise.all([
    getCars({ search: search || undefined, bodyType: bodyType || undefined }),
    getBodyTypes(),
  ]);

  return (
    <MarketingLayout>
      <section className="container-shell py-14">
        <h1 className="font-display text-4xl font-semibold">Model lineup</h1>
        <p className="mt-2 text-muted-foreground">Find the right fit for city driving, family travel, and weekend escapes.</p>

        <form className="mt-8 grid gap-3 rounded-2xl border border-border/70 bg-white/60 p-4 md:grid-cols-[1fr_220px_auto]">
          <input
            type="text"
            name="search"
            defaultValue={search}
            placeholder="Search by model name"
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
          />
          <select
            name="bodyType"
            defaultValue={bodyType}
            className="h-11 rounded-xl border border-border bg-background px-3 text-sm"
          >
            <option value="">All body types</option>
            {bodyTypes.map((type) => (
              <option key={type} value={type}>
                {type}
              </option>
            ))}
          </select>
          <div className="flex gap-2">
            <Button type="submit" className="w-full md:w-auto">
              Apply
            </Button>
            <Link href="/models" className="w-full md:w-auto">
              <Button type="button" variant="outline" className="w-full md:w-auto">
                Reset
              </Button>
            </Link>
          </div>
        </form>

        <div className="mt-8 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
          {cars.map((car) => (
            <ModelCard key={car.id} car={car} />
          ))}
        </div>

        {cars.length === 0 ? (
          <p className="mt-8 text-sm text-muted-foreground">No models matched your search. Try a different query or clear filters.</p>
        ) : null}
      </section>
    </MarketingLayout>
  );
}
