import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
// import prisma from "@/app/lib/prisma";
import { createSession } from "@/app/lib/auth";
import { PrismaClient } from "@prisma/client";

export async function GET(request: NextRequest) {
  console.log("Auth callback triggered");
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");

  // Diagnostic logging
  console.log(
    "DATABASE_URL environment variable:",
    process.env.DATABASE_URL
      ? `${process.env.DATABASE_URL.substring(0, 15)}...`
      : "Not set"
  );

  if (!code) {
    console.error("No code provided in callback");
    return NextResponse.redirect(new URL("/signin?error=no_code", request.url));
  }

  try {
    // Initialize Supabase client
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
    const { error: sessionError } = await supabase.auth.exchangeCodeForSession(
      code
    );

    if (sessionError) {
      console.error("Session exchange error:", sessionError);
      return NextResponse.redirect(
        new URL(
          `/signin?error=session_exchange&message=${encodeURIComponent(
            sessionError.message
          )}`,
          request.url
        )
      );
    }

    // Get authenticated user
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError || !user) {
      console.error("User fetch error:", userError || "No user returned");
      return NextResponse.redirect(
        new URL(
          `/signin?error=user_fetch&message=${userError?.message || "No user"}`,
          request.url
        )
      );
    }

    console.log("User authenticated:", user.email);

    try {
      // Create a direct Prisma instance with explicit connection URL as a fallback
      // This is a workaround for Vercel environment variable issues
      const directPrisma = new PrismaClient({
        datasources: {
          db: {
            url:
              process.env.DATABASE_URL ||
              "postgresql://prisma:slamdunk@db.jkcymhzpgcavyakojcvr.supabase.co:5432/postgres",
          },
        },
      });

      // Use explicit connection for database operations
      console.log("Checking for existing user with email:", user.email);
      const existingUser = await directPrisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        console.log("Existing user found:", existingUser.username);
        await createSession(existingUser.username);
        await directPrisma.$disconnect();
        return NextResponse.redirect(new URL("/dashboard", request.url));
      } else {
        console.log("Creating new user");
        const username =
          user.user_metadata?.preferred_username ||
          user.user_metadata?.name?.replace(/\s+/g, "").toLowerCase() ||
          user.email.split("@")[0];

        const name =
          user.user_metadata?.full_name || user.user_metadata?.name || username;

        try {
          const newUser = await directPrisma.user.create({
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
          await directPrisma.$disconnect();
          return NextResponse.redirect(new URL("/dashboard", request.url));
        } catch (createError) {
          await directPrisma.$disconnect();
          console.error("User creation error:", createError);
          return NextResponse.redirect(
            new URL(
              `/signin?error=create_user&message=${encodeURIComponent(
                String(createError)
              )}`,
              request.url
            )
          );
        }
      }
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return NextResponse.redirect(
        new URL(
          `/signin?error=database&message=${encodeURIComponent(
            String(dbError)
          )}`,
          request.url
        )
      );
    }
  } catch (error) {
    console.error("General error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL(
        `/signin?error=general&message=${encodeURIComponent(String(error))}`,
        request.url
      )
    );
  }
}
