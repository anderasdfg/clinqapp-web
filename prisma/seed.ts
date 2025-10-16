import { PrismaClient } from '@prisma/client';
import { createClient } from '@supabase/supabase-js';

const prisma = new PrismaClient();

// Supabase Admin Client
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
);

async function main() {
  console.log('🌱 Iniciando seed...');

  // ============================================
  // 1. CREAR ORGANIZACIÓN DE PRUEBA
  // ============================================
  console.log('📦 Creando organización...');

  const organization = await prisma.organization.create({
    data: {
      name: 'Consultorio Podológico Demo',
      slug: 'consultorio-demo',
      email: 'demo@clinqapp.com',
      phone: '+51 999 888 777',
      address: 'Av. Javier Prado 123, San Isidro, Lima',
      website: 'https://demo.clinqapp.com',
      instagramUrl: 'https://instagram.com/consultoriodemo',
      logoUrl: null,
      primaryColor: '#2563eb',
      secondaryColor: '#7c3aed',
      specialty: 'PODIATRY',
      subscriptionPlan: 'FREE_TRIAL',
      subscriptionStatus: 'TRIALING',
      trialEndsAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    },
  });

  console.log(`✅ Organización creada: ${organization.name}`);

  // ============================================
  // 2. CREAR USUARIOS EN SUPABASE AUTH
  // ============================================
  console.log('👤 Creando usuarios en Supabase Auth...');

  // Usuario OWNER
  const { data: ownerAuth, error: ownerError } =
    await supabaseAdmin.auth.admin.createUser({
      email: 'owner@demo.com',
      password: 'Demo123456!',
      email_confirm: true,
      user_metadata: {
        first_name: 'María',
        last_name: 'García',
        dni: '70477729',
      },
    });

  if (ownerError) throw ownerError;
  console.log('✅ Owner creado en Supabase');

  // Usuario PROFESSIONAL
  const { data: professionalAuth, error: professionalError } =
    await supabaseAdmin.auth.admin.createUser({
      email: 'professional@demo.com',
      password: 'Demo123456!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Carlos',
        last_name: 'Rodríguez',
        dni: '75858003',
      },
    });

  if (professionalError) throw professionalError;
  console.log('✅ Professional creado en Supabase');

  // Usuario RECEPTIONIST
  const { data: receptionistAuth, error: receptionistError } =
    await supabaseAdmin.auth.admin.createUser({
      email: 'receptionist@demo.com',
      password: 'Demo123456!',
      email_confirm: true,
      user_metadata: {
        first_name: 'Ana',
        last_name: 'López',
        dni: '88776655',
      },
    });

  if (receptionistError) throw receptionistError;
  console.log('✅ Receptionist creado en Supabase');

  // ============================================
  // 3. CREAR USUARIOS EN PRISMA
  // ============================================
  console.log('💾 Creando usuarios en base de datos...');

  const owner = await prisma.user.create({
    data: {
      id: ownerAuth.user.id,
      authId: ownerAuth.user.id,
      email: 'owner@demo.com',
      firstName: 'María',
      lastName: 'García',
      dni: '70477729',
      phone: '+51 999 111 111',
      organizationId: organization.id,
      role: 'OWNER',
      emailVerified: true,
      licenseNumber: 'POD-12345',
      specialty: 'Podología General',
    },
  });

  const professional = await prisma.user.create({
    data: {
      id: professionalAuth.user.id,
      authId: professionalAuth.user.id,
      email: 'professional@demo.com',
      firstName: 'Carlos',
      lastName: 'Rodríguez',
      dni: '75858003',
      phone: '+51 999 222 222',
      organizationId: organization.id,
      role: 'PROFESSIONAL',
      emailVerified: true,
      licenseNumber: 'POD-67890',
      specialty: 'Podología Deportiva',
    },
  });

  const receptionist = await prisma.user.create({
    data: {
      id: receptionistAuth.user.id,
      authId: receptionistAuth.user.id,
      email: 'receptionist@demo.com',
      firstName: 'Ana',
      lastName: 'López',
      dni: '88776655',
      phone: '+51 999 333 333',
      organizationId: organization.id,
      role: 'RECEPTIONIST',
      emailVerified: true,
    },
  });

  console.log('✅ 3 usuarios creados en BD');

  // ============================================
  // 4. CREAR HORARIOS
  // ============================================
  console.log('📅 Creando horarios de atención...');

  await prisma.schedule.createMany({
    data: [
      {
        organizationId: organization.id,
        dayOfWeek: 'MONDAY',
        startTime: '09:00',
        endTime: '18:00',
        enabled: true,
      },
      {
        organizationId: organization.id,
        dayOfWeek: 'TUESDAY',
        startTime: '09:00',
        endTime: '18:00',
        enabled: true,
      },
      {
        organizationId: organization.id,
        dayOfWeek: 'WEDNESDAY',
        startTime: '09:00',
        endTime: '18:00',
        enabled: true,
      },
      {
        organizationId: organization.id,
        dayOfWeek: 'THURSDAY',
        startTime: '09:00',
        endTime: '18:00',
        enabled: true,
      },
      {
        organizationId: organization.id,
        dayOfWeek: 'FRIDAY',
        startTime: '09:00',
        endTime: '18:00',
        enabled: true,
      },
      {
        organizationId: organization.id,
        dayOfWeek: 'SATURDAY',
        startTime: '09:00',
        endTime: '14:00',
        enabled: true,
      },
      {
        organizationId: organization.id,
        dayOfWeek: 'SUNDAY',
        startTime: '09:00',
        endTime: '14:00',
        enabled: false,
      },
    ],
  });

  console.log('✅ Horarios creados');

  // ============================================
  // 5. CREAR SERVICIOS
  // ============================================
  console.log('💼 Creando servicios...');

  const consultaInicial = await prisma.service.create({
    data: {
      organizationId: organization.id,
      name: 'Consulta Inicial',
      description: 'Primera evaluación podológica completa',
      basePrice: 80.0,
      duration: 60,
      requiresSessions: false,
      defaultSessions: 1,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      organizationId: organization.id,
      name: 'Tratamiento de Uñas Encarnadas',
      description: 'Tratamiento completo para uñas encarnadas con seguimiento',
      basePrice: 120.0,
      duration: 45,
      requiresSessions: true,
      defaultSessions: 4,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      organizationId: organization.id,
      name: 'Eliminación de Callos y Durezas',
      description: 'Tratamiento para remover callos y durezas',
      basePrice: 60.0,
      duration: 30,
      requiresSessions: false,
      defaultSessions: 1,
      isActive: true,
    },
  });

  await prisma.service.create({
    data: {
      organizationId: organization.id,
      name: 'Plantillas Ortopédicas Personalizadas',
      description: 'Evaluación y fabricación de plantillas a medida',
      basePrice: 250.0,
      duration: 90,
      requiresSessions: false,
      defaultSessions: 1,
      isActive: true,
    },
  });

  console.log('✅ 4 servicios creados');

  // ============================================
  // 6. CREAR PACIENTES
  // ============================================
  console.log('🏥 Creando pacientes...');

  const patient1 = await prisma.patient.create({
    data: {
      organizationId: organization.id,
      assignedProfessionalId: professional.id,
      firstName: 'Juan',
      lastName: 'Pérez',
      dni: '12345678',
      phone: '+51 987 654 321',
      email: 'juan.perez@example.com',
      dateOfBirth: new Date('1985-05-15'),
      gender: 'Masculino',
      address: 'Av. La Marina 456, San Miguel, Lima',
      occupation: 'Ingeniero',
      emergencyContact: 'María Pérez',
      emergencyPhone: '+51 987 111 222',
      referralSource: 'INSTAGRAM',
      medicalHistory: {
        allergies: [],
        medications: [],
        chronic_conditions: ['Diabetes tipo 2'],
        previous_surgeries: [],
        specialty_notes: {
          foot_type: 'Pie plano',
          shoe_size: '42',
        },
      },
    },
  });

  await prisma.patient.create({
    data: {
      organizationId: organization.id,
      assignedProfessionalId: professional.id,
      firstName: 'Lucía',
      lastName: 'Torres',
      dni: '87654321',
      phone: '+51 987 555 444',
      email: 'lucia.torres@example.com',
      dateOfBirth: new Date('1992-08-22'),
      gender: 'Femenino',
      referralSource: 'WORD_OF_MOUTH',
    },
  });

  await prisma.patient.create({
    data: {
      organizationId: organization.id,
      assignedProfessionalId: professional.id,
      firstName: 'Roberto',
      lastName: 'Sánchez',
      dni: '11223344',
      phone: '+51 987 777 888',
      referralSource: 'GOOGLE',
    },
  });

  console.log('✅ 3 pacientes creados');

  // ============================================
  // 7. CREAR CITAS
  // ============================================
  console.log('📆 Creando citas...');

  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);
  tomorrow.setHours(10, 0, 0, 0);

  await prisma.appointment.create({
    data: {
      organizationId: organization.id,
      patientId: patient1.id,
      professionalId: professional.id,
      serviceId: consultaInicial.id,
      startTime: tomorrow,
      endTime: new Date(tomorrow.getTime() + 60 * 60 * 1000),
      status: 'CONFIRMED',
      notes: 'Primera consulta',
    },
  });

  console.log('✅ 1 cita creada');

  // ============================================
  // 8. CREAR CUPÓN
  // ============================================
  console.log('🎟️  Creando cupón...');

  await prisma.coupon.create({
    data: {
      organizationId: organization.id,
      code: 'PRIMERAVEZ20',
      type: 'PERCENTAGE',
      value: 20,
      validFrom: new Date(),
      validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      maxUses: 50,
      currentUses: 0,
      isActive: true,
      applicableServiceIds: [],
    },
  });

  console.log('✅ Cupón creado: PRIMERAVEZ20');

  // ============================================
  // RESUMEN
  // ============================================
  console.log('\n🎉 ¡Seed completado exitosamente!');
  console.log('\n📊 Resumen:');
  console.log(`  - 1 Organización: ${organization.name}`);
  console.log(`  - 3 Usuarios:`);
  console.log(`    • Owner: owner@demo.com (María García)`);
  console.log(`    • Professional: professional@demo.com (Carlos Rodríguez)`);
  console.log(`    • Receptionist: receptionist@demo.com (Ana López)`);
  console.log(`  - Contraseña para todos: Demo123456!`);
  console.log(`  - 7 Horarios de atención`);
  console.log(`  - 4 Servicios`);
  console.log(`  - 3 Pacientes`);
  console.log(`  - 1 Cita`);
  console.log(`  - 1 Cupón: PRIMERAVEZ20 (20% desc.)`);
  console.log('\n🔐 Credenciales de prueba:');
  console.log('  Email: owner@demo.com');
  console.log('  Password: Demo123456!');
}

main()
  .catch((e) => {
    console.error('❌ Error en seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
