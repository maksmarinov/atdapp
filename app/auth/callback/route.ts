import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { createSession } from "@/app/lib/auth";

export async function GET(request: NextRequest) {
  console.log("Auth callback triggered");
  const requestUrl = new URL(request.url);
  console.log("Request URL:", request.url);

  const code = requestUrl.searchParams.get("code");
  console.log("Code present:", !!code);

  const redirectPath =
    requestUrl.searchParams.get("redirectPath") || "/dashboard";
  console.log("Redirect path:", redirectPath);

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
        new URL(
          `/signin?error=session_exchange&message=${encodeURIComponent(
            sessionError.message
          )}`,
          request.url
        )
      );
    }

    console.log("Session exchange successful");

    console.log("Getting user info...");
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();

    if (userError) {
      console.error("User fetch error:", userError);
      return NextResponse.redirect(
        new URL(
          `/signin?error=user_fetch&message=${encodeURIComponent(
            userError.message
          )}`,
          request.url
        )
      );
    }

    if (!user?.email) {
      console.error("No user email returned from auth");
      return NextResponse.redirect(
        new URL(`/signin?error=no_email`, request.url)
      );
    }

    console.log("User info retrieved:", {
      id: user.id,
      email: user.email,
      metadata: user.user_metadata,
    });

    try {
      console.log("Checking for existing user with email:", user.email);
      let existingUser = await prisma.user.findUnique({
        where: { email: user.email },
      });

      if (existingUser) {
        console.log("Existing user found:", existingUser.username);
        await createSession(existingUser.username);
        console.log("Session created for existing user");
      } else {
        console.log("Creating new user from Google OAuth");
        const username =
          user.user_metadata?.preferred_username ||
          user.user_metadata?.name?.replace(/\s+/g, "").toLowerCase() ||
          user.email.split("@")[0];

        const name =
          user.user_metadata?.full_name || user.user_metadata?.name || username;

        console.log("New user data:", { email: user.email, username, name });

        try {
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
          console.log("Session created for new user");
        } catch (createError) {
          console.error("User creation error:", createError);
          return NextResponse.redirect(
            new URL(
              `/signin?error=user_creation&message=${encodeURIComponent(
                createError.message
              )}`,
              request.url
            )
          );
        }
      }

      console.log("Redirecting to:", redirectPath);
      return NextResponse.redirect(new URL(redirectPath, request.url));
    } catch (dbError) {
      console.error("Database operation error:", dbError);
      return NextResponse.redirect(
        new URL(
          `/signin?error=database&message=${encodeURIComponent(
            dbError.message
          )}`,
          request.url
        )
      );
    }
  } catch (error) {
    console.error("General error in OAuth callback:", error);
    return NextResponse.redirect(
      new URL(
        `/signin?error=general&message=${encodeURIComponent(error.message)}`,
        request.url
      )
    );
  }
}
