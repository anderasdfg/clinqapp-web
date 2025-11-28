import { createClient } from '@supabase/supabase-js';
import * as dotenv from 'dotenv';

// Load environment variables from .env file
dotenv.config({ path: '.env' });

const supabaseUrl = process.env.SUPABASE_URL;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !serviceRoleKey) {
  throw new Error(
    'Missing required environment variables. Make sure SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are set in your .env.local file.'
  );
}

const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

async function cleanSupabase() {
  console.log('🧹 Limpiando usuarios de Supabase Auth...');

  // Obtener todos los usuarios
  const {
    data: { users },
    error,
  } = await supabaseAdmin.auth.admin.listUsers();

  if (error) {
    console.error('❌ Error al listar usuarios:', error);
    return;
  }

  console.log(`📊 Encontrados ${users.length} usuarios`);

  // Eliminar cada usuario
  for (const user of users) {
    const { error: deleteError } = await supabaseAdmin.auth.admin.deleteUser(
      user.id
    );

    if (deleteError) {
      console.error(`❌ Error al eliminar usuario ${user.email}:`, deleteError);
    } else {
      console.log(`✅ Usuario eliminado: ${user.email}`);
    }
  }

  console.log('✅ Limpieza de Supabase Auth completada');
}

cleanSupabase().catch((e) => {
  console.error('❌ Error:', e);
  process.exit(1);
});
