import { NextResponse } from "next/server";
import { NextRequest } from "next/server";
import * as jose from "jose";

// This function runs before the request is completed
export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Get the auth_token cookie - this matches your auth.ts implementation
  const token = request.cookies.get("auth_token")?.value;

  let isAuthenticated = false;

  // Verify the token if it exists (similar to your verifyJWT function)
  if (token) {
    try {
      const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET);
      await jose.jwtVerify(token, JWT_SECRET);
      isAuthenticated = true;
    } catch {
      // Token is invalid or expired
      isAuthenticated = false;
    }
  }

  // Auth pages - redirect to dashboard if already logged in
  if (pathname === "/" || pathname === "/signin" || pathname === "/signup") {
    if (isAuthenticated) {
      return NextResponse.redirect(new URL("/dashboard", request.url));
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

// Specify which routes this middleware should run for
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
