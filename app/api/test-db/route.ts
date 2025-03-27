import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";

export async function GET() {
  try {
    console.log("Testing database connection");
    console.log(
      "Database URL:",
      process.env.DATABASE_URL?.substring(0, 15) + "..."
    );
    console.log("Environment:", process.env.NODE_ENV);

    // Try a simple query
    const count = await prisma.user.count();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      count,
      environment: process.env.NODE_ENV,
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}
