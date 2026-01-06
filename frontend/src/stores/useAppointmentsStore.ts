import { create } from "zustand";
import type {
  Appointment,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  UpdateAppointmentStatusDTO,
  AppointmentsQueryParams,
  CalendarViewMode,
} from "@/types/appointment.types";
import { appointmentsService } from "@/services/appointments.service";

interface AppointmentsState {
  // Data
  appointments: Appointment[];
  selectedAppointment: Appointment | null;

  // UI State
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;

  // Calendar State
  viewMode: CalendarViewMode;
  currentDate: Date;

  // Filters
  filters: {
    startDate?: string;
    endDate?: string;
    patientId?: string;
    professionalId?: string;
    status?: string;
  };

  // Pagination
  currentPage: number;
  totalPages: number;
  totalAppointments: number;

  // Actions
  setViewMode: (mode: CalendarViewMode) => void;
  setCurrentDate: (date: Date) => void;
  setFilters: (filters: Partial<AppointmentsState["filters"]>) => void;
  setCurrentPage: (page: number) => void;

  fetchAppointments: (params?: AppointmentsQueryParams) => Promise<void>;
  fetchAppointmentById: (id: string) => Promise<void>;
  createAppointment: (data: CreateAppointmentDTO) => Promise<void>;
  updateAppointment: (id: string, data: UpdateAppointmentDTO) => Promise<void>;
  updateAppointmentStatus: (
    id: string,
    data: UpdateAppointmentStatusDTO
  ) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  checkAvailability: (
    professionalId: string,
    startTime: string,
    endTime: string,
    excludeId?: string
  ) => Promise<boolean>;
}

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  // Initial state
  appointments: [],
  selectedAppointment: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  viewMode: "week",
  currentDate: new Date(),
  filters: {},
  currentPage: 1,
  totalPages: 1,
  totalAppointments: 0,

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),

  setCurrentDate: (date) => set({ currentDate: date }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    })),

  setCurrentPage: (page) => set({ currentPage: page }),

  fetchAppointments: async (params) => {
    set({ isLoading: true });
    try {
      const state = get();
      const queryParams: AppointmentsQueryParams = {
        page: params?.page ?? state.currentPage,
        limit: params?.limit ?? 50,
        ...state.filters,
        ...params,
      };

      const response = await appointmentsService.getAppointments(queryParams);

      set({
        appointments: response.data,
        currentPage: response.pagination.page,
        totalPages: response.pagination.totalPages,
        totalAppointments: response.pagination.total,
        isLoading: false,
      });
    } catch (error) {
      console.error("Error fetching appointments:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  fetchAppointmentById: async (id) => {
    set({ isLoading: true });
    try {
      const appointment = await appointmentsService.getAppointmentById(id);

      // Update both selectedAppointment and the appointments array
      set((state) => ({
        selectedAppointment: appointment,
        appointments: state.appointments.map((apt) =>
          apt.id === appointment.id ? appointment : apt
        ),
        isLoading: false,
      }));
    } catch (error) {
      console.error("Error fetching appointment:", error);
      set({ isLoading: false });
      throw error;
    }
  },

  createAppointment: async (data) => {
    set({ isCreating: true });
    try {
      const newAppointment = await appointmentsService.createAppointment(data);

      set((state) => ({
        appointments: [...state.appointments, newAppointment],
        totalAppointments: state.totalAppointments + 1,
        isCreating: false,
      }));

      // Refresh appointments list
      await get().fetchAppointments();
    } catch (error) {
      console.error("Error creating appointment:", error);
      set({ isCreating: false });
      throw error;
    }
  },

  updateAppointment: async (id, data) => {
    set({ isUpdating: true });
    try {
      const updatedAppointment = await appointmentsService.updateAppointment(
        id,
        data
      );

      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? updatedAppointment : apt
        ),
        selectedAppointment:
          state.selectedAppointment?.id === id
            ? updatedAppointment
            : state.selectedAppointment,
        isUpdating: false,
      }));
    } catch (error) {
      console.error("Error updating appointment:", error);
      set({ isUpdating: false });
      throw error;
    }
  },

  updateAppointmentStatus: async (id, data) => {
    set({ isUpdating: true });
    try {
      await appointmentsService.updateAppointmentStatus(id, data);

      // Fetch complete appointment data with relations
      const completeAppointment = await appointmentsService.getAppointmentById(
        id
      );

      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? completeAppointment : apt
        ),
        selectedAppointment:
          state.selectedAppointment?.id === id
            ? completeAppointment
            : state.selectedAppointment,
        isUpdating: false,
      }));
    } catch (error) {
      console.error("Error updating appointment status:", error);
      set({ isUpdating: false });
      throw error;
    }
  },

  deleteAppointment: async (id) => {
    set({ isDeleting: true });
    try {
      await appointmentsService.deleteAppointment(id);

      set((state) => ({
        appointments: state.appointments.filter((apt) => apt.id !== id),
        totalAppointments: state.totalAppointments - 1,
        selectedAppointment:
          state.selectedAppointment?.id === id
            ? null
            : state.selectedAppointment,
        isDeleting: false,
      }));
    } catch (error) {
      console.error("Error deleting appointment:", error);
      set({ isDeleting: false });
      throw error;
    }
  },

  checkAvailability: async (professionalId, startTime, endTime, excludeId) => {
    try {
      const available = await appointmentsService.checkAvailability({
        professionalId,
        startTime,
        endTime,
        excludeId,
      });
      return available;
    } catch (error) {
      console.error("Error checking availability:", error);
      throw error;
    }
  },
}));
