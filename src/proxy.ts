import { NextResponse, type NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const target = request.nextUrl.clone();
  let pathname: string;
  try {
    pathname = decodeURIComponent(target.pathname);
  } catch {
    return NextResponse.next();
  }

  // Public pages use one path segment. Preserve case-sensitive asset and API URLs.
  if (!/^\/[a-z0-9_-]+(?:\.\d[a-z0-9_-]*)*(?:\.(?:php|html))?\/?$/i.test(pathname) || /^\/(?:api|_next)(?:\/|$)/i.test(pathname)) {
    return NextResponse.next();
  }

  target.pathname = pathname.toLowerCase();
  if (/^\/(?:blog|page)(?:\.php)?\/?$/.test(target.pathname)) {
    const slug = target.searchParams.get("slug");
    if (slug) target.searchParams.set("slug", slug.toLowerCase());
  }

  return target.href !== request.nextUrl.href
    ? NextResponse.redirect(target, 308)
    : NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next|api|images|profile|admin|videos|fonts).*)"],
};
