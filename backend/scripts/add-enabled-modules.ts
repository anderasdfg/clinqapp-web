import { prisma } from '../src/lib/prisma';

async function addEnabledModulesColumn() {
  try {
    console.log('🔄 Agregando columna enabled_modules...');
    
    await prisma.$executeRawUnsafe(`
      ALTER TABLE organizations 
      ADD COLUMN IF NOT EXISTS enabled_modules JSONB;
    `);
    
    console.log('✅ Columna enabled_modules agregada exitosamente!');
    
    // Verificar que se agregó
    const result = await prisma.$queryRawUnsafe(`
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = 'organizations' 
      AND column_name = 'enabled_modules';
    `);
    
    console.log('📊 Verificación:', result);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

addEnabledModulesColumn();
