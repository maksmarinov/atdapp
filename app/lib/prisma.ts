import { PrismaClient } from "@prisma/client";
import { withAccelerate } from "@prisma/extension-accelerate";

// Create a new PrismaClient instance
const prismaClientSingleton = () => {
  return new PrismaClient().$extends(withAccelerate());
};

// Define a type for the extended client
type PrismaClientSingleton = ReturnType<typeof prismaClientSingleton>;

// Create global variable for prisma in development to prevent multiple instances
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClientSingleton | undefined;
};

// Export singleton pattern - reuse existing client or create new one
const prisma = globalForPrisma.prisma ?? prismaClientSingleton();

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export default prisma;
