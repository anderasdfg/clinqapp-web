import { prisma } from "../lib/prisma";

async function checkDatabaseStatus() {
  try {
    console.log("🔍 Verificando estado de la base de datos...");
    
    // Verificar si la tabla whatsapp_messages existe
    const tableExists = await prisma.$queryRaw`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'whatsapp_messages'
      );
    `;
    console.log("📋 Tabla whatsapp_messages existe:", tableExists);
    
    // Verificar si los tipos enum existen
    const enumsExist = await prisma.$queryRaw`
      SELECT typname 
      FROM pg_type 
      WHERE typname IN ('MessageDirection', 'MessageStatus');
    `;
    console.log("🏷️  Tipos enum existentes:", enumsExist);
    
    // Verificar estructura de la tabla (solo si existe)
    try {
      const tableStructure = await prisma.$queryRaw`
        SELECT column_name, data_type, is_nullable
        FROM information_schema.columns 
        WHERE table_name = 'whatsapp_messages' 
        AND table_schema = 'public'
        ORDER BY ordinal_position;
      `;
      console.log("🏗️  Estructura de la tabla:", tableStructure);
    } catch (error) {
      console.log("⚠️  No se pudo obtener la estructura de la tabla");
    }
    
    // Contar registros existentes (solo si la tabla existe)
    try {
      const count = await prisma.$queryRaw`SELECT COUNT(*) FROM whatsapp_messages;`;
      console.log("📊 Registros existentes:", count);
    } catch (error) {
      console.log("⚠️  No se pudieron contar los registros");
    }
    
  } catch (error) {
    console.error("❌ Error verificando base de datos:", error);
  } finally {
    await prisma.$disconnect();
  }
}

checkDatabaseStatus();
