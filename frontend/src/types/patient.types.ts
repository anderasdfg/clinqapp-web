// Enums
export enum ReferralSource {
    WEBSITE = 'WEBSITE',
    INSTAGRAM = 'INSTAGRAM',
    TIKTOK = 'TIKTOK',
    FACEBOOK = 'FACEBOOK',
    GOOGLE = 'GOOGLE',
    WORD_OF_MOUTH = 'WORD_OF_MOUTH',
    OTHER = 'OTHER',
}

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
    createdAt: string;
    updatedAt: string;
}

// Create/Update patient DTO
export interface CreatePatientDTO {
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
    referralSource?: ReferralSource;
    assignedProfessionalId?: string;
}

export type UpdatePatientDTO = Partial<CreatePatientDTO>;

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
    [ReferralSource.WEBSITE]: 'Sitio Web',
    [ReferralSource.INSTAGRAM]: 'Instagram',
    [ReferralSource.TIKTOK]: 'TikTok',
    [ReferralSource.FACEBOOK]: 'Facebook',
    [ReferralSource.GOOGLE]: 'Google',
    [ReferralSource.WORD_OF_MOUTH]: 'Recomendación',
    [ReferralSource.OTHER]: 'Otro',
};
