import type { MetadataRoute } from "next";

import { db } from "@/lib/db";
import { cars } from "@/lib/db/schema";
import { SUPPORTED_LOCALES } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";

const FALLBACK_SITE_URL = "https://example.com";

function siteUrl() {
  return process.env.NEXT_PUBLIC_SITE_URL?.trim() || FALLBACK_SITE_URL;
}

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const baseUrl = siteUrl();
  const staticPaths = ["/", "/models", "/book-test-drive", "/about", "/contact"];
  const modelRows = await db.select({ slug: cars.slug }).from(cars);

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of SUPPORTED_LOCALES) {
    for (const pathname of staticPaths) {
      entries.push({
        url: new URL(withLocalePath(locale, pathname), baseUrl).toString(),
        lastModified: now,
        changeFrequency: pathname === "/models" ? "daily" : "weekly",
        priority: pathname === "/" ? 1 : pathname === "/models" ? 0.9 : 0.7,
      });
    }

    for (const model of modelRows) {
      entries.push({
        url: new URL(withLocalePath(locale, `/models/${model.slug}`), baseUrl).toString(),
        lastModified: now,
        changeFrequency: "weekly",
        priority: 0.8,
      });
    }
  }

  return entries;
}
