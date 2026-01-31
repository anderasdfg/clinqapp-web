/**
 * Staff DTOs
 * Based on backend validation schemas from staff.controller.ts
 */

export type StaffRole = "PROFESSIONAL" | "OWNER" | "RECEPTIONIST";

/**
 * DTO for creating a new staff member
 * Matches backend createStaffSchema
 */
export interface CreateStaffDTO {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string;
  specialty?: string;
  licenseNumber?: string;
  role?: StaffRole; // Defaults to 'PROFESSIONAL'
}

/**
 * DTO for creating staff with auth ID (internal use)
 */
export interface CreateStaffWithAuthDTO extends CreateStaffDTO {
  authId: string; // UUID from Supabase auth
}

/**
 * DTO for updating an existing staff member
 * All fields are optional (partial update)
 */
export interface UpdateStaffDTO extends Partial<CreateStaffDTO> {}

/**
 * Query parameters for fetching staff
 */
export interface StaffQueryDTO {
  page?: number;
  limit?: number;
  search?: string;
  role?: StaffRole;
}
