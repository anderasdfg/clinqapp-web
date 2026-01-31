// Enums - Export as type for consistency with DTOs
export type ReferralSource =
  | "WEBSITE"
  | "INSTAGRAM"
  | "TIKTOK"
  | "FACEBOOK"
  | "GOOGLE"
  | "WORD_OF_MOUTH"
  | "OTHER";

// User type (simplified for patient relations)
export interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  specialty?: string;
}

// Appointment type (simplified for patient details)
export interface Appointment {
  id: string;
  startTime: string;
  endTime: string;
  status: string;
  notes?: string;
  service?: {
    id: string;
    name: string;
  };
  professional: {
    firstName: string;
    lastName: string;
  };
}

// Patient interface
export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  dni?: string;
  phone: string;
  email?: string;
  dateOfBirth?: string;
  gender?: string;
  address?: string;
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  referralSource: ReferralSource;
  assignedProfessional?: User;
  assignedProfessionalId?: string;
  appointments?: Appointment[];
  medicalHistory?: MedicalHistory; // Structured podiatry JSON
  createdAt: string;
  updatedAt: string;
}

// Medical History structure for podiatry
export interface MedicalHistory {
  systemic?: {
    diabetes?: {
      has: boolean;
      type?: string;
      controlled?: boolean;
    };
    hypertension?: {
      has: boolean;
      controlled?: boolean;
    };
    [key: string]: unknown;
  };
  allergies?: {
    medication?: string;
    latex?: boolean;
    [key: string]: unknown;
  };
  podiatricExam?: {
    biomechanical?: {
      footType?: string;
      [key: string]: unknown;
    };
    nails?: {
      onychopathy?: unknown[];
      [key: string]: unknown;
    };
    [key: string]: unknown;
  };
  [key: string]: unknown;
}

// Re-export DTOs from dto folder for convenience
export type {
  CreatePatientDTO,
  UpdatePatientDTO,
  PatientsQueryDTO,
} from "./dto/patient.dto";

// API Response types
export interface PatientsListResponse {
  success: boolean;
  data: Patient[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface PatientResponse {
  success: boolean;
  data: Patient;
  message?: string;
}

export interface DeletePatientResponse {
  success: boolean;
  message: string;
}

// Query parameters for listing patients
export interface PatientsQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  assignedProfessionalId?: string;
  referralSource?: ReferralSource;
}

// Labels for referral sources (for UI)
export const REFERRAL_SOURCE_LABELS: Record<ReferralSource, string> = {
  WEBSITE: "Sitio Web",
  INSTAGRAM: "Instagram",
  TIKTOK: "TikTok",
  FACEBOOK: "Facebook",
  GOOGLE: "Google",
  WORD_OF_MOUTH: "Recomendación",
  OTHER: "Otro",
};
