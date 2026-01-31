// Service Types

export type ServiceCategory = "DIAGNOSTIC" | "TREATMENT" | "FOLLOWUP" | "OTHER";

// Constant values to avoid magic strings
export const SERVICE_CATEGORY = {
  DIAGNOSTIC: "DIAGNOSTIC",
  TREATMENT: "TREATMENT",
  FOLLOWUP: "FOLLOWUP",
  OTHER: "OTHER",
} as const satisfies Record<ServiceCategory, ServiceCategory>;

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
  DIAGNOSTIC: "Diagnóstico",
  TREATMENT: "Tratamiento",
  FOLLOWUP: "Seguimiento",
  OTHER: "Otro",
};

export interface Service {
  id: string;
  name: string;
  description?: string | null;
  category: ServiceCategory;
  basePrice: number;
  currency: string;
  duration: number; // in minutes
  requiresSessions: boolean;
  defaultSessions?: number | null;
  isActive: boolean;
  createdAt: string;
  updatedAt?: string;
}

// Re-export DTOs from dto folder for convenience
export type {
  CreateServiceDTO,
  UpdateServiceDTO,
  ServicesQueryDTO,
} from "./dto/service.dto";

export interface ServiceListResponse {
  success: boolean;
  data: Service[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface ServiceResponse {
  success: boolean;
  data: Service;
  message?: string;
}
