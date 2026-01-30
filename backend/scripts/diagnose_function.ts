import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function diagnose() {
  await client.connect();

  console.log("--- Checking Active Function Definition ---");
  const res = await client.query(`
    SELECT prosrc 
    FROM pg_proc 
    WHERE proname = 'handle_new_user'
  `);

  if (res.rows.length > 0) {
    console.log("Function Source:");
    console.log("---------------------------------------------------");
    console.log(res.rows[0].prosrc);
    console.log("---------------------------------------------------");

    const source = res.rows[0].prosrc;
    if (source.includes("gen_random_uuid()")) {
      console.log("✅ Matches expectations (contains gen_random_uuid)");
    } else {
      console.warn("❌ OLD VERSION DETECTED (missing gen_random_uuid)");
    }

    if (source.includes("updated_at")) {
      console.log("✅ Matches expectations (contains updated_at)");
    } else {
      console.warn("❌ OLD VERSION DETECTED (missing updated_at)");
    }
  } else {
    console.error("❌ Function handle_new_user NOT FOUND in pg_proc");
  }

  // Also check trigger existence on auth.users
  console.log("\n--- Checking Triggers on auth.users ---");
  // Need to join specific relation because name is not unique globally
  const trigRes = await client.query(`
    SELECT t.tgname, c.relname as table_name, n.nspname as schema_name
    FROM pg_trigger t
    JOIN pg_class c ON t.tgrelid = c.oid
    JOIN pg_namespace n ON c.relnamespace = n.oid
    WHERE n.nspname = 'auth' AND c.relname = 'users'
  `);
  console.log("Triggers found:", trigRes.rows);

  await client.end();
}

diagnose().catch(console.error);
