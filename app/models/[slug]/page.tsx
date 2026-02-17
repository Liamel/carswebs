import { redirectToPreferredLocale } from "@/lib/i18n/redirect";

type LegacyModelDetailPageProps = {
  params: Promise<{ slug: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function toQueryString(params: Record<string, string | string[] | undefined>) {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (!value) {
      continue;
    }

    if (Array.isArray(value)) {
      for (const entry of value) {
        searchParams.append(key, entry);
      }
      continue;
    }

    searchParams.set(key, value);
  }

  const serialized = searchParams.toString();
  return serialized ? `?${serialized}` : "";
}

export default async function LegacyModelDetailPage({ params, searchParams }: LegacyModelDetailPageProps) {
  const [{ slug }, resolvedSearchParams] = await Promise.all([params, searchParams]);
  await redirectToPreferredLocale(`/models/${slug}${toQueryString(resolvedSearchParams)}`);
}
