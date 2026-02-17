import { and, asc, count, desc, eq, ilike, inArray, or, sql } from "drizzle-orm";
import { unstable_cache } from "next/cache";

import { db } from "@/lib/db";
import { bookings, cars, content, homepageSlides, i18nStrings } from "@/lib/db/schema";
import { type Locale } from "@/lib/i18n/config";
import { getLocalizedCarName } from "@/lib/i18n/cars";

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

export async function getCars(params?: CarsFilters, locale: Locale = "geo") {
  const filters = [];
  const search = params?.search?.trim();
  const bodyTypes = [...new Set((params?.bodyTypes ?? []).map((value) => value.trim()).filter(Boolean))];

  if (bodyTypes.length > 0) {
    filters.push(inArray(cars.bodyType, bodyTypes));
  }

  if (params?.featuredOnly) {
    filters.push(eq(cars.featured, true));
  }

  const rows = await db.query.cars.findMany({
    where: filters.length ? and(...filters) : undefined,
    orderBy: [asc(cars.priceFrom), asc(cars.name)],
  });

  const normalizedSearch = search?.toLowerCase() ?? "";

  return rows
    .filter((car) => {
      if (!normalizedSearch) {
        return true;
      }

      return getLocalizedCarName(car, locale).toLowerCase().includes(normalizedSearch);
    })
    .sort(
      (left, right) =>
        left.priceFrom - right.priceFrom || getLocalizedCarName(left, locale).localeCompare(getLocalizedCarName(right, locale)),
    );
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
  async () => {
    return db.query.cars.findMany({
      columns: {
        slug: true,
        name: true,
        nameGeo: true,
        nameEn: true,
        nameRu: true,
        priceFrom: true,
        bodyType: true,
        images: true,
      },
      orderBy: [asc(cars.bodyType), asc(cars.priceFrom), asc(cars.name)],
    });
  },
  ["cars-overlay-summary"],
  { revalidate: 3600, tags: ["cars"] },
);

export async function getCarsOverlaySummary(locale: Locale): Promise<CarsOverlaySummaryItem[]> {
  const rows = await getCarsOverlaySummaryCached();

  return rows
    .map((car) => ({
      slug: car.slug,
      name: getLocalizedCarName(car, locale),
      priceFrom: car.priceFrom,
      bodyType: car.bodyType,
      imageUrl: car.images[0] ?? null,
    }))
    .sort((left, right) => left.bodyType.localeCompare(right.bodyType) || left.priceFrom - right.priceFrom || left.name.localeCompare(right.name));
}

export async function getCarBySlug(slug: string) {
  return db.query.cars.findFirst({
    where: eq(cars.slug, slug),
  });
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

export type I18nStringsFilters = {
  search?: string;
  missingOnly?: boolean;
};

export async function getI18nStringsForAdmin(filters?: I18nStringsFilters) {
  const whereClauses = [];
  const search = filters?.search?.trim();

  if (search) {
    whereClauses.push(
      or(
        ilike(i18nStrings.key, `%${search}%`),
        ilike(i18nStrings.geo, `%${search}%`),
        ilike(i18nStrings.en, `%${search}%`),
        ilike(i18nStrings.ru, `%${search}%`),
        ilike(i18nStrings.description, `%${search}%`),
      ),
    );
  }

  if (filters?.missingOnly) {
    whereClauses.push(or(eq(i18nStrings.geo, ""), eq(i18nStrings.en, ""), eq(i18nStrings.ru, "")));
  }

  return db.query.i18nStrings.findMany({
    where: whereClauses.length > 0 ? and(...whereClauses) : undefined,
    orderBy: [asc(i18nStrings.key)],
  });
}

export async function getI18nStringByIdForAdmin(id: string) {
  return db.query.i18nStrings.findFirst({
    where: eq(i18nStrings.id, id),
  });
}

export async function getI18nStringByKey(key: string) {
  return db.query.i18nStrings.findFirst({
    where: eq(i18nStrings.key, key),
  });
}

const getModelOptionsCached = unstable_cache(
  async () => {
    return db
      .select({
        id: cars.id,
        slug: cars.slug,
        name: cars.name,
        nameGeo: cars.nameGeo,
        nameEn: cars.nameEn,
        nameRu: cars.nameRu,
      })
      .from(cars)
      .orderBy(asc(cars.name));
  },
  ["model-options"],
  { revalidate: 3600, tags: ["cars"] },
);

export async function getModelOptions(locale: Locale) {
  const rows = await getModelOptionsCached();

  return rows
    .map((row) => ({
      id: row.id,
      slug: row.slug,
      name: getLocalizedCarName(row, locale),
    }))
    .sort((left, right) => left.name.localeCompare(right.name));
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
    where: sql`${cars.slug} = ${identifier} OR ${cars.name} = ${identifier} OR ${cars.nameGeo} = ${identifier} OR ${cars.nameEn} = ${identifier} OR ${cars.nameRu} = ${identifier}`,
  });
}
