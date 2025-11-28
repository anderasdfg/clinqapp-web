// prisma/setup-auth.ts
/**
 * Auth Setup Script
 * Runs the necessary SQL to configure authentication
 * Run this after `prisma db push` or when resetting the database
 */

import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function main() {
  console.log('🔧 Setting up authentication...\n');

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'migrations', '00_auth_setup.sql');
    const sql = fs.readFileSync(sqlPath, 'utf-8');

    // Split by statements and execute
    const statements = sql
      .split(';')
      .map((s) => s.trim())
      .filter((s) => s.length > 0 && !s.startsWith('--'));

    console.log(`📝 Executing ${statements.length} SQL statements...\n`);

    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i];

      // Skip comments
      if (statement.startsWith('--') || statement.startsWith('/*')) {
        continue;
      }

      try {
        await prisma.$executeRawUnsafe(statement + ';');
        process.stdout.write(`✓ Statement ${i + 1}/${statements.length}\r`);
      } catch (error: any) {
        // Ignore some common errors that are okay
        if (
          error.message.includes('already exists') ||
          error.message.includes('does not exist')
        ) {
          process.stdout.write(`⚠ Statement ${i + 1}/${statements.length} (skipped)\r`);
          continue;
        }
        throw error;
      }
    }

    console.log('\n');
    console.log('✅ Auth setup completed successfully!\n');
    console.log('Next steps:');
    console.log('1. Start your dev server: npm run dev');
    console.log('2. Go to http://localhost:3000/register');
    console.log('3. Test the registration flow\n');

  } catch (error) {
    console.error('❌ Error setting up auth:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
