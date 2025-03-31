"use server";

import { getCurrentUser } from "../lib/utils";
import { z } from "zod";
import { revalidateTag } from "next/cache";
import prisma from "../lib/prisma";
import { TaskStatus } from "@prisma/client";

const TaskSchema = z.object({
  title: z.string().min(1, { message: "Title is required" }),
  description: z.string().optional(),
  dueDate: z.coerce.date(),
  status: z.nativeEnum(TaskStatus).optional(),
});
export type TaskData = z.infer<typeof TaskSchema>;

export type ActionResponse = {
  success: boolean;
  message: string;
  errors?: Record<string, string[]>;
  error?: string;
};

export async function createTask(data: TaskData): Promise<ActionResponse> {
  try {
    // Debug logging
    console.log("Creating task with data:", data);

    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized. Please sign in.",
        error: "Unauthorized",
      };
    }

    const validateData = TaskSchema.safeParse(data);
    if (!validateData.success) {
      console.error("Validation failed:", validateData.error);
      return {
        success: false,
        message: "Invalid data",
        errors: validateData.error.flatten().fieldErrors,
      };
    }

    const validData = validateData.data;

    // Ensure we have a user ID
    const task = await prisma.task.create({
      data: {
        title: validData.title,
        description: validData.description || "",
        dueDate: validData.dueDate,
        status: validData.status || "IN_PROGRESS",
        userId: user.id, // Use the current user's ID, ignoring any passed ID
      },
    });

    console.log("Task created:", task);
    revalidateTag("tasks");

    return {
      success: true,
      message: "Task created successfully",
    };
  } catch (error) {
    console.error("Error creating task:", error);
    return {
      success: false,
      message: "Failed to create task",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function editTask(
  id: number,
  data: Partial<TaskData>
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized. Please sign in.",
        error: "Unauthorized",
      };
    }

    // Validate the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return {
        success: false,
        message: "Task not found or you don't have permission to edit it",
        error: "Not found or unauthorized",
      };
    }

    const EditTaskSchema = TaskSchema.partial();
    const validateData = EditTaskSchema.safeParse(data);

    if (!validateData.success) {
      return {
        success: false,
        message: "Invalid data",
        errors: validateData.error.flatten().fieldErrors,
      };
    }

    const validData = validateData.data;
    const updateData: Record<string, unknown> = {};

    if (validData.title !== undefined) updateData.title = validData.title;
    if (validData.description !== undefined)
      updateData.description = validData.description;
    if (validData.dueDate !== undefined) updateData.dueDate = validData.dueDate;
    if (validData.status !== undefined) updateData.status = validData.status;

    // Prisma update operation
    await prisma.task.update({
      where: {
        id: id,
      },
      data: updateData,
    });

    revalidateTag("tasks");
    return { success: true, message: "Task updated!" };
  } catch (error) {
    console.error("Error updating task:", error);
    return {
      success: false,
      message: "Failed to update task",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function markTaskAsDone(
  id: number,
  isDone: boolean
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized. Please sign in.",
        error: "Unauthorized",
      };
    }

    // Validate the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return {
        success: false,
        message: "Task not found or you don't have permission to modify it",
        error: "Not found or unauthorized",
      };
    }

    await prisma.task.update({
      where: {
        id: id,
      },
      data: {
        status: "done",
      },
    });

    revalidateTag("tasks");
    return {
      success: true,
      message: isDone
        ? "Task marked as complete!"
        : "Task marked as incomplete!",
    };
  } catch (error) {
    console.error("Error updating task status:", error);
    return {
      success: false,
      message: "Failed to update task status",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function deleteTask(id: number): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized. Please sign in.",
        error: "Unauthorized",
      };
    }

    // Validate the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return {
        success: false,
        message: "Task not found or you don't have permission to delete it",
        error: "Not found or unauthorized",
      };
    }

    // Delete the task
    await prisma.task.delete({
      where: {
        id: id,
      },
    });

    revalidateTag("tasks");
    return { success: true, message: "Task deleted successfully!" };
  } catch (error) {
    console.error("Error deleting task:", error);
    return {
      success: false,
      message: "Failed to delete task",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function markTaskStatus(
  id: number,
  status: TaskStatus
): Promise<ActionResponse> {
  try {
    const user = await getCurrentUser();
    if (!user) {
      return {
        success: false,
        message: "Unauthorized. Please sign in.",
        error: "Unauthorized",
      };
    }

    // Validate the task belongs to the user
    const existingTask = await prisma.task.findFirst({
      where: {
        id: id,
        userId: user.id,
      },
    });

    if (!existingTask) {
      return {
        success: false,
        message: "Task not found or you don't have permission to modify it",
        error: "Not found or unauthorized",
      };
    }

    await prisma.task.update({
      where: { id },
      data: { status },
    });

    revalidateTag("tasks");

    const statusMessages = {
      [TaskStatus.COMPLETED]: "Task marked as complete!",
      [TaskStatus.IN_PROGRESS]: "Task marked as in progress",
      [TaskStatus.PENDING]: "Task marked as pending",
    };

    return {
      success: true,
      message: statusMessages[status] || `Task status updated to ${status}`,
    };
  } catch (error) {
    console.error("Error updating task status:", error);
    return {
      success: false,
      message: "Failed to update task status",
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
