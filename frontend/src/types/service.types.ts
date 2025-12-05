// Service Types

export enum ServiceCategory {
    DIAGNOSTIC = 'DIAGNOSTIC',
    TREATMENT = 'TREATMENT',
    FOLLOWUP = 'FOLLOWUP',
    OTHER = 'OTHER',
}

export const SERVICE_CATEGORY_LABELS: Record<ServiceCategory, string> = {
    [ServiceCategory.DIAGNOSTIC]: 'Diagnóstico',
    [ServiceCategory.TREATMENT]: 'Tratamiento',
    [ServiceCategory.FOLLOWUP]: 'Seguimiento',
    [ServiceCategory.OTHER]: 'Otro',
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

export interface ServiceFormData {
    name: string;
    description?: string;
    category: ServiceCategory;
    basePrice: number;
    duration: number;
    isActive: boolean;
}

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
