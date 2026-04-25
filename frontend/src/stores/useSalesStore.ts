import { create } from "zustand";
import { salesService } from "../services/sales.service";
import { Sale, SalesFilters } from "../types/sales.types";

interface SalesState {
  sales: Sale[];
  isLoading: boolean;
  isExporting: boolean;
  error: string | null;
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  summary: {
    totalAmount: number;
    count: number;
    serviceAmount?: number;
    serviceCount?: number;
    productAmount?: number;
    productCount?: number;
  };
  filters: SalesFilters;

  // Actions
  fetchSales: (filters?: SalesFilters) => Promise<void>;
  exportSales: () => Promise<void>;
  setFilters: (filters: SalesFilters) => void;
  clearFilters: () => void;
  clearError: () => void;
}

const defaultFilters: SalesFilters = {
  page: 1,
  limit: 20,
};

export const useSalesStore = create<SalesState>((set, get) => ({
  sales: [],
  isLoading: false,
  isExporting: false,
  error: null,
  pagination: {
    page: 1,
    limit: 20,
    total: 0,
    totalPages: 0,
  },
  summary: {
    totalAmount: 0,
    count: 0,
  },
  filters: defaultFilters,

  fetchSales: async (filters?: SalesFilters) => {
    set({ isLoading: true, error: null });
    try {
      const currentFilters = filters || get().filters;
      const response = await salesService.getSales(currentFilters);

      set({
        sales: response.data,
        pagination: response.pagination,
        summary: response.summary,
        filters: currentFilters,
        isLoading: false,
      });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al cargar ventas",
        isLoading: false,
      });
    }
  },

  exportSales: async () => {
    set({ isExporting: true, error: null });
    try {
      const { startDate, endDate, paymentMethod, serviceId } = get().filters;
      const blob = await salesService.exportSales({
        startDate,
        endDate,
        paymentMethod,
        serviceId,
      });

      // Create download link
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `ventas_${new Date().toISOString().split("T")[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      set({ isExporting: false });
    } catch (error) {
      set({
        error:
          error instanceof Error ? error.message : "Error al exportar ventas",
        isExporting: false,
      });
    }
  },

  setFilters: (filters: SalesFilters) => {
    set({ filters: { ...get().filters, ...filters } });
  },

  clearFilters: () => {
    set({ filters: defaultFilters });
  },

  clearError: () => set({ error: null }),
}));
