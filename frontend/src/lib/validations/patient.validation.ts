import { z } from 'zod';

export const patientSchema = z.object({
    firstName: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
    lastName: z.string().min(2, 'El apellido debe tener al menos 2 caracteres'),
    dni: z.string().optional(),
    phone: z.string().min(9, 'El teléfono debe tener al menos 9 dígitos'),
    email: z.string().email('Email inválido').optional().or(z.literal('')),
    dateOfBirth: z.string().optional(),
    gender: z.string().optional(),
    address: z.string().optional(),
    occupation: z.string().optional(),
    emergencyContact: z.string().optional(),
    emergencyPhone: z.string().optional(),
    referralSource: z.enum(['WEBSITE', 'INSTAGRAM', 'TIKTOK', 'FACEBOOK', 'GOOGLE', 'WORD_OF_MOUTH', 'OTHER']).optional(),
    assignedProfessionalId: z.string().uuid('ID de profesional inválido').optional(),
});

export type PatientFormData = z.infer<typeof patientSchema>;
