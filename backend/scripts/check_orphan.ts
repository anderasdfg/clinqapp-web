import { Client } from "pg";
import * as dotenv from "dotenv";
import { prisma } from "../src/lib/prisma"; // Attempt to use prisma if possible, or just raw pg

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkUser() {
  await client.connect();
  const email = "jos.caldas.27@gmail.com";

  console.log(`Checking for user: ${email}`);
  const res = await client.query(
    "SELECT * FROM public.users WHERE email = $1",
    [email],
  );

  if (res.rows.length > 0) {
    console.log("FOUND ORPHANED USER:", res.rows[0]);
    console.log("Deleting orphaned user and organization...");

    const userId = res.rows[0].id;
    const orgId = res.rows[0].organization_id;

    await client.query("DELETE FROM public.users WHERE id = $1", [userId]);
    await client.query("DELETE FROM public.organizations WHERE id = $1", [
      orgId,
    ]);

    console.log("✅ Deleted successfully");
  } else {
    console.log("❌ No existing user found with that email.");
  }

  // Also check organizations by email
  const resOrg = await client.query(
    "SELECT * FROM public.organizations WHERE email = $1",
    [email],
  );
  if (resOrg.rows.length > 0) {
    console.log("FOUND ORPHANED ORG by EMAIL:", resOrg.rows[0]);
    await client.query("DELETE FROM public.organizations WHERE id = $1", [
      resOrg.rows[0].id,
    ]);
    console.log("✅ Deleted Org successfully");
  }

  await client.end();
}

checkUser().catch(console.error);
