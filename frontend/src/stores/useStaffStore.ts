import { create } from "zustand";
import { staffService } from "@/services/staff.service";
import type { StaffMember } from "@/types/staff.types";
import type { UpdateStaffDTO } from "@/types/dto/staff.dto";

interface StaffState {
  staff: StaffMember[];
  selectedStaff: StaffMember | null;
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
  fetchStaff: (
    params?: { page?: number; limit?: number; search?: string; role?: string },
    forceRefresh?: boolean,
  ) => Promise<void>;
  fetchStaffById: (id: string) => Promise<void>;
  updateStaff: (id: string, data: UpdateStaffDTO) => Promise<void>;
  deleteStaff: (id: string) => Promise<void>;
  setSelectedStaff: (staff: StaffMember | null) => void;
  clearError: () => void;
  reset: () => void;
}

export const useStaffStore = create<StaffState>((set, get) => ({
  staff: [],
  selectedStaff: null,
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

  fetchStaff: async (params, forceRefresh = false) => {
    const state = get();
    if (!forceRefresh && !state.shouldRefetch() && state.staff.length > 0) {
      return;
    }
    set({ isLoading: true, error: null });
    try {
      const response = await staffService.getStaff(params);
      set({
        staff: response.data,
        pagination: response.pagination,
        lastFetchedAt: Date.now(),
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al cargar personal",
        isLoading: false,
      });
    }
  },

  fetchStaffById: async (id) => {
    set({ isLoading: true, error: null });
    try {
      const response = await staffService.getStaffById(id);
      set({
        selectedStaff: response.data,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al cargar personal",
        isLoading: false,
      });
    }
  },

  updateStaff: async (id, data) => {
    set({ isUpdating: true, error: null });
    try {
      await staffService.updateStaff(id, data);
      set({ isUpdating: false });
      // Refresh staff list
      const state = useStaffStore.getState();
      await state.fetchStaff({
        page: state.pagination.page,
        limit: state.pagination.limit,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error
            ? error.message
            : "Error al actualizar personal",
        isUpdating: false,
      });
    }
  },

  deleteStaff: async (id) => {
    set({ isDeleting: true, error: null });
    try {
      await staffService.deleteStaff(id);
      set({ isDeleting: false });
      // Refresh staff list
      const state = useStaffStore.getState();
      await state.fetchStaff({
        page: state.pagination.page,
        limit: state.pagination.limit,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al eliminar personal",
        isDeleting: false,
      });
    }
  },

  setSelectedStaff: (staff) => set({ selectedStaff: staff }),
  clearError: () => set({ error: null }),
  reset: () =>
    set({
      staff: [],
      selectedStaff: null,
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
    }),
}));
