import { Router, Request, Response } from 'express';
import { prisma } from '../lib/prisma';

const router = Router();

router.post('/add-enabled-modules', async (req: Request, res: Response) => {
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
    
    res.json({
      success: true,
      message: 'Columna enabled_modules agregada exitosamente',
      verification: result
    });
    
  } catch (error: any) {
    console.error('❌ Error:', error);
    res.status(500).json({
      success: false,
      error: error.message
    });
  }
});

export default router;
