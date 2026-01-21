import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function setupDatabase() {
  console.log("🔧 Setting up database...");

  try {
    // Enable UUID extension
    await prisma.$executeRawUnsafe(
      `CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`,
    );
    console.log("✅ UUID extension enabled");

    // Tables with both id and updated_at
    const tablesWithUpdatedAt = [
      "organizations",
      "users",
      "patients",
      "appointments",
      "services",
      "schedules",
      "treatments",
      "coupons",
      "payments",
      "invitations",
    ];

    // Tables with only id (no updated_at)
    const tablesWithoutUpdatedAt = [
      "treatment_images",
      "payment_method_configs",
      "consultation_type_configs",
    ];

    // Set defaults for tables with updated_at
    for (const table of tablesWithUpdatedAt) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE ${table} ALTER COLUMN id SET DEFAULT uuid_generate_v4()`,
      );
      await prisma.$executeRawUnsafe(
        `ALTER TABLE ${table} ALTER COLUMN updated_at SET DEFAULT NOW()`,
      );
    }

    // Set defaults for tables without updated_at
    for (const table of tablesWithoutUpdatedAt) {
      await prisma.$executeRawUnsafe(
        `ALTER TABLE ${table} ALTER COLUMN id SET DEFAULT uuid_generate_v4()`,
      );
    }

    console.log("✅ UUID and timestamp defaults configured for all tables");

    // Grant schema usage
    await prisma.$executeRawUnsafe(
      `GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role`,
    );

    // Grant permissions on tables
    await prisma.$executeRawUnsafe(
      `GRANT ALL ON ALL TABLES IN SCHEMA public TO anon, authenticated, service_role`,
    );

    // Grant permissions on sequences
    await prisma.$executeRawUnsafe(
      `GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon, authenticated, service_role`,
    );

    // Grant permissions on functions
    await prisma.$executeRawUnsafe(
      `GRANT ALL ON ALL FUNCTIONS IN SCHEMA public TO anon, authenticated, service_role`,
    );

    console.log("✅ Permissions granted");

    // Set default privileges for tables
    await prisma.$executeRawUnsafe(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role`,
    );

    // Set default privileges for sequences
    await prisma.$executeRawUnsafe(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role`,
    );

    // Set default privileges for functions
    await prisma.$executeRawUnsafe(
      `ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role`,
    );

    console.log("✅ Default privileges configured");
    console.log("✅ Database setup completed successfully!");
  } catch (error) {
    console.error("❌ Error setting up database:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

setupDatabase()
  .then(() => {
    console.log("🎉 Database is ready!");
    process.exit(0);
  })
  .catch((error) => {
    console.error("💥 Setup failed:", error);
    process.exit(1);
  });
