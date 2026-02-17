"use server";

import { put } from "@vercel/blob";
import { asc, eq } from "drizzle-orm";
import { revalidatePath, revalidateTag } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, cars, content, homepageSlides, i18nStrings } from "@/lib/db/schema";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";
import { bookingStatusSchema } from "@/lib/validations/booking";
import { carSchema } from "@/lib/validations/car";
import { homepageContentSchema } from "@/lib/validations/content";
import { homepageSlideCreateSchema, homepageSlideUpdateSchema } from "@/lib/validations/homepage-slide";
import { i18nStringCreateSchema, i18nStringUpdateSchema } from "@/lib/validations/i18n-string";

async function assertAdmin() {
  const session = await requireAdminSession();

  if (!session?.user?.email) {
    redirect("/admin/login?error=Unauthorized");
  }

  return session;
}

function parseBooleanCheckbox(value: FormDataEntryValue | null) {
  return value === "on" || value === "true";
}

function buildRedirectPath(pathname: string, key: "status" | "error", value: string) {
  const searchParams = new URLSearchParams();
  searchParams.set(key, value);
  return `${pathname}?${searchParams.toString()}`;
}

function sanitizeBookingsReturnPath(pathValue: FormDataEntryValue | null) {
  const fallback = "/admin/bookings";
  const value = typeof pathValue === "string" ? pathValue.trim() : "";

  if (!value.startsWith("/admin/bookings")) {
    return fallback;
  }

  return value;
}

function appendFlashToPath(path: string, key: "status" | "error", value: string) {
  const [pathname, search = ""] = path.split("?");
  const searchParams = new URLSearchParams(search);
  searchParams.set(key, value);
  return `${pathname}?${searchParams.toString()}`;
}

function revalidateLocalizedPath(pathname: string) {
  for (const locale of SUPPORTED_LOCALES) {
    revalidatePath(withLocalePath(locale, pathname));
  }
}

function refreshLocalizedPublicPages() {
  revalidateLocalizedPath("/");
  revalidateLocalizedPath("/models");
  revalidateLocalizedPath("/book-test-drive");
  revalidateLocalizedPath("/about");
  revalidateLocalizedPath("/contact");
}

function refreshPublicPages(slugs: string[] = []) {
  revalidateTag("cars", "max");
  refreshLocalizedPublicPages();
  revalidatePath("/sitemap.xml");

  for (const slug of slugs) {
    if (slug) {
      revalidateLocalizedPath(`/models/${slug}`);
    }
  }
}

function refreshHomepageSliderPages() {
  revalidateTag("homepage-slides", "max");
  revalidateLocalizedPath("/");
  revalidatePath("/admin/homepage-slider");
}

function refreshI18nPages() {
  revalidateTag("i18n", "max");
  refreshLocalizedPublicPages();
  revalidatePath("/sitemap.xml");
  revalidatePath("/admin/i18n");
}

function getSingleFile(value: FormDataEntryValue | null) {
  if (value instanceof File && value.size > 0) {
    return value;
  }

  return null;
}

function toBlobFileName(file: File) {
  const cleanedName = file.name
    .toLowerCase()
    .replace(/[^a-z0-9.-]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return cleanedName || `slide-${Date.now()}.jpg`;
}

async function uploadSliderImage(file: File) {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return { ok: false, error: "BLOB_READ_WRITE_TOKEN is missing" } as const;
  }

  if (!file.type.startsWith("image/")) {
    return { ok: false, error: "Image must be a valid image file" } as const;
  }

  if (file.size > 8 * 1024 * 1024) {
    return { ok: false, error: "Image must be 8MB or smaller" } as const;
  }

  try {
    const blob = await put(`homepage-slides/${toBlobFileName(file)}`, file, {
      access: "public",
      addRandomSuffix: true,
    });

    return { ok: true, url: blob.url } as const;
  } catch {
    return { ok: false, error: "Failed to upload image" } as const;
  }
}

export async function createCarAction(formData: FormData) {
  await assertAdmin();
  const rawGeoName = formData.get("nameGeo");

  const parsed = carSchema.safeParse({
    nameGeo: rawGeoName,
    nameEn: formData.get("nameEn"),
    nameRu: formData.get("nameRu"),
    slug: rawGeoName,
    priceFrom: formData.get("priceFrom"),
    bodyType: formData.get("bodyType"),
    descriptionGeo: formData.get("descriptionGeo"),
    descriptionEn: formData.get("descriptionEn"),
    descriptionRu: formData.get("descriptionRu"),
    featured: parseBooleanCheckbox(formData.get("featured")),
    specsPayload: formData.get("specsPayload"),
    imagesPayload: formData.get("imagesPayload"),
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues[0]?.message ?? "Invalid car form data";
    redirect(`/admin/cars?error=${encodeURIComponent(errorMessage)}`);
  }

  const existingBySlug = await db.query.cars.findFirst({
    where: eq(cars.slug, parsed.data.slug),
    columns: { id: true },
  });

  if (existingBySlug) {
    redirect(buildRedirectPath("/admin/cars", "error", "A car with this slug already exists"));
  }

  try {
    await db.insert(cars).values({
      name: parsed.data.nameGeo,
      nameGeo: parsed.data.nameGeo,
      nameEn: parsed.data.nameEn,
      nameRu: parsed.data.nameRu,
      slug: parsed.data.slug,
      priceFrom: parsed.data.priceFrom,
      bodyType: parsed.data.bodyType,
      description: parsed.data.descriptionGeo,
      descriptionGeo: parsed.data.descriptionGeo,
      descriptionEn: parsed.data.descriptionEn,
      descriptionRu: parsed.data.descriptionRu,
      featured: parsed.data.featured,
      specs: parsed.data.specsPayload,
      images: parsed.data.imagesPayload,
    });
  } catch {
    redirect("/admin/cars?error=Could+not+create+car+(check+slug+uniqueness)");
  }

  revalidatePath("/admin/cars");
  refreshPublicPages([parsed.data.slug]);
  redirect("/admin/cars?status=created");
}

export async function updateCarAction(formData: FormData) {
  await assertAdmin();
  const rawGeoName = formData.get("nameGeo");

  const carId = Number(formData.get("id"));
  if (!Number.isFinite(carId) || carId <= 0) {
    redirect("/admin/cars?error=Invalid+car+ID");
  }

  const existingCar = await db.query.cars.findFirst({
    where: eq(cars.id, carId),
    columns: {
      slug: true,
    },
  });

  if (!existingCar) {
    redirect("/admin/cars?error=Car+not+found");
  }

  const parsed = carSchema.safeParse({
    nameGeo: rawGeoName,
    nameEn: formData.get("nameEn"),
    nameRu: formData.get("nameRu"),
    slug: rawGeoName,
    priceFrom: formData.get("priceFrom"),
    bodyType: formData.get("bodyType"),
    descriptionGeo: formData.get("descriptionGeo"),
    descriptionEn: formData.get("descriptionEn"),
    descriptionRu: formData.get("descriptionRu"),
    featured: parseBooleanCheckbox(formData.get("featured")),
    specsPayload: formData.get("specsPayload"),
    imagesPayload: formData.get("imagesPayload"),
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues[0]?.message ?? "Invalid update payload";
    redirect(`/admin/cars?error=${encodeURIComponent(errorMessage)}`);
  }

  const existingBySlug = await db.query.cars.findFirst({
    where: eq(cars.slug, parsed.data.slug),
    columns: { id: true },
  });

  if (existingBySlug && existingBySlug.id !== carId) {
    redirect(buildRedirectPath("/admin/cars", "error", "A car with this slug already exists"));
  }

  try {
    await db
      .update(cars)
      .set({
        name: parsed.data.nameGeo,
        nameGeo: parsed.data.nameGeo,
        nameEn: parsed.data.nameEn,
        nameRu: parsed.data.nameRu,
        slug: parsed.data.slug,
        priceFrom: parsed.data.priceFrom,
        bodyType: parsed.data.bodyType,
        description: parsed.data.descriptionGeo,
        descriptionGeo: parsed.data.descriptionGeo,
        descriptionEn: parsed.data.descriptionEn,
        descriptionRu: parsed.data.descriptionRu,
        featured: parsed.data.featured,
        specs: parsed.data.specsPayload,
        images: parsed.data.imagesPayload,
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId));
  } catch {
    redirect("/admin/cars?error=Could+not+update+car");
  }

  revalidatePath("/admin/cars");
  refreshPublicPages([existingCar.slug, parsed.data.slug]);
  redirect("/admin/cars?status=updated");
}

export async function deleteCarAction(formData: FormData) {
  await assertAdmin();

  const carId = Number(formData.get("id"));

  if (!Number.isFinite(carId) || carId <= 0) {
    redirect("/admin/cars?error=Invalid+car+ID");
  }

  const existingCar = await db.query.cars.findFirst({
    where: eq(cars.id, carId),
    columns: {
      slug: true,
    },
  });

  if (!existingCar) {
    redirect("/admin/cars?error=Car+not+found");
  }

  try {
    await db.delete(cars).where(eq(cars.id, carId));
  } catch {
    redirect("/admin/cars?error=Could+not+delete+car");
  }

  revalidatePath("/admin/cars");
  refreshPublicPages([existingCar.slug]);
  redirect("/admin/cars?status=deleted");
}

export async function updateBookingStatusAction(formData: FormData) {
  await assertAdmin();

  const bookingId = Number(formData.get("id"));
  const status = bookingStatusSchema.safeParse(formData.get("status"));
  const returnPath = sanitizeBookingsReturnPath(formData.get("returnTo"));

  if (!Number.isFinite(bookingId) || bookingId <= 0 || !status.success) {
    redirect(appendFlashToPath(returnPath, "error", "Invalid booking update"));
  }

  try {
    await db
      .update(bookings)
      .set({
        status: status.data,
        updatedAt: new Date(),
      })
      .where(eq(bookings.id, bookingId));
  } catch {
    redirect(appendFlashToPath(returnPath, "error", "Could not update booking"));
  }

  revalidatePath("/admin/bookings");
  redirect(appendFlashToPath(returnPath, "status", "updated"));
}

export async function updateHomepageContentAction(formData: FormData) {
  await assertAdmin();

  const parsed = homepageContentSchema.safeParse({
    eyebrow: formData.get("eyebrow"),
    title: formData.get("title"),
    subtitle: formData.get("subtitle"),
    primaryCtaLabel: formData.get("primaryCtaLabel"),
    primaryCtaHref: formData.get("primaryCtaHref"),
    secondaryCtaLabel: formData.get("secondaryCtaLabel"),
    secondaryCtaHref: formData.get("secondaryCtaHref"),
    highlightsPayload: formData.get("highlightsPayload"),
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues[0]?.message ?? "Invalid content payload";
    redirect(`/admin/content?error=${encodeURIComponent(errorMessage)}`);
  }

  const payload = {
    hero: {
      eyebrow: parsed.data.eyebrow,
      title: parsed.data.title,
      subtitle: parsed.data.subtitle,
      primaryCta: {
        label: parsed.data.primaryCtaLabel,
        href: parsed.data.primaryCtaHref,
      },
      secondaryCta: {
        label: parsed.data.secondaryCtaLabel,
        href: parsed.data.secondaryCtaHref,
      },
    },
    highlights: parsed.data.highlightsPayload,
  };

  try {
    await db
      .insert(content)
      .values({
        key: "homepage",
        value: payload,
        updatedAt: new Date(),
      })
      .onConflictDoUpdate({
        target: content.key,
        set: {
          value: payload,
          updatedAt: new Date(),
        },
      });
  } catch {
    redirect("/admin/content?error=Could+not+save+content");
  }

  revalidatePath("/admin/content");
  revalidateLocalizedPath("/");
  redirect("/admin/content?status=saved");
}

export async function ensureContentRowAction() {
  await assertAdmin();

  const row = await db.query.content.findFirst({
    where: eq(content.key, "homepage"),
  });

  if (!row) {
    await db.insert(content).values({
      key: "homepage",
      value: {
        hero: {
          eyebrow: "New season collection",
          title: "Precision engineered for daily confidence.",
          subtitle: "Modern vehicles designed for safer, smarter, and cleaner mobility.",
          primaryCta: { label: "Book a test drive", href: "/book-test-drive" },
          secondaryCta: { label: "Browse models", href: "/models" },
        },
        highlights: [],
      },
      updatedAt: new Date(),
    });
  }

  revalidatePath("/admin/content");
  redirect("/admin/content");
}

export async function createHomepageSlideAction(formData: FormData) {
  await assertAdmin();

  const parsed = homepageSlideCreateSchema.safeParse({
    title: formData.get("title"),
    description: formData.get("description"),
    ctaLabel: formData.get("ctaLabel"),
    ctaHref: formData.get("ctaHref"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: parseBooleanCheckbox(formData.get("isActive")),
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues[0]?.message ?? "Invalid slide payload";
    redirect(`/admin/homepage-slider?error=${encodeURIComponent(errorMessage)}`);
  }

  const imageFile = getSingleFile(formData.get("imageFile"));

  if (!imageFile) {
    redirect("/admin/homepage-slider?error=Slide+image+is+required");
  }

  const uploadResult = await uploadSliderImage(imageFile);
  if (!uploadResult.ok) {
    redirect(`/admin/homepage-slider?error=${encodeURIComponent(uploadResult.error)}`);
  }

  try {
    await db.insert(homepageSlides).values({
      title: parsed.data.title,
      description: parsed.data.description,
      imageUrl: uploadResult.url,
      ctaLabel: parsed.data.ctaLabel,
      ctaHref: parsed.data.ctaHref,
      sortOrder: parsed.data.sortOrder,
      isActive: parsed.data.isActive,
      updatedAt: new Date(),
    });
  } catch {
    redirect("/admin/homepage-slider?error=Could+not+create+slide");
  }

  refreshHomepageSliderPages();
  redirect("/admin/homepage-slider?status=created");
}

export async function updateHomepageSlideAction(formData: FormData) {
  await assertAdmin();

  const parsed = homepageSlideUpdateSchema.safeParse({
    id: formData.get("id"),
    title: formData.get("title"),
    description: formData.get("description"),
    ctaLabel: formData.get("ctaLabel"),
    ctaHref: formData.get("ctaHref"),
    sortOrder: formData.get("sortOrder") || 0,
    isActive: parseBooleanCheckbox(formData.get("isActive")),
    existingImageUrl: formData.get("existingImageUrl"),
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues[0]?.message ?? "Invalid slide payload";
    redirect(`/admin/homepage-slider?error=${encodeURIComponent(errorMessage)}`);
  }

  let imageUrl = parsed.data.existingImageUrl;
  const replacementImage = getSingleFile(formData.get("imageFile"));

  if (replacementImage) {
    const uploadResult = await uploadSliderImage(replacementImage);

    if (!uploadResult.ok) {
      redirect(`/admin/homepage-slider?error=${encodeURIComponent(uploadResult.error)}`);
    }

    imageUrl = uploadResult.url;
  }

  if (!imageUrl) {
    redirect("/admin/homepage-slider?error=Slide+image+is+required");
  }

  try {
    await db
      .update(homepageSlides)
      .set({
        title: parsed.data.title,
        description: parsed.data.description,
        imageUrl,
        ctaLabel: parsed.data.ctaLabel,
        ctaHref: parsed.data.ctaHref,
        sortOrder: parsed.data.sortOrder,
        isActive: parsed.data.isActive,
        updatedAt: new Date(),
      })
      .where(eq(homepageSlides.id, parsed.data.id));
  } catch {
    redirect("/admin/homepage-slider?error=Could+not+update+slide");
  }

  refreshHomepageSliderPages();
  redirect("/admin/homepage-slider?status=updated");
}

export async function deleteHomepageSlideAction(formData: FormData) {
  await assertAdmin();

  const slideId = String(formData.get("id") ?? "").trim();

  if (!slideId) {
    redirect("/admin/homepage-slider?error=Invalid+slide+ID");
  }

  try {
    await db.delete(homepageSlides).where(eq(homepageSlides.id, slideId));
  } catch {
    redirect("/admin/homepage-slider?error=Could+not+delete+slide");
  }

  refreshHomepageSliderPages();
  redirect("/admin/homepage-slider?status=deleted");
}

export async function moveHomepageSlideOrderAction(formData: FormData) {
  await assertAdmin();

  const slideId = String(formData.get("id") ?? "").trim();
  const direction = String(formData.get("direction") ?? "").trim();

  if (!slideId || (direction !== "up" && direction !== "down")) {
    redirect("/admin/homepage-slider?error=Invalid+slide+reorder+request");
  }

  const orderedSlides = await db.query.homepageSlides.findMany({
    orderBy: [asc(homepageSlides.sortOrder), asc(homepageSlides.createdAt)],
  });

  const currentIndex = orderedSlides.findIndex((slide) => slide.id === slideId);
  if (currentIndex === -1) {
    redirect("/admin/homepage-slider?error=Slide+not+found");
  }

  const targetIndex = direction === "up" ? currentIndex - 1 : currentIndex + 1;

  if (targetIndex < 0 || targetIndex >= orderedSlides.length) {
    redirect("/admin/homepage-slider");
  }

  const reorderedSlides = [...orderedSlides];
  [reorderedSlides[currentIndex], reorderedSlides[targetIndex]] = [reorderedSlides[targetIndex], reorderedSlides[currentIndex]];

  await db.transaction(async (tx) => {
    for (const [index, slide] of reorderedSlides.entries()) {
      await tx
        .update(homepageSlides)
        .set({
          sortOrder: index,
          updatedAt: new Date(),
        })
        .where(eq(homepageSlides.id, slide.id));
    }
  });

  refreshHomepageSliderPages();
  redirect("/admin/homepage-slider?status=reordered");
}

export async function createI18nStringAction(formData: FormData) {
  await assertAdmin();

  const parsed = i18nStringCreateSchema.safeParse({
    key: formData.get("key"),
    geo: formData.get("geo"),
    en: formData.get("en"),
    ru: formData.get("ru"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues[0]?.message ?? "Invalid translation payload";
    redirect(`/admin/i18n?error=${encodeURIComponent(errorMessage)}`);
  }

  const existingByKey = await db.query.i18nStrings.findFirst({
    where: eq(i18nStrings.key, parsed.data.key),
    columns: { id: true },
  });

  if (existingByKey) {
    redirect("/admin/i18n?error=Translation+key+already+exists");
  }

  try {
    await db.insert(i18nStrings).values({
      key: parsed.data.key,
      geo: parsed.data.geo,
      en: parsed.data.en,
      ru: parsed.data.ru,
      description: parsed.data.description,
      updatedAt: new Date(),
    });
  } catch {
    redirect("/admin/i18n?error=Could+not+create+translation");
  }

  refreshI18nPages();
  redirect("/admin/i18n?status=created");
}

export async function updateI18nStringAction(formData: FormData) {
  await assertAdmin();

  const parsed = i18nStringUpdateSchema.safeParse({
    id: formData.get("id"),
    key: formData.get("key"),
    geo: formData.get("geo"),
    en: formData.get("en"),
    ru: formData.get("ru"),
    description: formData.get("description"),
  });

  if (!parsed.success) {
    const errorMessage = parsed.error.issues[0]?.message ?? "Invalid translation payload";
    redirect(`/admin/i18n?error=${encodeURIComponent(errorMessage)}`);
  }

  const existingById = await db.query.i18nStrings.findFirst({
    where: eq(i18nStrings.id, parsed.data.id),
    columns: { id: true },
  });

  if (!existingById) {
    redirect("/admin/i18n?error=Translation+not+found");
  }

  const existingByKey = await db.query.i18nStrings.findFirst({
    where: eq(i18nStrings.key, parsed.data.key),
    columns: { id: true },
  });

  if (existingByKey && existingByKey.id !== parsed.data.id) {
    redirect("/admin/i18n?error=Translation+key+already+exists");
  }

  try {
    await db
      .update(i18nStrings)
      .set({
        key: parsed.data.key,
        geo: parsed.data.geo,
        en: parsed.data.en,
        ru: parsed.data.ru,
        description: parsed.data.description,
        updatedAt: new Date(),
      })
      .where(eq(i18nStrings.id, parsed.data.id));
  } catch {
    redirect("/admin/i18n?error=Could+not+update+translation");
  }

  refreshI18nPages();
  redirect("/admin/i18n?status=updated");
}

export async function deleteI18nStringAction(formData: FormData) {
  await assertAdmin();

  const id = String(formData.get("id") ?? "").trim();

  if (!id) {
    redirect("/admin/i18n?error=Invalid+translation+ID");
  }

  try {
    await db.delete(i18nStrings).where(eq(i18nStrings.id, id));
  } catch {
    redirect("/admin/i18n?error=Could+not+delete+translation");
  }

  refreshI18nPages();
  redirect("/admin/i18n?status=deleted");
}
