"use client";

import { usePathname, useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";

const FILTER_VALUES = ["ALL", "PENDING", "CONFIRMED", "CANCELLED"] as const;
type FilterValue = (typeof FILTER_VALUES)[number];

type BookingsFiltersProps = {
  initialFilter: FilterValue;
  initialQuery: string;
};

function buildPath(pathname: string, filter: FilterValue, query: string) {
  const searchParams = new URLSearchParams();

  if (filter !== "ALL") {
    searchParams.set("filter", filter);
  }

  const trimmedQuery = query.trim();
  if (trimmedQuery) {
    searchParams.set("q", trimmedQuery);
  }

  const serialized = searchParams.toString();
  return serialized ? `${pathname}?${serialized}` : pathname;
}

export function BookingsFilters({ initialFilter, initialQuery }: BookingsFiltersProps) {
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, startTransition] = useTransition();
  const [query, setQuery] = useState(initialQuery);
  const [filter, setFilter] = useState<FilterValue>(initialFilter);

  return (
    <div className="flex flex-col gap-3 rounded-2xl border border-border/80 bg-white/92 p-4">
      <Tabs
        value={filter}
        onValueChange={(value) => {
          const nextFilter = FILTER_VALUES.includes(value as FilterValue) ? (value as FilterValue) : "ALL";

          setFilter(nextFilter);
          startTransition(() => {
            router.push(buildPath(pathname, nextFilter, query));
          });
        }}
      >
        <TabsList className="h-auto flex-wrap rounded-2xl p-1">
          <TabsTrigger value="ALL">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="CONFIRMED">Confirmed</TabsTrigger>
          <TabsTrigger value="CANCELLED">Cancelled</TabsTrigger>
        </TabsList>
      </Tabs>

      <form
        className="flex flex-col gap-2 sm:flex-row"
        onSubmit={(event) => {
          event.preventDefault();
          startTransition(() => {
            router.push(buildPath(pathname, filter, query));
          });
        }}
      >
        <Input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search by customer name, email, or phone"
          className="sm:max-w-md"
        />
        <div className="flex gap-2">
          <Button type="submit" size="sm" disabled={isNavigating}>
            Apply
          </Button>
          <Button
            type="button"
            size="sm"
            variant="outline"
            disabled={isNavigating}
            onClick={() => {
              setFilter("ALL");
              setQuery("");
              startTransition(() => {
                router.push(pathname);
              });
            }}
          >
            Reset
          </Button>
        </div>
      </form>
    </div>
  );
}
