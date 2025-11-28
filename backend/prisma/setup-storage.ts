// prisma/setup-storage.ts
import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

dotenv.config();

const supabaseUrl = process.env.SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error(
    'Missing Supabase credentials. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set.'
  );
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function setupStorage() {
  console.log('🗄️  Setting up Supabase Storage buckets...\n');

  try {
    // Create organizations bucket for logos and other org files
    const { data: orgBucket, error: orgError } = await supabase.storage.createBucket(
      'organizations',
      {
        public: true,
        fileSizeLimit: 5242880, // 5MB
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/svg+xml',
          'image/webp',
        ],
      }
    );

    if (orgError && !orgError.message.includes('already exists')) {
      throw orgError;
    }

    if (orgBucket) {
      console.log('✅ Created bucket: organizations');
    } else {
      console.log('ℹ️  Bucket already exists: organizations');
    }

    // Create patients bucket for treatment images
    const { data: patientsBucket, error: patientsError } =
      await supabase.storage.createBucket('patients', {
        public: false, // Private bucket
        fileSizeLimit: 10485760, // 10MB
        allowedMimeTypes: [
          'image/png',
          'image/jpeg',
          'image/jpg',
          'image/webp',
        ],
      });

    if (patientsError && !patientsError.message.includes('already exists')) {
      throw patientsError;
    }

    if (patientsBucket) {
      console.log('✅ Created bucket: patients');
    } else {
      console.log('ℹ️  Bucket already exists: patients');
    }

    console.log('\n✨ Storage setup completed successfully!\n');
    console.log('Buckets created:');
    console.log('  - organizations (public) - For logos and organization files');
    console.log('  - patients (private) - For patient treatment images');
  } catch (error) {
    console.error('❌ Error setting up storage:', error);
    process.exit(1);
  }
}

setupStorage();
