import { NextResponse } from "next/server";
import { NextRequest } from "next/server";

export async function middleware(req: NextRequest) {
  const res = NextResponse.next();
  const body = req;
  return [res, body];
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
