import { PrismaClient } from "@prisma/client";

// Initialize Prisma with error handling
let prisma: PrismaClient;

try {
  console.log("🔄 Initializing Prisma Client...");
  prisma = new PrismaClient({
    log: [
      { level: "query", emit: "event" },
      { level: "error", emit: "stdout" },
      { level: "warn", emit: "stdout" },
    ],
  });

  // Log queries with timing if in dev
  if (process.env.NODE_ENV !== "production") {
    (prisma as any).$on("query", (e: any) => {
      if (e.duration > 100) {
        console.warn(`🕒 Slow Query: ${e.query} - ${e.duration}ms`);
      }
    });
  }

  console.log("✅ Prisma Client initialized successfully");
} catch (error) {
  console.error("❌ Failed to initialize Prisma Client:", error);
  throw error;
}

export { prisma };
