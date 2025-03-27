import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { createSession } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    return NextResponse.redirect(new URL("/signin?error=no_code", request.url));
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async getAll() {
            const cookieStore = await cookies();
            return cookieStore.getAll().map((cookie) => ({
              name: cookie.name,
              value: cookie.value,
            }));
          },
          async setAll(cookiesList) {
            const cookieStore = await cookies();
            cookiesList.forEach((cookie) => {
              cookieStore.set({
                name: cookie.name,
                value: cookie.value,
                ...cookie.options,
              });
            });
          },
        },
      }
    );

    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (sessionError) {
      return NextResponse.redirect(
        new URL(`/signin?error=session_exchange`, request.url)
      );
    }

    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      return NextResponse.redirect(
        new URL(`/signin?error=user_fetch`, request.url)
      );
    }

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        await createSession(existingUser.username);
      } else {
        // Create new user
        const username = user.email.split("@")[0];
        const name = user.user_metadata?.name || username;

        const newUser = await prisma.user.create({
          data: {
            email: user.email,
            username,
            name,
            password:
              Math.random().toString(36).slice(-16) +
              Math.random().toString(36).slice(-16),
          },
        });

        await createSession(newUser.username);
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch {
      return NextResponse.redirect(
        new URL(`/signin?error=database`, request.url)
      );
    }
  } catch {
    return NextResponse.redirect(new URL(`/signin?error=general`, request.url));
  }
}
