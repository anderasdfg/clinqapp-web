// src/lib/actions/patients.ts
'use server'

import { revalidatePath } from 'next/cache'
import prisma from '@/lib/prisma'
import { createClient } from '@/lib/supabase/server'
import { patientSchema, type PatientFormData } from '@/lib/validations/patient'

// Helper para obtener el usuario actual
async function getCurrentUser() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  if (!user) {
    throw new Error('No autenticado')
  }

  const dbUser = await prisma.user.findUnique({
    where: { authId: user.id },
    select: { id: true, organizationId: true, role: true }
  })

  if (!dbUser) {
    throw new Error('Usuario no encontrado')
  }

  return dbUser
}

export async function createPatient(data: PatientFormData) {
  try {
    const user = await getCurrentUser()
    
    // Validar datos
    const validated = patientSchema.parse(data)
    
    // Crear paciente
    const patient = await prisma.patient.create({
      data: {
        ...validated,
        organizationId: user.organizationId,
        dateOfBirth: validated.dateOfBirth || undefined,
      },
      include: {
        assignedProfessional: {
          select: {
            firstName: true,
            lastName: true,
          }
        }
      }
    })

    revalidatePath('/patients')
    
    return { success: true, data: patient }
  } catch (error: any) {
    console.error('Error creating patient:', error)
    return { success: false, error: error.message }
  }
}

export async function updatePatient(id: string, data: PatientFormData) {
  try {
    const user = await getCurrentUser()
    
    // Validar que el paciente pertenece a la organización
    const existing = await prisma.patient.findFirst({
      where: {
        id,
        organizationId: user.organizationId,
        deletedAt: null,
      }
    })

    if (!existing) {
      throw new Error('Paciente no encontrado')
    }

    // Validar datos
    const validated = patientSchema.parse(data)
    
    // Actualizar paciente
    const patient = await prisma.patient.update({
      where: { id },
      data: {
        ...validated,
        dateOfBirth: validated.dateOfBirth || undefined,
      },
      include: {
        assignedProfessional: {
          select:firstName: true,
          lastName: true,
        }
      }
    }
  })

  revalidatePath('/patients')
  revalidatePath(`/patients/${id}`)
  
  return { success: true, data: patient }
} catch (error: any) {
  console.error('Error updating patient:', error)
  return { success: false, error: error.message }
}
}

export async function deletePatient(id: string) {
try {
  const user = await getCurrentUser()
  
  // Validar que el paciente pertenece a la organización
  const existing = await prisma.patient.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
      deletedAt: null,
    }
  })

  if (!existing) {
    throw new Error('Paciente no encontrado')
  }

  // Soft delete
  await prisma.patient.update({
    where: { id },
    data: {
      deletedAt: new Date(),
    }
  })

  revalidatePath('/patients')
  
  return { success: true }
} catch (error: any) {
  console.error('Error deleting patient:', error)
  return { success: false, error: error.message }
}
}

export async function getPatients(search?: string) {
try {
  const user = await getCurrentUser()
  
  const patients = await prisma.patient.findMany({
    where: {
      organizationId: user.organizationId,
      deletedAt: null,
      ...(search && {
        OR: [
          { firstName: { contains: search, mode: 'insensitive' } },
          { lastName: { contains: search, mode: 'insensitive' } },
          { dni: { contains: search } },
          { phone: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
        ]
      })
    },
    include: {
      assignedProfessional: {
        select: {
          firstName: true,
          lastName: true,
        }
      },
      _count: {
        select: {
          appointments: true,
          treatments: true,
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  return { success: true, data: patients }
} catch (error: any) {
  console.error('Error getting patients:', error)
  return { success: false, error: error.message }
}
}

export async function getPatient(id: string) {
try {
  const user = await getCurrentUser()
  
  const patient = await prisma.patient.findFirst({
    where: {
      id,
      organizationId: user.organizationId,
      deletedAt: null,
    },
    include: {
      assignedProfessional: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
        }
      },
      appointments: {
        where: { deletedAt: null },
        include: {
          professional: {
            select: {
              firstName: true,
              lastName: true,
            }
          },
          service: true,
        },
        orderBy: { startTime: 'desc' },
        take: 10,
      },
      treatments: {
        where: { deletedAt: null },
        include: {
          service: true,
          professional: {
            select: {
              firstName: true,
              lastName: true,
            }
          },
          images: {
            orderBy: { takenAt: 'desc' },
            take: 3,
          }
        },
        orderBy: { createdAt: 'desc' }
      },
      payments: {
        orderBy: { createdAt: 'desc' },
        take: 10,
      }
    }
  })

  if (!patient) {
    throw new Error('Paciente no encontrado')
  }

  return { success: true, data: patient }
} catch (error: any) {
  console.error('Error getting patient:', error)
  return { success: false, error: error.message }
}
}