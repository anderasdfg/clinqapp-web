// prisma/setup-storage-policies.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase credentials. Make sure NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStoragePolicies() {
  console.log('🔐 Setting up Storage policies...\n');

  try {
    // Note: Supabase Storage policies are managed through the dashboard or SQL
    // We'll execute SQL to create the policies

    const policies = `
      -- Organizations bucket policies

      -- Allow authenticated users to upload to organizations bucket
      CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload organization files"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'organizations');

      -- Allow public read access to organizations bucket
      CREATE POLICY IF NOT EXISTS "Allow public read access to organization files"
      ON storage.objects FOR SELECT TO public
      USING (bucket_id = 'organizations');

      -- Allow authenticated users to update their organization files
      CREATE POLICY IF NOT EXISTS "Allow authenticated users to update organization files"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'organizations');

      -- Allow authenticated users to delete their organization files
      CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete organization files"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'organizations');

      -- Patients bucket policies (more restrictive)

      -- Allow authenticated users to upload to patients bucket
      CREATE POLICY IF NOT EXISTS "Allow authenticated users to upload patient files"
      ON storage.objects FOR INSERT TO authenticated
      WITH CHECK (bucket_id = 'patients');

      -- Allow authenticated users to read patient files
      CREATE POLICY IF NOT EXISTS "Allow authenticated users to read patient files"
      ON storage.objects FOR SELECT TO authenticated
      USING (bucket_id = 'patients');

      -- Allow authenticated users to update patient files
      CREATE POLICY IF NOT EXISTS "Allow authenticated users to update patient files"
      ON storage.objects FOR UPDATE TO authenticated
      USING (bucket_id = 'patients');

      -- Allow authenticated users to delete patient files
      CREATE POLICY IF NOT EXISTS "Allow authenticated users to delete patient files"
      ON storage.objects FOR DELETE TO authenticated
      USING (bucket_id = 'patients');
    `;

    // Execute policies via Supabase SQL
    const { error } = await supabase.rpc('exec_sql', { sql: policies });

    if (error) {
      console.log('⚠️  Note: Some policies might already exist or need to be created manually.');
      console.log('   You can create them in Supabase Dashboard → Storage → Policies\n');
      console.log('Policies needed:');
      console.log('  1. Organizations bucket: Allow INSERT, SELECT (public), UPDATE, DELETE for authenticated users');
      console.log('  2. Patients bucket: Allow INSERT, SELECT, UPDATE, DELETE for authenticated users only\n');
    } else {
      console.log('✅ Storage policies created successfully!\n');
    }

    console.log('✨ Setup completed!\n');
    console.log('To verify, go to Supabase Dashboard → Storage → organizations → Policies');
  } catch (error) {
    console.log('ℹ️  Creating policies via dashboard...\n');
    console.log('Please create the following policies manually in Supabase Dashboard:\n');
    console.log('Organizations bucket (public):');
    console.log('  - Policy 1: Allow authenticated users to INSERT');
    console.log('  - Policy 2: Allow public SELECT (read)');
    console.log('  - Policy 3: Allow authenticated users to UPDATE');
    console.log('  - Policy 4: Allow authenticated users to DELETE\n');
    console.log('Patients bucket (private):');
    console.log('  - Policy 1: Allow authenticated users to INSERT');
    console.log('  - Policy 2: Allow authenticated users to SELECT');
    console.log('  - Policy 3: Allow authenticated users to UPDATE');
    console.log('  - Policy 4: Allow authenticated users to DELETE\n');
    console.log('Go to: https://supabase.com/dashboard/project/[your-project]/storage/buckets\n');
  }
}

setupStoragePolicies();
