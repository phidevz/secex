import { allowedLocales, cookieName, defaultLocale } from "src/app/i18n";
import { type NextRequest, NextResponse } from "next/server";
import acceptLanguage from "accept-language";

acceptLanguage.languages(allowedLocales);

export default function middleware(req: NextRequest) {
  // Ignore paths with "icon" or "chrome"
  if (
    req.nextUrl.pathname.includes("icon") ||
    req.nextUrl.pathname.includes("chrome")
  ) {
    return NextResponse.next();
  }
  let lng: string | null = null;
  // Try to get language from cookie
  if (req.cookies.has(cookieName)) {
    lng = acceptLanguage.get(req.cookies.get(cookieName)?.value);
  }
  // If no cookie, check the Accept-Language header
  lng ??= acceptLanguage.get(req.headers.get("Accept-Language"));
  // Default to fallback language if still undefined
  lng ??= defaultLocale;

  if (!req.cookies.has(cookieName)) {
    req.cookies.set(cookieName, lng);
  }

  return NextResponse.next({ request: req });
}

// Apply middleware only to relevant routes (excluding API, static files, and internal Next.js paths)
export const config = {
  // Avoid matching for static files, API routes, etc.
  matcher: [
    "/((?!api|_next/static|_next/image|assets|favicon.ico|sw.js|site.webmanifest).*)",
  ],
};
