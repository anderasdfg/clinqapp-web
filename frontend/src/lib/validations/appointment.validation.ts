import { z } from 'zod';

export const appointmentSchema = z.object({
    patientId: z.string().min(1, 'Selecciona un paciente'),
    professionalId: z.string().min(1, 'Selecciona un profesional'),
    serviceId: z.string().optional(),
    startTime: z.string().min(1, 'Selecciona fecha y hora de inicio'),
    endTime: z.string().min(1, 'Selecciona fecha y hora de fin'),
    notes: z.string().optional(),
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
