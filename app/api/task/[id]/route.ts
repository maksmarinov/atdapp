import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Changed parameter structure to match Next.js requirements
export async function GET(
  request: Request,
  context: { params: { id: string } }
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
    return NextResponse.json(
      { message: "Failed to fetch task:", error },
      { status: 500 }
    );
  }
}
