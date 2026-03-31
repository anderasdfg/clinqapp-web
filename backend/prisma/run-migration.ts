// prisma/run-migration.ts
/**
 * Migration Runner
 * Applies a specific migration using Prisma's $executeRawUnsafe.
 * Compatible with Supabase pooler (port 6543).
 * Handles PL/pgSQL blocks delimited by $$ ... $$
 *
 * Usage: npx ts-node prisma/run-migration.ts
 */

import { PrismaClient } from "@prisma/client";
import * as fs from "fs";
import * as path from "path";

const prisma = new PrismaClient();

const MIGRATION_FILE = path.join(
  __dirname,
  "migrations",
  "20260325_rls_policies",
  "migration.sql",
);

/**
 * Splits SQL respecting $$ ... $$ blocks (PL/pgSQL functions/triggers).
 * Simple `;` splitting would break multi-statement function bodies.
 */
function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollarBlock = false;

  const lines = sql.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();

    // Toggle dollar-quote block on $$ markers
    const dollarCount = (line.match(/\$\$/g) || []).length;
    if (dollarCount % 2 !== 0) {
      inDollarBlock = !inDollarBlock;
    }

    current += line + "\n";

    // Only split on ; when NOT inside a dollar-quote block
    if (!inDollarBlock && trimmed.endsWith(";")) {
      const stmt = current.trim().replace(/;$/, "");
      if (stmt.length > 0 && !stmt.startsWith("--")) {
        statements.push(stmt);
      }
      current = "";
    }
  }

  // Capture any remaining content
  const leftover = current.trim();
  if (leftover.length > 0 && !leftover.startsWith("--")) {
    statements.push(leftover);
  }

  return statements;
}

async function main() {
  console.log("🚀 Running migration...\n");
  console.log(`📄 File: ${MIGRATION_FILE}\n`);

  try {
    const sql = fs.readFileSync(MIGRATION_FILE, "utf-8");
    const statements = splitStatements(sql).filter(
      (s) => s.length > 0 && !s.startsWith("--"),
    );

    console.log(`📝 Executing ${statements.length} statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const stmt = statements[i];
      try {
        await prisma.$executeRawUnsafe(stmt);
        console.log(`✅ [${i + 1}/${statements.length}] OK`);
      } catch (err: any) {
        // Tolerate idempotent errors
        const msg: string = err.message || "";
        if (
          msg.includes("already exists") ||
          msg.includes("does not exist") ||
          (msg.includes("column") && msg.includes("does not exist"))
        ) {
          console.log(
            `⚠️  [${i + 1}/${statements.length}] Skipped (${msg.slice(0, 80)})`,
          );
          continue;
        }
        console.error(`\n❌ Failed on statement ${i + 1}:\n${stmt}\n`);
        throw err;
      }
    }

    console.log("\n✅ Migration completed successfully!");
  } catch (error) {
    console.error("\n❌ Migration failed:", error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
