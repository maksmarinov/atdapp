import { getSession } from "./auth";
import { cache } from "react";
// import { unstable_cacheTag as cacheTag } from "next/cache";
import { PrismaClient } from "@prisma/client/extension";
import { User } from "@prisma/client";

const prisma = new PrismaClient();

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  if (
    typeof window === "undefined" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return null;
  }
  try {
    if (!session.id) {
      console.error("Session found, but user identifier is missing.");
      return null;
    }

    const user = await prisma.User.id.findUnique({
      where: {
        id: session.id,
      },
    });

    return user;
  } catch (error) {
    console.error(`Error getting current user(${session.id}):`, error);

    return null;
  }
});

export const getUserByEmail = cache(
  async (email: string): Promise<User | null> => {
    if (!email) {
      console.log("getUserByEmail called with empty email.");
      return null;
    }

    try {
      console.log(`Workspaceing user with email: ${email}`);

      const user = await prisma.user.findUnique({
        where: {
          email: email,
        },
      });

      if (!user) {
        console.log(`User not found with email: ${email}`);
        return null;
      }

      console.log(`User found: ${user.id}`);
      return user;
    } catch (error) {
      console.error(`Error fetching user by email (${email}):`, error);
      return null;
    }
  }
);

export const mockFetch = <T>(data: T, delay: number): Promise<T> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(data);
    }, delay);
  });
};

export function isValidEmail(email: string) {
  return /\S+@\S+\.\S+/.test(email);
}
export function slugify(text: string) {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, "-") // Replace spaces with -
    .replace(/[^\w-]+/g, "") // Remove all non-word chars
    .replace(/--+/g, "-") // Replace multiple - with single -
    .replace(/^-+/, "") // Trim - from start of text
    .replace(/-+$/, ""); // Trim - from end of text
}
