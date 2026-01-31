/**
 * Onboarding DTOs
 * Based on backend validation schemas from onboarding.controller.ts
 */

import { ServiceCategory } from "./service.dto";
import { StaffRole } from "./staff.dto";

export type DayOfWeek =
  | "MONDAY"
  | "TUESDAY"
  | "WEDNESDAY"
  | "THURSDAY"
  | "FRIDAY"
  | "SATURDAY"
  | "SUNDAY";

export type PaymentMethodType =
  | "CASH"
  | "CARD"
  | "BANK_TRANSFER"
  | "YAPE"
  | "PLIN"
  | "OTHER";

export type ConsultationType = "IN_PERSON" | "VIRTUAL" | "HOME_VISIT";

/**
 * Schedule configuration for a single day
 */
export interface DayScheduleDTO {
  dayOfWeek: DayOfWeek;
  startTime: string; // Format: "HH:MM"
  endTime: string; // Format: "HH:MM"
  enabled: boolean;
}

/**
 * Payment method configuration
 */
export interface PaymentMethodConfigDTO {
  type: PaymentMethodType;
  otherName: string | null; // Required if type is 'OTHER'
}

/**
 * Service configuration for onboarding
 */
export interface OnboardingServiceDTO {
  name: string;
  description?: string;
  category: ServiceCategory;
  basePrice: number;
  currency: string; // e.g., "PEN", "USD"
  duration: number; // Duration in minutes
}

/**
 * Basic clinic data
 */
export interface BasicClinicDataDTO {
  clinicName: string;
  address: string;
  city: string;
  phone: string;
  email?: string;
  website?: string;
  specialty?: string;
}

/**
 * Business hours configuration
 */
export interface BusinessHoursDTO {
  schedules: DayScheduleDTO[];
}

/**
 * Payment methods configuration
 */
export interface PaymentMethodsDTO {
  methods: PaymentMethodConfigDTO[];
}

/**
 * Consultation types configuration
 */
export interface ConsultationTypesDTO {
  types: ConsultationType[];
}

/**
 * Services configuration
 */
export interface ServicesConfigDTO {
  services: OnboardingServiceDTO[];
}

/**
 * Schedule configuration
 */
export interface ScheduleConfigDTO {
  defaultAppointmentDuration: number; // Minutes
  appointmentInterval: number; // Minutes between appointments
  allowOnlineBooking: boolean;
}

/**
 * Notifications configuration
 */
export interface NotificationsConfigDTO {
  notificationEmail: boolean;
  notificationWhatsapp: boolean;
  whatsappNumber: string | null;
  sendReminders: boolean;
  reminderHoursBefore: number;
}

/**
 * Staff invitation
 */
export interface StaffInvitationDTO {
  email: string;
  firstName: string;
  lastName: string;
  role: StaffRole;
}

/**
 * Invitations configuration
 */
export interface InvitationsConfigDTO {
  invitations: StaffInvitationDTO[];
}

/**
 * Complete onboarding data
 */
export interface CompleteOnboardingDTO {
  basicData: BasicClinicDataDTO;
  businessHours: BusinessHoursDTO;
  paymentMethods: PaymentMethodsDTO;
  consultationTypes: ConsultationTypesDTO;
  services: ServicesConfigDTO;
  scheduleConfig: ScheduleConfigDTO;
  notifications: NotificationsConfigDTO;
  invitations: InvitationsConfigDTO;
}
