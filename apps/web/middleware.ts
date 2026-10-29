import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const sessionCookie = request.cookies.get("df_session");
  const setupCookie = request.cookies.get("df_setup_complete");
  
  const isAuthenticated = !!sessionCookie;
  const hasCompletedSetup = setupCookie?.value === "true";

  const publicRoutes = ["/sign-up", "/sign-in", "/forgot-password", "/"];
  const authRoutes = ["/sign-up", "/sign-in", "/forgot-password"];

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

  if (pathname === "/workspace-setup") {
    if (hasCompletedSetup) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
    return NextResponse.next();
  }

  if (!hasCompletedSetup && pathname !== "/workspace-setup") {
    return NextResponse.redirect(new URL("/workspace-setup", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico).*)"],
};


