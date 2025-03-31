import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    const allIssues = await prisma.task.findMany();
    return NextResponse.json(allIssues);
  } catch (error) {
    console.error("Error fetching issues:", error);
    return NextResponse.json(
      { error: "Failed to fetch issues" },
      { status: 500 }
    );
  }
}
export async function POST(request: Request) {
  try {
    const data = await request.json();
    if (!data.title || !data.userId) {
      return NextResponse.json(
        { error: "Title and userId are required" },
        { status: 400 }
      );
    }
    const newTask = await prisma.task
      .create({
        title: data.title,
        description: data.description,
        userId: data.userId,
        dueDate: data.dueDate,
      })
      .returning();
    return NextResponse.json(
      { message: "Task created successfully", task: newTask[0] },
      { status: 201 }
    );
  } catch (error) {
    console.error("Error creating task:", error);
    return NextResponse.json(
      { error: "Failed to create task" },
      { status: 500 }
    );
  }
}
