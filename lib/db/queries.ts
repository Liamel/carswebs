import { and, asc, count, desc, eq, ilike, sql } from "drizzle-orm";
import { cache } from "react";

import { db } from "@/lib/db";
import { bookings, cars, content } from "@/lib/db/schema";

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

export const getFeaturedCars = cache(async () => {
  return db.query.cars.findMany({
    where: eq(cars.featured, true),
    orderBy: [asc(cars.name)],
    limit: 6,
  });
});

export async function getCars(params?: { search?: string; bodyType?: string }) {
  const filters = [];

  if (params?.search) {
    filters.push(ilike(cars.name, `%${params.search.trim()}%`));
  }

  if (params?.bodyType) {
    filters.push(eq(cars.bodyType, params.bodyType));
  }

  return db.query.cars.findMany({
    where: filters.length ? and(...filters) : undefined,
    orderBy: [asc(cars.name)],
  });
}

export const getBodyTypes = cache(async () => {
  const rows = await db
    .select({ bodyType: cars.bodyType })
    .from(cars)
    .groupBy(cars.bodyType)
    .orderBy(asc(cars.bodyType));

  return rows.map((row) => row.bodyType);
});

export const getCarBySlug = cache(async (slug: string) => {
  return db.query.cars.findFirst({
    where: eq(cars.slug, slug),
  });
});

export const getHomepageContent = cache(async () => {
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
});

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

export async function getBookingsForAdmin() {
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
