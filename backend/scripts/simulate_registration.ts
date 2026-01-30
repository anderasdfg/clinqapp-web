import { Client } from "pg";
import * as dotenv from "dotenv";
// Removed uuid dependency

dotenv.config();

const client = new Client({
  connectionString: process.env.DATABASE_URL,
});

async function simulate() {
  await client.connect();

  try {
    await client.query("BEGIN");

    const email = "jos.caldas.27@gmail.com";
    const auth_id = "00000000-0000-0000-0000-000000000000"; // Mock auth ID
    const meta_full_name = "Jose Caldas";

    console.log("--- Simulating Trigger Logic ---");

    // 1. Generate IDs
    const org_id_res = await client.query("SELECT gen_random_uuid() as id");
    const org_id = org_id_res.rows[0].id; // Mock gen_random_uuid() inside trigger
    const user_uuid_res = await client.query("SELECT gen_random_uuid() as id");
    const user_id = user_uuid_res.rows[0].id;

    // Logic from trigger
    let user_full_name = meta_full_name;
    if (!user_full_name) user_full_name = email.split("@")[0];

    const user_first_name = user_full_name.split(" ")[0]; // Approx
    const user_last_name =
      user_full_name.substring(user_first_name.length + 1) || "User";

    const org_name = `${user_full_name}'s Consultorio`;

    const safe_first_name = user_first_name
      .replace(/[^a-zA-Z0-9]/g, "")
      .toLowerCase();
    const org_slug = `${safe_first_name}-${org_id.substring(0, 8)}`;

    console.log("Data prepared:", {
      org_id,
      user_id,
      org_name,
      org_slug,
      email,
      auth_id,
      user_first_name,
      user_last_name,
    });

    // 1. INSERT ORGANIZATION
    console.log("Inserting Organization...");
    await client.query(
      `
      INSERT INTO public.organizations (
        id,
        name,
        slug,
        email,
        is_temporary,
        onboarding_completed,
        notification_email,
        notification_whatsapp,
        send_reminders,
        reminder_hours_before,
        default_appointment_duration,
        appointment_interval,
        allow_online_booking,
        specialty,
        subscription_plan,
        subscription_status,
        updated_at
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        true,
        false,
        true,
        false,
        true,
        24,
        30,
        0,
        false,
        'PODIATRY',
        'FREE_TRIAL',
        'TRIALING',
        NOW()
      )
      `,
      [org_id, org_name, org_slug, email],
    );
    console.log("✅ Organization Inserted");

    // 2. INSERT USER
    console.log("Inserting User...");
    await client.query(
      `
      INSERT INTO public.users (
        id,
        auth_id,
        email,
        first_name,
        last_name,
        organization_id,
        role,
        email_verified,
        updated_at
      ) VALUES (
        $1,
        $2,
        $3,
        $4,
        $5,
        $6,
        'OWNER',
        false,
        NOW()
      )
      `,
      [user_id, auth_id, email, user_first_name, user_last_name, org_id],
    );
    console.log("✅ User Inserted");

    await client.query("ROLLBACK"); // Always rollback simulation
    console.log("✅ Transaction Rolled Back (Success)");
  } catch (e: any) {
    console.error("❌ SIMULATION FAILED:", e.message);
    if (e.detail) console.error("Detail:", e.detail);
    if (e.table) console.error("Table:", e.table);
    await client.query("ROLLBACK");
  } finally {
    await client.end();
  }
}

simulate().catch(console.error);
