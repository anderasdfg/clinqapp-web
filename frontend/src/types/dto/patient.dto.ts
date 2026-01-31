/**
 * Patient DTOs
 * Based on backend validation schemas from patients.controller.ts
 */

export type ReferralSource =
  | "WEBSITE"
  | "INSTAGRAM"
  | "TIKTOK"
  | "FACEBOOK"
  | "GOOGLE"
  | "WORD_OF_MOUTH"
  | "OTHER";

export type Gender = "MALE" | "FEMALE" | "OTHER";

// Constant values to avoid magic strings
export const GENDER = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
} as const satisfies Record<Gender, Gender>;

/**
 * DTO for creating a new patient
 * Matches backend createPatientSchema
 */
export interface CreatePatientDTO {
  firstName: string;
  lastName: string;
  dni?: string;
  phone: string;
  email?: string;
  dateOfBirth?: string; // ISO date string
  gender?: Gender;
  address?: string;
  occupation?: string;
  emergencyContact?: string;
  emergencyPhone?: string;
  referralSource?: ReferralSource;
  assignedProfessionalId?: string; // UUID
  medicalHistory?: Record<string, unknown>; // JSON object
}

/**
 * DTO for updating an existing patient
 * All fields are optional (partial update)
 */
export interface UpdatePatientDTO extends Partial<CreatePatientDTO> {}

/**
 * Query parameters for fetching patients
 */
export interface PatientsQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  assignedProfessionalId?: string;
  referralSource?: ReferralSource;
}
