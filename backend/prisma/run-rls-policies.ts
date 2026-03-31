// prisma/run-rls-policies.ts
// Runs the RLS policies migration for 20260325_rls_policies
// Usage: npx ts-node prisma/run-rls-policies.ts

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

function splitStatements(sql: string): string[] {
  const statements: string[] = [];
  let current = "";
  let inDollarBlock = false;

  const lines = sql.split("\n");
  for (const line of lines) {
    const trimmed = line.trim();
    const dollarCount = (line.match(/\$\$/g) || []).length;
    if (dollarCount % 2 !== 0) inDollarBlock = !inDollarBlock;
    current += line + "\n";
    if (!inDollarBlock && trimmed.endsWith(";")) {
      const stmt = current.trim().replace(/;$/, "");
      if (stmt.length > 0 && !stmt.startsWith("--")) statements.push(stmt);
      current = "";
    }
  }

  const leftover = current.trim();
  if (leftover.length > 0 && !leftover.startsWith("--"))
    statements.push(leftover);
  return statements;
}

async function main() {
  console.log("🚀 Running RLS policies migration...\n");
  console.log(`📄 File: ${MIGRATION_FILE}\n`);

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
      const msg: string = err.message || "";
      if (msg.includes("already exists")) {
        console.log(
          `⚠️  [${i + 1}/${statements.length}] Skipped (${msg.slice(0, 80)})`,
        );
        continue;
      }
      console.error(`\n❌ Failed on statement ${i + 1}:\n${stmt}\n`);
      throw err;
    }
  }

  console.log("\n✅ RLS policies applied successfully!");
  await prisma.$disconnect();
}

main().catch((e) => {
  console.error("\n❌ Migration failed:", e);
  process.exit(1);
});
