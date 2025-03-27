import { NextResponse } from "next/server";

export async function GET() {
  return NextResponse.json({
    databaseUrl:
      process.env.DATABASE_URL?.substring(0, 20) + "..." || "not set",
    hasDbUrl: !!process.env.DATABASE_URL,
    startsWithPostgres:
      process.env.DATABASE_URL?.startsWith("postgresql://") || false,
  });
}
