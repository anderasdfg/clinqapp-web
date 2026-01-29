import { create } from "zustand";
import type {
  Appointment,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  UpdateAppointmentStatusDTO,
  AppointmentsQueryParams,
  CalendarViewMode,
  AppointmentStatus,
} from "@/types/appointment.types";
import { appointmentsService } from "@/services/appointments.service";

// Cache TTL: 2 minutes
const CACHE_TTL = 2 * 60 * 1000;

interface AppointmentsState {
  // Data
  appointments: Appointment[];
  selectedAppointment: Appointment | null;

  // Cache
  lastFetchedAt: number | null;

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
  shouldRefetch: (params?: AppointmentsQueryParams) => boolean;
  setViewMode: (mode: CalendarViewMode) => void;
  setCurrentDate: (date: Date) => void;
  setFilters: (filters: Partial<AppointmentsState["filters"]>) => void;
  setCurrentPage: (page: number) => void;

  fetchAppointments: (
    params?: AppointmentsQueryParams,
    forceRefresh?: boolean,
  ) => Promise<void>;
  fetchAppointmentById: (id: string) => Promise<void>;
  createAppointment: (data: CreateAppointmentDTO) => Promise<void>;
  updateAppointment: (id: string, data: UpdateAppointmentDTO) => Promise<void>;
  updateAppointmentStatus: (
    id: string,
    data: UpdateAppointmentStatusDTO,
  ) => Promise<void>;
  deleteAppointment: (id: string) => Promise<void>;
  checkAvailability: (
    professionalId: string,
    startTime: string,
    endTime: string,
    excludeId?: string,
  ) => Promise<boolean>;
  addImagesToAppointment: (id: string, images: string[]) => Promise<void>;
}

export const useAppointmentsStore = create<AppointmentsState>((set, get) => ({
  // Initial state
  appointments: [],
  selectedAppointment: null,
  lastFetchedAt: null,
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

  // Check if cache is stale
  shouldRefetch: (newParams?: AppointmentsQueryParams) => {
    const state = get();
    if (!state.lastFetchedAt) return true;

    // Check if TTL expired
    const isStale = Date.now() - state.lastFetchedAt > CACHE_TTL;
    if (isStale) return true;

    // If new params are provided, check if they match current filters
    if (newParams) {
      const currentFilters = state.filters;
      // Compare meaningful filters
      if (
        (newParams.patientId &&
          newParams.patientId !== currentFilters.patientId) ||
        (newParams.professionalId &&
          newParams.professionalId !== currentFilters.professionalId) ||
        (newParams.status && newParams.status !== currentFilters.status) ||
        (newParams.startDate &&
          newParams.startDate !== currentFilters.startDate) ||
        (newParams.endDate && newParams.endDate !== currentFilters.endDate)
      ) {
        return true;
      }
    }

    return false;
  },

  // Actions
  setViewMode: (mode) => set({ viewMode: mode }),

  setCurrentDate: (date) => set({ currentDate: date }),

  setFilters: (newFilters) =>
    set((state) => ({
      filters: { ...state.filters, ...newFilters },
      currentPage: 1, // Reset to first page when filters change
    })),

  setCurrentPage: (page) => set({ currentPage: page }),

  fetchAppointments: async (params, forceRefresh = false) => {
    const state = get();

    // Skip if cache is fresh and not forcing refresh
    if (!forceRefresh && !state.shouldRefetch(params)) {
      return;
    }

    set({ isLoading: true });
    try {
      const mergedFilters = params
        ? { ...state.filters, ...params }
        : state.filters;

      // Remove undefined values to avoid sending them as "undefined" strings in URL
      const cleanFilters = Object.fromEntries(
        Object.entries(mergedFilters).filter(([_, v]) => v !== undefined),
      );

      const queryParams: AppointmentsQueryParams = {
        page: params?.page ?? state.currentPage,
        limit: params?.limit ?? 50,
        ...cleanFilters,
        status: (params?.status || state.filters.status) as
          | AppointmentStatus
          | undefined,
      };

      const response = await appointmentsService.getAppointments(queryParams);

      set((state) => {
        const nextFilters = cleanFilters;

        // Check if filters actually changed
        const filtersChanged =
          JSON.stringify(nextFilters) !== JSON.stringify(state.filters);

        return {
          appointments: response.data,
          currentPage: response.pagination.page,
          totalPages: response.pagination.totalPages,
          totalAppointments: response.pagination.total,
          lastFetchedAt: Date.now(),
          isLoading: false,
          filters: filtersChanged ? nextFilters : state.filters,
        };
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
          apt.id === appointment.id ? appointment : apt,
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
        data,
      );

      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? updatedAppointment : apt,
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
      const completeAppointment =
        await appointmentsService.getAppointmentById(id);

      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? completeAppointment : apt,
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

  addImagesToAppointment: async (id, images) => {
    set({ isUpdating: true });
    try {
      // Get current appointment
      const currentAppointment = get().appointments.find(
        (apt) => apt.id === id,
      );
      const existingImages = currentAppointment?.images || [];

      // Merge with new images
      const allImages = [...existingImages, ...images];

      // Update appointment with new images
      await appointmentsService.updateAppointment(id, { images: allImages });

      // Fetch updated appointment
      const updatedAppointment =
        await appointmentsService.getAppointmentById(id);

      set((state) => ({
        appointments: state.appointments.map((apt) =>
          apt.id === id ? updatedAppointment : apt,
        ),
        selectedAppointment:
          state.selectedAppointment?.id === id
            ? updatedAppointment
            : state.selectedAppointment,
        isUpdating: false,
      }));
    } catch (error) {
      console.error("Error adding images to appointment:", error);
      set({ isUpdating: false });
      throw error;
    }
  },
}));
