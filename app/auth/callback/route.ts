import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

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

    if (user) {
      try {
        const existingUser = await prisma.user.findUnique({
          where: {
            email: user.email,
          },
        });

        if (!existingUser) {
          const username =
            user.user_metadata?.username ||
            user.email?.split("@")[0] ||
            `user_${Math.random().toString(36).substring(2, 10)}`;

          const name =
            user.user_metadata?.full_name ||
            user.user_metadata?.name ||
            username;

          await prisma.user.create({
            data: {
              email: user.email,
              username: username,
              name: name,

              password:
                Math.random().toString(36).slice(-10) +
                Math.random().toString(36).slice(-10),
            },
          });

          console.log("Created new user from Google OAuth:", username);
        } else {
          console.log("User already exists:", existingUser.username);
        }

        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session?.user) {
          const { createSession } = await import("@/app/lib/auth");

          const username =
            existingUser?.username ||
            user.user_metadata?.username ||
            user.email?.split("@")[0];

          await createSession(username);
        }
      } catch (error) {
        console.error("Error in auth callback:", error);
      }
    }
  }

  return NextResponse.redirect(new URL("/dashboard", request.url));
}
