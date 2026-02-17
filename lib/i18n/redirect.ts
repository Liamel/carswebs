import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { DEFAULT_LOCALE, LOCALE_COOKIE_NAME, normalizeLocale } from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";

export async function redirectToPreferredLocale(pathname: string) {
  const cookieStore = await cookies();
  const cookieLocale = normalizeLocale(cookieStore.get(LOCALE_COOKIE_NAME)?.value);
  const locale = cookieLocale ?? DEFAULT_LOCALE;

  redirect(withLocalePath(locale, pathname));
}
