import { PodiatryHistoryData } from "@/lib/validations/medical-record.validation";

// Appointment Status Type
export type AppointmentStatus =
  | "PENDING"
  | "CONFIRMED"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW"
  | "RESCHEDULED";

// Payment Method Type
export type PaymentMethod =
  | "CASH"
  | "CARD"
  | "BANK_TRANSFER"
  | "YAPE"
  | "PLIN"
  | "OTHER";

// Payment Status Type
export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

// Status labels in Spanish
export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  PENDING: "Pendiente",
  CONFIRMED: "Confirmada",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No Asistió",
  RESCHEDULED: "Reprogramada",
};

// Payment Method labels in Spanish
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  CARD: "Tarjeta",
  BANK_TRANSFER: "Transferencia",
  YAPE: "Yape",
  PLIN: "Plin",
  OTHER: "Otro",
};

// Payment Status labels in Spanish
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PENDING: "Pendiente",
  COMPLETED: "Pagado",
  FAILED: "Fallido",
  REFUNDED: "Reembolsado",
};

// Status colors for UI
export const APPOINTMENT_STATUS_COLORS: Record<AppointmentStatus, string> = {
  PENDING:
    "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400",
  CONFIRMED: "bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400",
  COMPLETED:
    "bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400",
  CANCELLED: "bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400",
  NO_SHOW: "bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400",
  RESCHEDULED:
    "bg-purple-100 text-purple-800 dark:bg-purple-900/20 dark:text-purple-400",
};

// Patient info (minimal)
export interface AppointmentPatient {
  id: string;
  firstName: string;
  lastName: string;
  phone: string;
  email?: string | null;
  dateOfBirth?: string | null;
  emergencyContact?: string | null;
  emergencyPhone?: string | null;
  medicalHistory?: PodiatryHistoryData;
}

// Professional info (minimal)
export interface AppointmentProfessional {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty?: string | null;
}

// Service info (minimal)
export interface AppointmentService {
  id: string;
  name: string;
  description?: string | null;
  duration: number;
  basePrice: number;
}

// Payment info (minimal)
export interface AppointmentPayment {
  id: string;
  amount: number;
  status: PaymentStatus;
  method: PaymentMethod;
  receiptNumber?: string | null;
  notes?: string | null;
}

// Full Appointment model
export interface Appointment {
  id: string;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  organizationId: string;
  patientId: string;
  professionalId: string;
  serviceId?: string | null;
  treatmentId?: string | null;
  sessionNumber?: number | null;
  startTime: string;
  endTime: string;
  status: AppointmentStatus;
  notes?: string | null;
  clinicalNotes?: string | null;
  cancellationReason?: string | null;
  reminderSentAt?: string | null;
  images?: string[]; // Treatment images URLs
  // Relations
  patient?: AppointmentPatient;
  professional?: AppointmentProfessional;
  service?: AppointmentService | null;
  payment?: AppointmentPayment | null;
}

// Re-export DTOs from dto folder for convenience
export type {
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  UpdateAppointmentStatusDTO,
  RegisterPaymentDTO,
  CheckAvailabilityDTO,
  AppointmentsQueryDTO,
} from "./dto/appointment.dto";

// API Response types
export interface AppointmentResponse {
  success: boolean;
  message?: string;
  data: Appointment;
}

export interface AppointmentsListResponse {
  success: boolean;
  data: Appointment[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteAppointmentResponse {
  success: boolean;
  message: string;
}

export interface AvailabilityResponse {
  success: boolean;
  available: boolean;
}

// Query parameters for filtering
export interface AppointmentsQueryParams {
  page?: number;
  limit?: number;
  startDate?: string;
  endDate?: string;
  patientId?: string;
  professionalId?: string;
  status?: AppointmentStatus;
}

// Calendar view modes
export type CalendarViewMode = "day" | "week" | "month";

// Time slot for availability
export interface TimeSlot {
  start: Date;
  end: Date;
  available: boolean;
}

// Availability check params
export interface AvailabilityCheckParams {
  professionalId: string;
  startTime: string;
  endTime: string;
  excludeId?: string;
}
