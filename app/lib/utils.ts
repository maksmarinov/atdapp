import { getSession } from "./auth";
import { cache } from "react";
import prisma from "./prisma";
import { cacheTag } from "next/dist/server/use-cache/cache-tag";

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
    if (!session.username) {
      console.error("Session found, but user identifier is missing.");
      return null;
    }

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
export async function getTask(id: number) {
  try {
    const result = await prisma.task.findFirst({
      where: {
        id: id,
      },
      include: {
        user: true,
      },
    });
    return result;
  } catch (error) {
    console.error(`Error fetching task ${id}:`, error);
    throw new Error("Failed to fetch task");
  }
}
export async function getAllTasks() {
  "use cache";
  cacheTag("tasks");
  try {
    const result = await prisma.task.findMany({
      include: {
        user: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });
    return result;
  } catch (error) {
    console.error(`Error fetching tasks`, error);
    throw new Error("Failed to fetch tasks");
  }
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

// Add this function to get the current user's tasks
