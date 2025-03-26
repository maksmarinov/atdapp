import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { createSession } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  const redirectPath =
    requestUrl.searchParams.get("redirectPath") || "/dashboard";

  if (code) {
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

    await supabase.auth.exchangeCodeForSession(code);

    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user?.email) {
      try {
        let existingUser = await prisma.user.findUnique({
          where: { email: user.email },
        });

        if (existingUser) {
          console.log("Existing user logged in:", existingUser.username);
          await createSession(existingUser.username);
        } else {
          const username =
            user.user_metadata?.preferred_username ||
            user.user_metadata?.name?.replace(/\s+/g, "").toLowerCase() ||
            user.email.split("@")[0];

          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            username;

          existingUser = await prisma.user.create({
            data: {
              email: user.email,
              username,
              name,
              password:
                Math.random().toString(36).slice(-16) +
                Math.random().toString(36).slice(-16),
            },
          });

          console.log("Created new user:", existingUser.username);
          await createSession(existingUser.username);
        }

        return NextResponse.redirect(new URL(redirectPath, request.url));
      } catch (error) {
        console.error("Error in OAuth callback:", error);
      }
    }
  }

  return NextResponse.redirect(new URL("/signin", request.url));
}
