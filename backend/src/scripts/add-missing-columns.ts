import { prisma } from "../lib/prisma";

async function addMissingColumns() {
  try {
    console.log("🔧 Agregando columnas faltantes a whatsapp_messages...");
    
    // Verificar columnas actuales
    const currentColumns = await prisma.$queryRaw`
      SELECT column_name
      FROM information_schema.columns 
      WHERE table_name = 'whatsapp_messages' 
      AND table_schema = 'public'
      ORDER BY column_name;
    `;
    
    console.log("📋 Columnas actuales:", currentColumns);
    
    // Agregar columnas faltantes una por una
    try {
      console.log(`➕ Agregando columna error_code...`);
      await prisma.$executeRaw`ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS error_code TEXT;`;
      console.log(`✅ Columna error_code agregada`);
    } catch (error) {
      console.log(`⚠️  Columna error_code ya existe o error:`, error instanceof Error ? error.message : error);
    }
    
    try {
      console.log(`➕ Agregando columna error_message...`);
      await prisma.$executeRaw`ALTER TABLE whatsapp_messages ADD COLUMN IF NOT EXISTS error_message TEXT;`;
      console.log(`✅ Columna error_message agregada`);
    } catch (error) {
      console.log(`⚠️  Columna error_message ya existe o error:`, error instanceof Error ? error.message : error);
    }
    
    // Verificar columnas finales
    const finalColumns = await prisma.$queryRaw`
      SELECT column_name, data_type
      FROM information_schema.columns 
      WHERE table_name = 'whatsapp_messages' 
      AND table_schema = 'public'
      ORDER BY column_name;
    `;
    
    console.log("📋 Columnas finales:", finalColumns);
    console.log("🎉 ¡Columnas agregadas exitosamente!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

addMissingColumns();
