import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { createSession } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  console.log("Auth callback triggered");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  if (!code) {
    console.error("No code provided in callback");
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

    console.log("Exchanging code for session...");
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (sessionError) {
      console.error("Session exchange error:", sessionError);
      return NextResponse.redirect(
        new URL("/signin?error=session_exchange", request.url)
      );
    }

    console.log("Getting user info...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User fetch error:", userError || "No user returned");
      return NextResponse.redirect(
        new URL("/signin?error=user_fetch", request.url)
      );
    }

    console.log("User authenticated:", user.email);

    try {
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        console.log("Existing user found:", existingUser.username);
        await createSession(existingUser.username);
      } else {
        console.log("Creating new user");

        const username =
          user.user_metadata?.preferred_username ||
          user.user_metadata?.name?.replace(/\s+/g, "").toLowerCase() ||
          user.email.split("@")[0];

        const name =
          user.user_metadata?.full_name || user.user_metadata?.name || username;

        try {
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
          console.log("User created:", newUser.username);
          await createSession(newUser.username);
        } catch (createError) {
          console.error("Failed to create user:", createError);
          return NextResponse.redirect(
            new URL("/signin?error=user_creation", request.url)
          );
        }
      }

      return NextResponse.redirect(new URL("/dashboard", request.url));
    } catch (dbError) {
      console.error("Database error:", dbError);
      return NextResponse.redirect(
        new URL("/signin?error=database", request.url)
      );
    }
  } catch (error) {
    console.error("General error in OAuth callback:", error);
    return NextResponse.redirect(new URL("/signin?error=general", request.url));
  }
}
