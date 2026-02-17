import type { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    { url: "https://example.com/", lastModified: now, changeFrequency: "weekly", priority: 1 },
    { url: "https://example.com/models", lastModified: now, changeFrequency: "daily", priority: 0.9 },
    { url: "https://example.com/book-test-drive", lastModified: now, changeFrequency: "weekly", priority: 0.8 },
    { url: "https://example.com/about", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
    { url: "https://example.com/contact", lastModified: now, changeFrequency: "monthly", priority: 0.6 },
  ];
}
