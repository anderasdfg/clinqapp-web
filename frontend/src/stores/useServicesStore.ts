import { create } from "zustand";
import { servicesService } from "@/services/services.service";
import type { Service } from "@/types/service.types";

interface ServicesState {
  services: Service[];
  selectedService: Service | null;
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  lastFetchedAt: number | null;

  // Actions
  shouldRefetch: () => boolean;
  fetchServices: (
    params?: {
      page?: number;
      limit?: number;
      search?: string;
      isActive?: boolean;
    },
    forceRefresh?: boolean,
  ) => Promise<void>;
  fetchServiceById: (id: string) => Promise<void>;
  createService: (data: any) => Promise<void>;
  updateService: (id: string, data: any) => Promise<void>;
  deleteService: (id: string) => Promise<void>;
  setSelectedService: (service: Service | null) => void;
  clearError: () => void;
}

export const useServicesStore = create<ServicesState>((set, get) => ({
  services: [],
  selectedService: null,
  isLoading: false,
  isCreating: false,
  isUpdating: false,
  isDeleting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 50,
    total: 0,
    totalPages: 0,
  },
  lastFetchedAt: null,

  shouldRefetch: () => {
    const state = get();
    if (!state.lastFetchedAt) return true;
    return Date.now() - state.lastFetchedAt > 5 * 60 * 1000; // 5 min TTL
  },

  fetchServices: async (params, forceRefresh = false) => {
    const state = get();
    if (!forceRefresh && !state.shouldRefetch() && state.services.length > 0) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await servicesService.getServices(params);
      set({
        services: response.data,
        pagination: response.pagination,
        lastFetchedAt: Date.now(),
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al cargar servicios",
        isLoading: false,
      });
    }
  },

  fetchServiceById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await servicesService.getServiceById(id);
      set({
        selectedService: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al cargar servicio",
        isLoading: false,
      });
    }
  },

  createService: async (data) => {
    set({ isCreating: true, error: null });
    try {
      await servicesService.createService(data);
      set({ isCreating: false });
      // Refresh services list
      const state = useServicesStore.getState();
      await state.fetchServices({
        page: state.pagination.page,
        limit: state.pagination.limit,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al crear servicio",
        isCreating: false,
      });
      throw error;
    }
  },

  updateService: async (id, data) => {
    set({ isUpdating: true, error: null });
    try {
      await servicesService.updateService(id, data);
      set({ isUpdating: false });
      // Refresh services list
      const state = useServicesStore.getState();
      await state.fetchServices({
        page: state.pagination.page,
        limit: state.pagination.limit,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar servicio",
        isUpdating: false,
      });
      throw error;
    }
  },

  deleteService: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await servicesService.deleteService(id);
      set({ isDeleting: false });
      // Refresh services list
      const state = useServicesStore.getState();
      await state.fetchServices({
        page: state.pagination.page,
        limit: state.pagination.limit,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al eliminar servicio",
        isDeleting: false,
      });
    }
  },

  setSelectedService: (service) => set({ selectedService: service }),
  clearError: () => set({ error: null }),
}));
