import { getSession } from "./auth";
import { cache } from "react";
import prisma from "./prisma";

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;

  // Skip during build phase to prevent build issues
  if (
    typeof window === "undefined" &&
    process.env.NEXT_PHASE === "phase-production-build"
  ) {
    return null;
  }

  try {
    if (!session.username) {
      console.error("Session found, but user identifier is missing.");
      return null;
    }

    // Type-safe usage with properly cast result
    const user = await prisma.user.findUnique({
      where: {
        username: session.username,
      },
    });

    return user;
  } catch (error) {
    console.error("Error getting user by ID:", error);
    return null;
  }
});

export const getUserByEmail = cache(async (email: string) => {
  try {
    // Type-safe usage
    const result = await prisma.user.findUnique({
      where: {
        email,
      },
    });
    return result;
  } catch (error) {
    console.error("Error getting user by email:", error);
    return null;
  }
});

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
    .replace(/\s+/g, "-")
    .replace(/&/g, "-and-")
    .replace(/[^\w\-]+/g, "")
    .replace(/\-\-+/g, "-")
    .replace(/^-+/, "")
    .replace(/-+$/, "");
}
