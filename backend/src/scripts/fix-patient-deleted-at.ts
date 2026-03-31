import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixPatientDeletedAt() {
  console.log('🔧 Starting patient deletedAt fix...');
  
  try {
    // Update all patients that don't have deletedAt explicitly set to null
    const result = await prisma.$executeRaw`
      UPDATE patients 
      SET deleted_at = NULL 
      WHERE deleted_at IS NULL
    `;
    
    console.log(`✅ Updated ${result} patient records`);
    
    // Verify the fix
    const patientsCount = await prisma.patient.count({
      where: {
        deletedAt: null
      }
    });
    
    console.log(`📊 Total active patients: ${patientsCount}`);
    
  } catch (error) {
    console.error('❌ Error fixing patient deletedAt:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixPatientDeletedAt()
  .then(() => {
    console.log('✅ Script completed successfully');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Script failed:', error);
    process.exit(1);
  });
