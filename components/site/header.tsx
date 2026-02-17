import { SiteHeaderClient } from "@/components/site/header-client";
import { getCarsOverlaySummary } from "@/lib/db/queries";

export async function SiteHeader() {
  const cars = await getCarsOverlaySummary();

  return <SiteHeaderClient cars={cars} />;
}
