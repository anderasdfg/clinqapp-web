import { create } from 'zustand';
import type { Patient, PatientsQueryParams } from '@/types/patient.types';
import { patientsService } from '@/services/patients.service';

interface PatientsState {
    // Data
    patients: Patient[];
    selectedPatient: Patient | null;

    // Pagination
    currentPage: number;
    totalPages: number;
    totalPatients: number;
    limit: number;

    // Filters
    searchQuery: string;
    assignedProfessionalFilter: string | null;
    referralSourceFilter: string | null;

    // Loading states
    isLoading: boolean;
    isCreating: boolean;
    isUpdating: boolean;
    isDeleting: boolean;

    // Error state
    error: string | null;

    // Actions
    fetchPatients: (params?: PatientsQueryParams) => Promise<void>;
    fetchPatientById: (id: string) => Promise<void>;
    createPatient: (data: any) => Promise<Patient>;
    updatePatient: (id: string, data: any) => Promise<Patient>;
    deletePatient: (id: string) => Promise<void>;
    setSearchQuery: (query: string) => void;
    setAssignedProfessionalFilter: (professionalId: string | null) => void;
    setReferralSourceFilter: (source: string | null) => void;
    setCurrentPage: (page: number) => void;
    clearSelectedPatient: () => void;
    clearError: () => void;
}

export const usePatientsStore = create<PatientsState>((set, get) => ({
    // Initial state
    patients: [],
    selectedPatient: null,
    currentPage: 1,
    totalPages: 1,
    totalPatients: 0,
    limit: 10,
    searchQuery: '',
    assignedProfessionalFilter: null,
    referralSourceFilter: null,
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,

    // Fetch patients with filters
    fetchPatients: async (params?: PatientsQueryParams) => {
        set({ isLoading: true, error: null });
        try {
            const state = get();
            const queryParams: PatientsQueryParams = {
                page: params?.page ?? state.currentPage,
                limit: params?.limit ?? state.limit,
                search: params?.search ?? (state.searchQuery || undefined),
                assignedProfessionalId: params?.assignedProfessionalId ?? (state.assignedProfessionalFilter || undefined),
                referralSource: params?.referralSource ?? (state.referralSourceFilter || undefined) as any,
            };

            const response = await patientsService.getPatients(queryParams);

            set({
                patients: response.data,
                currentPage: response.pagination.page,
                totalPages: response.pagination.totalPages,
                totalPatients: response.pagination.total,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al cargar pacientes',
                isLoading: false,
            });
        }
    },

    // Fetch single patient
    fetchPatientById: async (id: string) => {
        set({ isLoading: true, error: null });
        try {
            const patient = await patientsService.getPatientById(id);
            set({
                selectedPatient: patient,
                isLoading: false,
            });
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al cargar paciente',
                isLoading: false,
            });
        }
    },

    // Create patient
    createPatient: async (data: any) => {
        set({ isCreating: true, error: null });
        try {
            const patient = await patientsService.createPatient(data);
            set({ isCreating: false });

            // Refresh list
            await get().fetchPatients();

            return patient;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al crear paciente',
                isCreating: false,
            });
            throw error;
        }
    },

    // Update patient
    updatePatient: async (id: string, data: any) => {
        set({ isUpdating: true, error: null });
        try {
            const patient = await patientsService.updatePatient(id, data);
            set({ isUpdating: false });

            // Update in list if exists
            set((state) => ({
                patients: state.patients.map((p) => (p.id === id ? patient : p)),
                selectedPatient: state.selectedPatient?.id === id ? patient : state.selectedPatient,
            }));

            return patient;
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al actualizar paciente',
                isUpdating: false,
            });
            throw error;
        }
    },

    // Delete patient
    deletePatient: async (id: string) => {
        set({ isDeleting: true, error: null });
        try {
            await patientsService.deletePatient(id);
            set({ isDeleting: false });

            // Remove from list
            set((state) => ({
                patients: state.patients.filter((p) => p.id !== id),
                totalPatients: state.totalPatients - 1,
            }));
        } catch (error: any) {
            set({
                error: error.response?.data?.error || 'Error al eliminar paciente',
                isDeleting: false,
            });
            throw error;
        }
    },

    // Filter actions
    setSearchQuery: (query: string) => {
        set({ searchQuery: query, currentPage: 1 });
    },

    setAssignedProfessionalFilter: (professionalId: string | null) => {
        set({ assignedProfessionalFilter: professionalId, currentPage: 1 });
    },

    setReferralSourceFilter: (source: string | null) => {
        set({ referralSourceFilter: source, currentPage: 1 });
    },

    setCurrentPage: (page: number) => {
        set({ currentPage: page });
    },

    clearSelectedPatient: () => {
        set({ selectedPatient: null });
    },

    clearError: () => {
        set({ error: null });
    },
}));
