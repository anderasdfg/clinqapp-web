/**
 * Appointment DTOs
 * Based on backend validation schemas from appointments.controller.ts
 */

import { AppointmentStatus, PaymentMethod } from "../appointment.types";

/**
 * DTO for creating a new appointment
 * Matches backend createAppointmentSchema
 */
export interface CreateAppointmentDTO {
  patientId: string; // UUID
  professionalId: string; // UUID
  serviceId?: string; // UUID
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  notes?: string;
  clinicalNotes?: string;
  images?: string[]; // Array of image URLs
}

/**
 * DTO for updating an existing appointment
 * All fields are optional (partial update)
 */
export interface UpdateAppointmentDTO extends Partial<CreateAppointmentDTO> {
  status?: AppointmentStatus;
}

/**
 * DTO for updating appointment status
 * Matches backend updateStatusSchema
 */
export interface UpdateAppointmentStatusDTO {
  status: AppointmentStatus;
  cancellationReason?: string;
}

/**
 * DTO for registering payment
 * Matches backend registerPaymentSchema
 */
export interface RegisterPaymentDTO {
  amount: number; // Must be positive
  method: PaymentMethod;
  receiptNumber?: string;
  notes?: string;
}

/**
 * Query parameters for checking availability
 */
export interface CheckAvailabilityDTO {
  professionalId: string;
  startTime: string; // ISO datetime string
  endTime: string; // ISO datetime string
  excludeId?: string; // Appointment ID to exclude from check
}

/**
 * Query parameters for fetching appointments
 */
export interface AppointmentsQueryDTO {
  page?: number;
  limit?: number;
  startDate?: string; // ISO date string
  endDate?: string; // ISO date string
  patientId?: string;
  professionalId?: string;
  status?: AppointmentStatus;
}
