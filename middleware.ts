import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as jose from "jose";

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get("auth_token")?.value;

  let isAuthenticated = false;

  if (token) {
    try {
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
      await jose.jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      isAuthenticated = false;
    }
  }

  if (pathname === "/" || pathname === "/signin" || pathname === "/signup") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
    }
  }

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
  matcher: [
    "/",
    "/signin",
    "/signup",
    "/dashboard/:path*",
    "/game",
    "/profile",
  ],
};
