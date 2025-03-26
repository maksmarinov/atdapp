import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { createSession } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  console.log("Auth callback triggered");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const redirectPath =
    requestUrl.searchParams.get("redirectPath") || "/dashboard";

  if (!code) {
    console.error("No code provided in callback");
    return NextResponse.redirect(new URL("/signin?error=no_code", request.url));
  }

  try {
    // Create Supabase client
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

    // Exchange code for session
    console.log("Exchanging code for session...");
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
      code
    );
    if (sessionError) {
      console.error("Session exchange error:", sessionError);
      return NextResponse.redirect(
        new URL(`/signin?error=session_exchange`, request.url)
      );
    }

    // Get the authenticated user
    console.log("Getting user info...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user) {
      console.error("User fetch error:", userError || "No user returned");
      return NextResponse.redirect(
        new URL(`/signin?error=user_fetch`, request.url)
      );
    }

    console.log("User authenticated:", user.email);

    // TEST: Check database connection
    try {
      const dbTestCount = await prisma.user.count();
      console.log("Database connection successful. User count:", dbTestCount);
    } catch (dbTestError) {
      console.error("DATABASE CONNECTION ERROR:", dbTestError);
      return NextResponse.redirect(
        new URL(`/signin?error=db_connection`, request.url)
      );
    }

    try {
      // Check if user already exists in database
      console.log("Checking for existing user with email:", user.email);
      const existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        console.log("Existing user found in database:", existingUser.username);
        await createSession(existingUser.username);
        return NextResponse.redirect(new URL(redirectPath, request.url));
      } else {
        console.log("No existing user found, creating new user record");

        // Parse user details from Google metadata
        const username =
          user.user_metadata?.preferred_username ||
          user.user_metadata?.name?.replace(/\s+/g, "").toLowerCase() ||
          user.email.split("@")[0];

        const name =
          user.user_metadata?.full_name || user.user_metadata?.name || username;

        console.log("Creating user with data:", {
          email: user.email,
          username,
          name,
        });

        try {
          // Create user in database
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

          console.log("Database user created successfully:", newUser.username);
          await createSession(newUser.username);
          return NextResponse.redirect(new URL(redirectPath, request.url));
        } catch (createError) {
          console.error(
            "CRITICAL - Database user creation failed:",
            createError
          );

          // Detailed error for debugging
          let errorDetails = "unknown";
          if (createError instanceof Error) {
            errorDetails = `${createError.name}: ${createError.message}`;
            console.error("Error stack:", createError.stack);
          }

          return NextResponse.redirect(
            new URL(
              `/signin?error=db_create&details=${encodeURIComponent(
                errorDetails
              )}`,
              request.url
            )
          );
        }
      }
    } catch (dbError) {
      console.error("Database operation failed:", dbError);
      return NextResponse.redirect(
        new URL(`/signin?error=database`, request.url)
      );
    }
  } catch (error) {
    console.error("General error in callback:", error);
    return NextResponse.redirect(new URL(`/signin?error=general`, request.url));
  }
}
