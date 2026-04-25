import { z } from 'zod';

export const appointmentSchema = z.object({
    patientId: z.string().min(1, 'Selecciona un paciente'),
    professionalId: z.string().min(1, 'Selecciona un profesional'),
    serviceIds: z.array(z.string().uuid()).min(1, 'Selecciona al menos un servicio'),
    startTime: z.string().min(1, 'Selecciona fecha y hora de inicio'),
    endTime: z.string().min(1, 'Selecciona fecha y hora de fin'),
    notes: z.string().optional(),
    sessionNumber: z.number().int().positive('El número de sesión debe ser positivo').optional(),
}).refine(
    (data) => {
        if (data.startTime && data.endTime) {
            return new Date(data.endTime) > new Date(data.startTime);
        }
        return true;
    },
    {
        message: 'La hora de fin debe ser posterior a la hora de inicio',
        path: ['endTime'],
    }
);

export type AppointmentFormData = z.infer<typeof appointmentSchema>;
