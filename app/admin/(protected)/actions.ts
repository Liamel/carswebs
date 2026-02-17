"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { requireAdminSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { bookings, cars, content } from "@/lib/db/schema";
import { carSchema } from "@/lib/validations/car";
import { bookingStatusSchema } from "@/lib/validations/booking";
import { highlightListSchema, homepageContentSchema } from "@/lib/validations/content";

async function assertAdmin() {
  const session = await requireAdminSession();

  if (!session?.user?.email) {
    redirect("/admin/login?error=Unauthorized");
  }

  return session;
}

function parseBooleanCheckbox(value: FormDataEntryValue | null) {
  return value === "on";
}

function refreshPublicPages() {
  revalidatePath("/");
  revalidatePath("/models");
}

export async function createCarAction(formData: FormData) {
  await assertAdmin();

  const parsed = carSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    priceFrom: formData.get("priceFrom"),
    bodyType: formData.get("bodyType"),
    description: formData.get("description"),
    featured: parseBooleanCheckbox(formData.get("featured")),
    specsJson: formData.get("specsJson"),
    imagesJson: formData.get("imagesJson"),
  });

  if (!parsed.success) {
    redirect("/admin/cars?error=Invalid+car+form+data");
  }

  try {
    await db.insert(cars).values({
      name: parsed.data.name,
      slug: parsed.data.slug,
      priceFrom: parsed.data.priceFrom,
      bodyType: parsed.data.bodyType,
      description: parsed.data.description,
      featured: parsed.data.featured,
      specs: parsed.data.specsJson,
      images: parsed.data.imagesJson,
    });
  } catch {
    redirect("/admin/cars?error=Could+not+create+car+(check+slug+uniqueness)");
  }

  revalidatePath("/admin/cars");
  refreshPublicPages();
  redirect("/admin/cars?status=created");
}

export async function updateCarAction(formData: FormData) {
  await assertAdmin();

  const carId = Number(formData.get("id"));
  if (!Number.isFinite(carId) || carId <= 0) {
    redirect("/admin/cars?error=Invalid+car+ID");
  }

  const parsed = carSchema.safeParse({
    name: formData.get("name"),
    slug: formData.get("slug"),
    priceFrom: formData.get("priceFrom"),
    bodyType: formData.get("bodyType"),
    description: formData.get("description"),
    featured: parseBooleanCheckbox(formData.get("featured")),
    specsJson: formData.get("specsJson"),
    imagesJson: formData.get("imagesJson"),
  });

  if (!parsed.success) {
    redirect("/admin/cars?error=Invalid+update+payload");
  }

  try {
    await db
      .update(cars)
      .set({
        name: parsed.data.name,
        slug: parsed.data.slug,
        priceFrom: parsed.data.priceFrom,
        bodyType: parsed.data.bodyType,
        description: parsed.data.description,
        featured: parsed.data.featured,
        specs: parsed.data.specsJson,
        images: parsed.data.imagesJson,
        updatedAt: new Date(),
      })
      .where(eq(cars.id, carId));
  } catch {
    redirect("/admin/cars?error=Could+not+update+car");
  }

  revalidatePath("/admin/cars");
  refreshPublicPages();
  redirect("/admin/cars?status=updated");
}

export async function deleteCarAction(formData: FormData) {
  await assertAdmin();

  const carId = Number(formData.get("id"));

  if (!Number.isFinite(carId) || carId <= 0) {
    redirect("/admin/cars?error=Invalid+car+ID");
  }

  try {
    await db.delete(cars).where(eq(cars.id, carId));
  } catch {
    redirect("/admin/cars?error=Could+not+delete+car");
  }

  revalidatePath("/admin/cars");
  refreshPublicPages();
  redirect("/admin/cars?status=deleted");
}

export async function updateBookingStatusAction(formData: FormData) {
  await assertAdmin();

  const bookingId = Number(formData.get("id"));
  const status = bookingStatusSchema.safeParse(formData.get("status"));

  if (!Number.isFinite(bookingId) || bookingId <= 0 || !status.success) {
    redirect("/admin/bookings?error=Invalid+booking+update");
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
    redirect("/admin/bookings?error=Could+not+update+booking");
  }

  revalidatePath("/admin/bookings");
  redirect("/admin/bookings?status=updated");
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
    highlightsJson: formData.get("highlightsJson"),
  });

  if (!parsed.success) {
    redirect("/admin/content?error=Invalid+content+payload");
  }

  let parsedHighlights;
  try {
    parsedHighlights = highlightListSchema.parse(JSON.parse(parsed.data.highlightsJson));
  } catch {
    redirect("/admin/content?error=Highlights+must+be+a+valid+JSON+array");
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
    highlights: parsedHighlights,
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
  revalidatePath("/");
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
