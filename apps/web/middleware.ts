import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const publicRoutes = ["/sign-up", "/sign-in", "/forgot-password", "/"];
const authRoutes = ["/sign-up", "/sign-in", "/forgot-password"];
const appRoutes = ["/dashboard", "/workspace-setup", "/projects", "/cases", "/datasets", "/sql-lab", "/insights", "/documentation", "/settings"];

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("df_session");
  const isAuthenticated = !!sessionCookie;

  if (publicRoutes.includes(pathname)) {
    if (isAuthenticated && authRoutes.includes(pathname)) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!isAuthenticated) {
    const url = new URL("/sign-in", request.url);
    if (pathname !== "/") {
      url.searchParams.set("next", pathname);
    }
    return NextResponse.redirect(url);
  }

  if (appRoutes.includes(pathname)) {
    if (pathname === "/workspace-setup") {
      const setupCookie = request.cookies.get("df_setup_complete");
      if (setupCookie?.value === "true") {
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
      return NextResponse.next();
    }

    if (pathname === "/dashboard") {
      const setupCookie = request.cookies.get("df_setup_complete");
      if (setupCookie?.value !== "true") {
        return NextResponse.redirect(new URL("/workspace-setup", request.url));
      }
      return NextResponse.next();
    }

    return NextResponse.next();
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};
