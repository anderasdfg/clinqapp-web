import { prisma } from "../lib/prisma";

async function fixWhatsAppEnumsSafe() {
  try {
    console.log("🔧 Iniciando corrección SEGURA de tipos enum...");
    
    // Paso 1: Crear los tipos enum
    console.log("1️⃣ Creando tipos enum...");
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "MessageDirection" AS ENUM ('INCOMING', 'OUTGOING');
      EXCEPTION
        WHEN duplicate_object THEN 
          RAISE NOTICE 'MessageDirection ya existe';
      END $$;
    `;
    
    await prisma.$executeRaw`
      DO $$ BEGIN
        CREATE TYPE "MessageStatus" AS ENUM ('SENT', 'DELIVERED', 'READ', 'FAILED');
      EXCEPTION
        WHEN duplicate_object THEN 
          RAISE NOTICE 'MessageStatus ya existe';
      END $$;
    `;
    
    console.log("✅ Tipos enum creados");
    
    // Paso 2: Como la tabla está vacía, podemos recrear las columnas
    console.log("2️⃣ Recreando columnas con tipos correctos...");
    
    // Eliminar y recrear columna direction
    await prisma.$executeRaw`ALTER TABLE whatsapp_messages DROP COLUMN direction;`;
    await prisma.$executeRaw`ALTER TABLE whatsapp_messages ADD COLUMN direction "MessageDirection" NOT NULL DEFAULT 'INCOMING';`;
    
    // Eliminar y recrear columna status  
    await prisma.$executeRaw`ALTER TABLE whatsapp_messages DROP COLUMN status;`;
    await prisma.$executeRaw`ALTER TABLE whatsapp_messages ADD COLUMN status "MessageStatus" DEFAULT 'SENT';`;
    
    console.log("✅ Columnas recreadas con tipos enum");
    
    // Paso 3: Verificar
    const verification = await prisma.$queryRaw`
      SELECT column_name, data_type, udt_name
      FROM information_schema.columns 
      WHERE table_name = 'whatsapp_messages' 
      AND column_name IN ('direction', 'status');
    `;
    
    console.log("📋 Verificación final:", verification);
    console.log("🎉 ¡Corrección completada!");
    
  } catch (error) {
    console.error("❌ Error:", error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixWhatsAppEnumsSafe();
