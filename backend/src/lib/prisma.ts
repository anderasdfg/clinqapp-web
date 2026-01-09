import { PrismaClient } from "@prisma/client";

// Initialize Prisma with error handling
let prisma: PrismaClient;

try {
  console.log("🔄 Initializing Prisma Client...");
  prisma = new PrismaClient({
    log:
      process.env.NODE_ENV === "production"
        ? ["error"]
        : ["query", "error", "warn"],
  });
  console.log("✅ Prisma Client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Prisma Client:", error);
  throw error;
}

export { prisma };
