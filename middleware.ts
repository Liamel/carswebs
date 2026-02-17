import { NextResponse, type NextRequest } from "next/server";

import {
  DEFAULT_LOCALE,
  LOCALE_COOKIE_MAX_AGE,
  LOCALE_COOKIE_NAME,
  normalizeLocale,
} from "@/lib/i18n/config";
import { withLocalePath } from "@/lib/i18n/path";

function setLocaleCookie(response: NextResponse, locale: string) {
  response.cookies.set({
    name: LOCALE_COOKIE_NAME,
    value: locale,
    maxAge: LOCALE_COOKIE_MAX_AGE,
    path: "/",
    sameSite: "lax",
  });
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const segments = pathname.split("/");
  const firstSegment = segments[1] ?? "";
  const cookieLocale = normalizeLocale(request.cookies.get(LOCALE_COOKIE_NAME)?.value);
  const pathLocale = normalizeLocale(firstSegment);

  if (pathLocale) {
    const canonicalPath = withLocalePath(pathLocale, pathname);

    if (canonicalPath !== pathname) {
      const redirectUrl = request.nextUrl.clone();
      redirectUrl.pathname = canonicalPath;
      const redirectResponse = NextResponse.redirect(redirectUrl);
      setLocaleCookie(redirectResponse, pathLocale);
      return redirectResponse;
    }

    const response = NextResponse.next();

    if (cookieLocale !== pathLocale) {
      setLocaleCookie(response, pathLocale);
    }

    return response;
  }

  const preferredLocale = cookieLocale ?? DEFAULT_LOCALE;
  const redirectUrl = request.nextUrl.clone();
  redirectUrl.pathname = withLocalePath(preferredLocale, pathname);
  const response = NextResponse.redirect(redirectUrl);
  setLocaleCookie(response, preferredLocale);
  return response;
}

export const config = {
  matcher: ["/((?!api|admin|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\..*).*)"],
};
