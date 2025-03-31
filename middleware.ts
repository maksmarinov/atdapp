import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import { jwtVerify } from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // IMPORTANT: Skip auth check on authentication pages
  if (pathname.includes("/signin") || pathname.includes("/signup")) {
    return NextResponse.next();
  }

  const token = request.cookies.get("auth_token")?.value;
  let isAuthenticated = false;

  if (token) {
    try {
      const secret = new TextEncoder().encode(process.env.JWT_SECRET);
      await jwtVerify(token, secret);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  // Protected routes - redirect to login if not authenticated
  if (
    (pathname.startsWith("/dashboard") ||
      pathname.startsWith("/game") ||
      pathname === "/profile") &&
    !isAuthenticated
  ) {
    return NextResponse.redirect(new URL("/signin", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/dashboard/:path*", "/game", "/profile", "/signin", "/signup"],
};
