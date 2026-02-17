import { redirectToPreferredLocale } from "@/lib/i18n/redirect";

export default async function LegacyHomePage() {
  await redirectToPreferredLocale("/");
}
