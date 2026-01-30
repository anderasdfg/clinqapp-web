import { Client } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function testUuid() {
  await client.connect();

  try {
    const res = await client.query("SELECT gen_random_uuid() as id");
    console.log("gen_random_uuid success:", res.rows[0]);
  } catch (e: any) {
    console.error("gen_random_uuid failed:", e?.message || e);
    try {
      const res2 = await client.query("SELECT uuid_generate_v4() as id");
      console.log("uuid_generate_v4 success:", res2.rows[0]);
    } catch (e2: any) {
      console.error("uuid_generate_v4 failed:", e2?.message || e2);
    }
  }

  await client.end();
}

testUuid().catch(console.error);
