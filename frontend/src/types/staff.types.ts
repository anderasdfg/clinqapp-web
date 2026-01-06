// Staff/Professional Types

export enum UserRole {
  OWNER = "OWNER",
  PROFESSIONAL = "PROFESSIONAL",
  RECEPTIONIST = "RECEPTIONIST",
  PATIENT = "PATIENT",
}

export const USER_ROLE_LABELS: Record<UserRole, string> = {
  [UserRole.OWNER]: "Propietario",
  [UserRole.PROFESSIONAL]: "Profesional",
  [UserRole.RECEPTIONIST]: "Recepcionista",
  [UserRole.PATIENT]: "Paciente",
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

export interface StaffFormData {
  email: string;
  firstName: string;
  lastName: string;
  phone?: string | null;
  specialty?: string | null;
  licenseNumber?: string | null;
  role: UserRole;
}

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
