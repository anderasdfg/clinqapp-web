// src/lib/validations/onboarding.ts
import { z } from 'zod';

// ============================================
// STEP 1: Basic Clinic Data
// ============================================

export const basicClinicDataSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  ruc: z.string()
    .length(11, 'El RUC debe tener 11 dígitos')
    .regex(/^\d+$/, 'El RUC debe contener solo números'),
  address: z.string().min(5, 'La dirección debe tener al menos 5 caracteres'),
  phone: z.string()
    .min(9, 'El teléfono debe tener al menos 9 dígitos')
    .regex(/^[+]?[\d\s-()]+$/, 'Formato de teléfono inválido'),
  email: z.string().email('Email inválido'),
  logoUrl: z.string().url().optional().nullable(),
  specialty: z.enum(['PODIATRY', 'DENTISTRY', 'AESTHETICS', 'GENERAL']).optional().default('PODIATRY'),
  // Social media and website
  website: z.string().url('URL inválida').optional().or(z.literal('')),
  instagramUrl: z.string().url('URL de Instagram inválida').optional().or(z.literal('')),
  facebookUrl: z.string().url('URL de Facebook inválida').optional().or(z.literal('')),
  tiktokUrl: z.string().url('URL de TikTok inválida').optional().or(z.literal('')),
  linkedinUrl: z.string().url('URL de LinkedIn inválida').optional().or(z.literal('')),
});

export type BasicClinicData = z.infer<typeof basicClinicDataSchema>;

// ============================================
// STEP 2: Business Hours
// ============================================

export const businessHourSchema = z.object({
  dayOfWeek: z.enum(['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY']),
  enabled: z.boolean(),
  startTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  endTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Formato de hora inválido (HH:MM)'),
  lunchStartTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
  lunchEndTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/).optional().nullable(),
}).refine(
  (data) => {
    if (!data.enabled) return true;
    const start = parseInt(data.startTime.replace(':', ''));
    const end = parseInt(data.endTime.replace(':', ''));
    return start < end;
  },
  { message: 'La hora de inicio debe ser menor que la hora de fin' }
);

export const businessHoursSchema = z.object({
  schedules: z.array(businessHourSchema).min(1, 'Debe configurar al menos un día'),
});

export type BusinessHour = z.infer<typeof businessHourSchema>;
export type BusinessHours = z.infer<typeof businessHoursSchema>;

// ============================================
// STEP 3: Payment Methods
// ============================================

export const paymentMethodSchema = z.object({
  type: z.enum(['CASH', 'CREDIT_CARD', 'DEBIT_CARD', 'BANK_TRANSFER', 'MOBILE_PAYMENT', 'BANK_DEPOSIT', 'OTHER']),
  otherName: z.string().optional().nullable(),
}).refine(
  (data) => {
    if (data.type === 'OTHER') {
      return !!data.otherName && data.otherName.trim().length > 0;
    }
    return true;
  },
  { message: 'Debe especificar el nombre del método de pago personalizado', path: ['otherName'] }
);

export const paymentMethodsSchema = z.object({
  methods: z.array(paymentMethodSchema).min(1, 'Debe seleccionar al menos un método de pago'),
});

export type PaymentMethod = z.infer<typeof paymentMethodSchema>;
export type PaymentMethods = z.infer<typeof paymentMethodsSchema>;

// ============================================
// STEP 4: Consultation Types
// ============================================

export const consultationTypesSchema = z.object({
  types: z.array(z.enum(['IN_PERSON', 'TELEMEDICINE', 'HOME_VISIT']))
    .min(1, 'Debe seleccionar al menos un tipo de consulta'),
});

export type ConsultationTypes = z.infer<typeof consultationTypesSchema>;

// ============================================
// STEP 5: Services/Treatments
// ============================================

export const serviceSchema = z.object({
  name: z.string().min(2, 'El nombre debe tener al menos 2 caracteres'),
  description: z.string().optional().nullable(),
  category: z.enum(['DIAGNOSTIC', 'TREATMENT', 'FOLLOWUP', 'OTHER']).default('OTHER'),
  duration: z.number().min(5, 'La duración mínima es 5 minutos').max(480, 'La duración máxima es 8 horas'),
  basePrice: z.number().min(0, 'El precio debe ser mayor o igual a 0').optional().nullable(),
  currency: z.enum(['PEN', 'USD']).default('PEN'),
});

export const servicesSchema = z.object({
  services: z.array(serviceSchema).min(1, 'Debe agregar al menos un servicio'),
});

export type Service = z.infer<typeof serviceSchema>;
export type Services = z.infer<typeof servicesSchema>;

// ============================================
// STEP 6: Schedule Configuration
// ============================================

export const scheduleConfigSchema = z.object({
  defaultAppointmentDuration: z.number()
    .min(5, 'La duración mínima es 5 minutos')
    .max(240, 'La duración máxima es 4 horas'),
  appointmentInterval: z.number()
    .min(0, 'El intervalo mínimo es 0 minutos')
    .max(60, 'El intervalo máximo es 1 hora'),
  allowOnlineBooking: z.boolean().default(false),
});

export type ScheduleConfig = z.infer<typeof scheduleConfigSchema>;

// ============================================
// STEP 7: Notifications
// ============================================

export const notificationsSchema = z.object({
  notificationEmail: z.boolean().default(true),
  notificationWhatsapp: z.boolean().default(false),
  whatsappNumber: z.string().optional().nullable(),
  sendReminders: z.boolean().default(true),
  reminderHoursBefore: z.number()
    .min(1, 'Mínimo 1 hora')
    .max(168, 'Máximo 7 días (168 horas)')
    .default(24),
}).refine(
  (data) => {
    if (data.notificationWhatsapp) {
      return !!data.whatsappNumber && data.whatsappNumber.trim().length >= 9;
    }
    return true;
  },
  { message: 'Debe ingresar un número de WhatsApp válido', path: ['whatsappNumber'] }
);

export type Notifications = z.infer<typeof notificationsSchema>;

// ============================================
// STEP 8: Team Invitations
// ============================================

export const invitationSchema = z.object({
  email: z.string().email('Email inválido'),
  role: z.enum(['PROFESSIONAL', 'RECEPTIONIST', 'OWNER']),
});

export const invitationsSchema = z.object({
  invitations: z.array(invitationSchema),
});

export type Invitation = z.infer<typeof invitationSchema>;
export type Invitations = z.infer<typeof invitationsSchema>;

// ============================================
// COMPLETE ONBOARDING DATA
// ============================================

export const completeOnboardingSchema = z.object({
  basicData: basicClinicDataSchema,
  businessHours: businessHoursSchema,
  paymentMethods: paymentMethodsSchema,
  consultationTypes: consultationTypesSchema,
  services: servicesSchema,
  scheduleConfig: scheduleConfigSchema,
  notifications: notificationsSchema,
  invitations: invitationsSchema.optional(),
});

export type CompleteOnboardingData = z.infer<typeof completeOnboardingSchema>;
