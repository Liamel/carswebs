import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { bookings, cars, content, homepageSlides } from "@/lib/db/schema";

const DEFAULT_HOMEPAGE_CONTENT = {
  hero: {
    eyebrow: "New season collection",
    title: "Precision engineered for daily confidence.",
    subtitle:
      "From compact city crossovers to family-ready SUVs, Astra Motors blends comfort, safety, and electric-ready performance.",
    primaryCta: { label: "Book a test drive", href: "/book-test-drive" },
    secondaryCta: { label: "Browse models", href: "/models" },
  },
  highlights: [
    {
      title: "Safety first architecture",
      description: "Standard driver-assist systems across the range.",
    },
    {
      title: "Smart cabin systems",
      description: "Adaptive displays, app-linked controls, and OTA updates.",
    },
    {
      title: "Hybrid-ready platforms",
      description: "Lower emissions with responsive torque delivery.",
    },
  ],
} as const;

const getFeaturedCarsCached = unstable_cache(
  async () => {
    return db.query.cars.findMany({
      where: eq(cars.featured, true),
      orderBy: [desc(cars.updatedAt), asc(cars.name)],
      limit: 6,
    });
  },
  ["featured-cars"],
  { revalidate: 3600, tags: ["cars"] },
);

export async function getFeaturedCars() {
  return getFeaturedCarsCached();
}

export type CarsFilters = {
  search?: string;
  bodyTypes?: string[];
  featuredOnly?: boolean;
};

export async function getCars(params?: CarsFilters) {
  const filters = [];
  const search = params?.search?.trim();
  const bodyTypes = [...new Set((params?.bodyTypes ?? []).map((value) => value.trim()).filter(Boolean))];

  if (search) {
    filters.push(ilike(cars.name, `%${search}%`));
  }

  if (bodyTypes.length > 0) {
    filters.push(inArray(cars.bodyType, bodyTypes));
  }

  if (params?.featuredOnly) {
    filters.push(eq(cars.featured, true));
  }

  return db.query.cars.findMany({
    where: filters.length ? and(...filters) : undefined,
    orderBy: [asc(cars.priceFrom), asc(cars.name)],
  });
}

const getBodyTypesCached = unstable_cache(
  async () => {
    const rows = await db
      .select({ bodyType: cars.bodyType })
      .from(cars)
      .groupBy(cars.bodyType)
      .orderBy(asc(cars.bodyType));

    return rows.map((row) => row.bodyType);
  },
  ["cars-body-types"],
  { revalidate: 3600, tags: ["cars"] },
);

export async function getBodyTypes() {
  return getBodyTypesCached();
}

export type CarsOverlaySummaryItem = {
  slug: string;
  name: string;
  priceFrom: number;
  bodyType: string;
  imageUrl: string | null;
};

const getCarsOverlaySummaryCached = unstable_cache(
  async (): Promise<CarsOverlaySummaryItem[]> => {
    const rows = await db.query.cars.findMany({
      columns: {
        slug: true,
        name: true,
        priceFrom: true,
        bodyType: true,
        images: true,
      },
      orderBy: [asc(cars.bodyType), asc(cars.priceFrom), asc(cars.name)],
    });

    return rows.map((car) => ({
      slug: car.slug,
      name: car.name,
      priceFrom: car.priceFrom,
      bodyType: car.bodyType,
      imageUrl: car.images[0] ?? null,
    }));
  },
  ["cars-overlay-summary"],
  { revalidate: 3600, tags: ["cars"] },
);

export async function getCarsOverlaySummary() {
  return getCarsOverlaySummaryCached();
}

export async function getCarBySlug(slug: string) {
  return db.query.cars.findFirst({
    where: eq(cars.slug, slug),
  });
}

export async function getHomepageContent() {
  const row = await db.query.content.findFirst({
    where: eq(content.key, "homepage"),
  });

  if (!row?.value || typeof row.value !== "object") {
    return DEFAULT_HOMEPAGE_CONTENT;
  }

  return {
    ...DEFAULT_HOMEPAGE_CONTENT,
    ...(row.value as Record<string, unknown>),
  };
}

const getActiveHomepageSlidesCached = unstable_cache(
  async () => {
    return db.query.homepageSlides.findMany({
      where: eq(homepageSlides.isActive, true),
      orderBy: [asc(homepageSlides.sortOrder), asc(homepageSlides.createdAt)],
    });
  },
  ["homepage-active-slides"],
  { revalidate: 3600, tags: ["homepage-slides"] },
);

export async function getActiveHomepageSlides() {
  return getActiveHomepageSlidesCached();
}

export async function getHomepageSlidesForAdmin() {
  return db.query.homepageSlides.findMany({
    orderBy: [asc(homepageSlides.sortOrder), desc(homepageSlides.createdAt)],
  });
}

export async function getDashboardStats() {
  const [{ totalCars }] = await db.select({ totalCars: count(cars.id) }).from(cars);
  const [{ totalBookings }] = await db.select({ totalBookings: count(bookings.id) }).from(bookings);
  const [{ pendingBookings }] = await db
    .select({ pendingBookings: count(bookings.id) })
    .from(bookings)
    .where(eq(bookings.status, "PENDING"));
  const [{ featuredCars }] = await db
    .select({ featuredCars: count(cars.id) })
    .from(cars)
    .where(eq(cars.featured, true));

  return {
    totalCars,
    totalBookings,
    pendingBookings,
    featuredCars,
  };
}

export async function getAllCarsForAdmin() {
  return db.query.cars.findMany({
    orderBy: [desc(cars.updatedAt)],
  });
}

export type AdminBookingsFilters = {
  status?: "PENDING" | "CONFIRMED" | "CANCELLED";
  search?: string;
};

export async function getBookingsForAdmin(filters?: AdminBookingsFilters) {
  const whereClauses = [];
  const search = filters?.search?.trim();

  if (filters?.status) {
    whereClauses.push(eq(bookings.status, filters.status));
  }

  if (search) {
    whereClauses.push(
      or(
        ilike(bookings.name, `%${search}%`),
        ilike(bookings.email, `%${search}%`),
        ilike(bookings.phone, `%${search}%`),
      ),
    );
  }

  return db
    .select({
      id: bookings.id,
      name: bookings.name,
      email: bookings.email,
      phone: bookings.phone,
      location: bookings.location,
      preferredDateTime: bookings.preferredDateTime,
      status: bookings.status,
      note: bookings.note,
      carName: cars.name,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .leftJoin(cars, eq(bookings.carId, cars.id))
    .where(whereClauses.length > 0 ? and(...whereClauses) : undefined)
    .orderBy(desc(bookings.createdAt));
}

export async function getContentEntryByKey(key: string) {
  return db.query.content.findFirst({
    where: eq(content.key, key),
  });
}

export async function getModelOptions() {
  return db.select({ id: cars.id, name: cars.name, slug: cars.slug }).from(cars).orderBy(asc(cars.name));
}

export async function getRecentBookings(limit = 5) {
  return db
    .select({
      id: bookings.id,
      name: bookings.name,
      status: bookings.status,
      carName: cars.name,
      createdAt: bookings.createdAt,
    })
    .from(bookings)
    .leftJoin(cars, eq(bookings.carId, cars.id))
    .orderBy(desc(bookings.createdAt))
    .limit(limit);
}

export async function searchCarsBySlugOrName(identifier: string) {
  return db.query.cars.findFirst({
    where: sql`${cars.slug} = ${identifier} OR ${cars.name} = ${identifier}`,
  });
}
