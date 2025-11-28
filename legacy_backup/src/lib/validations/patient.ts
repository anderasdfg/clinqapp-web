// src/lib/validations/patient.ts
import { z } from 'zod';

export const patientSchema = z.object({
  firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
  dni: z
    .string()
    .regex(/^\d{8}$/, 'DNI debe tener 8 dígitos')
    .optional()
    .or(z.literal('')),
  phone: z.string().min(9, 'Teléfono debe tener al menos 9 dígitos'),
  email: z.string().email('Email inválido').optional().or(z.literal('')),
  dateOfBirth: z.date().optional(),
  gender: z.string().optional(),
  address: z.string().optional(),
  occupation: z.string().optional(),
  emergencyContact: z.string().optional(),
  emergencyPhone: z.string().optional(),
  referralSource: z.enum([
    'WEBSITE',
    'INSTAGRAM',
    'TIKTOK',
    'FACEBOOK',
    'GOOGLE',
    'WORD_OF_MOUTH',
    'OTHER',
  ]),
  assignedProfessionalId: z.string().uuid().optional(),
  medicalHistory: z
    .object({
      allergies: z.array(z.string()).optional(),
      medications: z.array(z.string()).optional(),
      chronic_conditions: z.array(z.string()).optional(),
      previous_surgeries: z.array(z.string()).optional(),
      // specialty_notes: z.record(z.any()).optional(),
    })
    .optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
