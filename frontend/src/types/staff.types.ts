// Staff/Professional Types

export type UserRole = "OWNER" | "PROFESSIONAL" | "RECEPTIONIST" | "PATIENT";

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  OWNER: "Propietario",
  PROFESSIONAL: "Profesional",
  RECEPTIONIST: "Recepcionista",
  PATIENT: "Paciente",
};

export interface StaffMember {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
  role: UserRole;
  createdAt: string;
  updatedAt?: string;
}

// Re-export DTOs from dto folder for convenience
export type {
  CreateStaffDTO,
  UpdateStaffDTO,
  StaffQueryDTO,
} from "./dto/staff.dto";

export interface StaffListResponse {
  success: boolean;
  data: StaffMember[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface StaffResponse {
  success: boolean;
  data: StaffMember;
  message?: string;
}
