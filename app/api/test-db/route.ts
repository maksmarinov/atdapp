import { NextResponse } from "next/server";
import prisma from "@/app/lib/prisma";
import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

export async function GET() {
  try {
    // Log the database URL (redacted)
    const dbUrl = process.env.DATABASE_URL || "Not set";
    const redactedUrl = dbUrl.replace(/:[^:@]*@/, ":****@");
    console.log("Database URL:", redactedUrl);

    // Try to connect using standard Prisma client
    console.log("Testing with standard Prisma client");
    let result;
    try {
      // Use a query that doesn't need any tables
      result = await prisma.$queryRaw`SELECT 1 as test`;
      console.log("Standard Prisma connection successful");
    } catch (err) {
      console.error("Standard Prisma connection failed:", err);

      // Try with direct client and connection pooler
      console.log("Trying with direct Prisma client and connection pooler");
      const directClient = new PrismaClient({
        datasources: {
          db: {
            url: "postgresql://postgres.jkcymhzpgcavyakojcvr:YOUR_PASSWORD@aws-0-us-west-1.pooler.supabase.com:6543/postgres?sslmode=require",
          },
        },
      });

      try {
        result = await directClient.$queryRaw`SELECT 1 as test`;
        console.log("Direct Prisma with pooler connection successful");
      } catch (directErr) {
        console.error(
          "Direct Prisma with pooler connection failed:",
          directErr
        );

        // Try with Accelerate as last resort
        console.log("Trying with Prisma Accelerate");
        const accelerateClient = new PrismaClient().$extends(withAccelerate());

        try {
          result = await accelerateClient.$queryRaw`SELECT 1 as test`;
          console.log("Prisma Accelerate connection successful");
        } catch (accErr) {
          console.error("Prisma Accelerate connection failed:", accErr);
          throw accErr;
        }
      }
    }

    return NextResponse.json({
      success: true,
      message: "Database connection test successful",
      environment: process.env.NODE_ENV,
      result,
    });
  } catch (error) {
    console.error("Database test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
        stack: error instanceof Error ? error.stack : undefined,
        environment: process.env.NODE_ENV,
      },
      { status: 500 }
    );
  }
}
