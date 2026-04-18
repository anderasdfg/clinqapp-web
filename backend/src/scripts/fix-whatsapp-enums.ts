import { prisma } from "../lib/prisma";

async function fixWhatsAppEnums() {
  try {
    console.log("🔧 Iniciando corrección de tipos enum para WhatsApp...");
    
    // Paso 1: Crear los tipos enum si no existen
    console.log("1️⃣ Creando tipos enum...");
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "MessageDirection" AS ENUM ('INCOMING', 'OUTGOING');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log("✅ Tipo MessageDirection creado/verificado");
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `;
    console.log("✅ Tipo MessageStatus creado/verificado");
    
    // Paso 2: Actualizar las columnas para usar los tipos enum
    console.log("2️⃣ Actualizando columnas para usar tipos enum...");
    
    await prisma.$executeRaw`
      ALTER TABLE whatsapp_messages 
      ALTER COLUMN direction TYPE "MessageDirection" USING direction::"MessageDirection";
    `;
    console.log("✅ Columna direction actualizada");
    
    await prisma.$executeRaw`
      ALTER TABLE whatsapp_messages 
      ALTER COLUMN status TYPE "MessageStatus" USING status::"MessageStatus";
    `;
    console.log("✅ Columna status actualizada");
    
    // Paso 3: Verificar que todo esté correcto
    console.log("3️⃣ Verificando cambios...");
    
    const updatedStructure = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'whatsapp_messages' 
      AND column_name IN ('direction', 'status')
      ORDER BY column_name;
    `;
    
    console.log("📋 Estructura actualizada:", updatedStructure);
    console.log("🎉 ¡Corrección completada exitosamente!");
    
  } catch (error) {
    console.error("❌ Error durante la corrección:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixWhatsAppEnums();
