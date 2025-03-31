import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

// Fixed parameter structure according to Next.js docs
export async function GET(
  request: Request,
  { params }: { params: { id: string } } // CHANGED: Destructuring here is required
) {
  try {
    const id = parseInt(params.id);

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
  } catch {
    return NextResponse.json(
      { error: "Failed to fetch task" }, // Removed full error object
      { status: 500 }
    );
  }
}
