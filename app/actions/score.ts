/* eslint-disable @typescript-eslint/no-explicit-any */
"use server";

import { getUserScore } from "@/app/lib/utils";
import { getCurrentUser } from "@/app/lib/utils";
import prisma from "../lib/prisma";
export type ActionResponse = {
  success: boolean;
  message: string;
  data?: any;
};

export async function fetchUserScore() {
  return await getUserScore();
}

export async function updateUserScore(score: number): Promise<ActionResponse> {
  try {
    const currentUser = await getCurrentUser();
    if (!currentUser) {
      return { success: false, message: "User not found" };
    }

    await prisma.user.update({
      where: {
        id: currentUser.id,
      },
      data: {
        // Fixed: Added missing data wrapper
        score: score,
      },
    });

    return {
      success: true,
      message: "Score updated successfully",
      data: { newScore: score },
    };
  } catch (error) {
    console.error("Could not update user score:", error);
    return { success: false, message: "Failed to update score" };
  }
}
