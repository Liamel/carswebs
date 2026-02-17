import { redirect } from "next/navigation";

import { DEFAULT_LOCALE } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";

export async function redirectToPreferredLocale(pathname: string) {
  redirect(withLocalePath(DEFAULT_LOCALE, pathname));
}
