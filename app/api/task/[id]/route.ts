import { NextRequest, NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

interface RouteContext {
  params: {
    id: string;
  };
}

export async function GET(
  request: NextRequest, // Changed from Request to NextRequest
  context: RouteContext // Using the defined interface instead of inline destructuring
) {
  try {
    const id = parseInt(context.params.id);

    if (isNaN(id)) {
      return NextResponse.json({ error: "Invalid ID" }, { status: 400 });
    }

    const task = await prisma.task.findUnique({
      where: { id },
    });

    if (!task) {
      return NextResponse.json({ error: "Task not found" }, { status: 404 });
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error("Error fetching task:", error);
    return NextResponse.json(
      { error: "Failed to fetch task" },
      { status: 500 }
    );
  }
}
