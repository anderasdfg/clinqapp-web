import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function inspect() {
  await client.connect();

  console.log("--- EXTENSIONS ---");
  const resExt = await client.query(
    "SELECT * FROM pg_extension WHERE extname = 'uuid-ossp'",
  );
  console.log(resExt.rows);

  console.log("\n--- FUNCTIONS ---");
  const resFunc = await client.query(`
    SELECT prosrc 
    FROM pg_proc 
    WHERE proname = 'handle_new_user'
  `);
  if (resFunc.rows.length > 0) {
    console.log(resFunc.rows[0].prosrc);
  } else {
    console.log("Function handle_new_user NOT FOUND");
  }

  console.log("\n--- TRIGGERS ---");
  const resTrig = await client.query(`
    SELECT tgname, tgtype 
    FROM pg_trigger 
    WHERE tgname = 'on_auth_user_created'
  `);
  console.log(resTrig.rows);

  await client.end();
}

inspect().catch(console.error);
