import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function checkDuplicates() {
  await client.connect();
  const email = "jos.caldas.27@gmail.com";
  // Check based on slug pattern logic
  // Slug logic: first name + part of UUID.
  // If first name is "Jose", slug starts with "jose-".
  // But UUID part is random. So slug colision is unlikely unless UUID generator is broken.

  console.log(`Checking for organizations with email: ${email}`);
  const resOrg = await client.query(
    "SELECT * FROM public.organizations WHERE email = $1",
    [email],
  );

  if (resOrg.rows.length > 0) {
    console.log("FOUND ORG by EMAIL:", resOrg.rows.length, "records");
    console.log(resOrg.rows);
    // Delete them all?
    // await client.query('DELETE FROM public.organizations WHERE email = $1', [email]);
    // console.log('Deleted organizations with that email');
  } else {
    console.log("No orgs found with that email");
  }

  // Check unique constraints
  // Organization: slug, ruc
  // User: email, dni, auth_id

  await client.end();
}

checkDuplicates().catch(console.error);
