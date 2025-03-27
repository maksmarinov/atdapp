import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    // Test a simple query
    const count = await prisma.user.count();
    return NextResponse.json({
      status: "success",
      message: "Database connected",
      count,
      connection: {
        url: process.env.DATABASE_URL?.substring(0, 20) + "...", // Only show the beginning for security
      },
    });
  } catch (error) {
    console.error("Database test error:", error);
    return NextResponse.json(
      {
        status: "error",
        message: error instanceof Error ? error.message : "Unknown error",
        connection: {
          url: process.env.DATABASE_URL?.substring(0, 20) + "...", // Only show the beginning for security
        },
      },
      { status: 500 }
    );
  }
}
