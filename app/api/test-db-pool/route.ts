import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

export async function GET() {
  try {
    const pooledDbUrl =
      "postgresql://postgres.jkcymhzpgcavyakojcvr:slamdunk@aws-0-us-west-1.pooler.supabase.com:6543/postgres";

    const testPrisma = new PrismaClient({
      datasources: {
        db: {
          url: pooledDbUrl,
        },
      },
    });

    // Simple query to test connection
    const result = await testPrisma.$queryRaw`SELECT 1 as test`;
    await testPrisma.$disconnect();

    return NextResponse.json({
      success: true,
      message: "Database connection successful",
      result,
    });
  } catch (error) {
    console.error("Database connection test failed:", error);

    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    );
  }
}
