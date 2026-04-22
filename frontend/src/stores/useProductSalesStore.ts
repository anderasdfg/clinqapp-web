import { create } from "zustand";
import {
  ProductSale,
  CreateProductSaleData,
  ProductSalesResponse,
  SalesStats,
  productSalesService,
} from "@/services/product-sales.service";

// Cache TTL: 2 minutes
const CACHE_TTL = 2 * 60 * 1000;

interface ProductSalesState {
  // Sales data
  sales: ProductSale[];
  selectedSale: ProductSale | null;
  salesLastFetchedAt: number | null;

  // Stats
  stats: SalesStats | null;
  statsLastFetchedAt: number | null;

  // Pagination
  currentPage: number;
  totalPages: number;
  totalSales: number;
  limit: number;
  hasMore: boolean;

  // Filters
  patientFilter: string | null;
  startDateFilter: string | null;
  endDateFilter: string | null;

  // Loading states
  isLoadingSales: boolean;
  isLoadingStats: boolean;
  isCreatingSale: boolean;
  isExportingSales: boolean;

  // Error states
  salesError: string | null;
  statsError: string | null;

  // Actions
  fetchSales: (params?: {
    patientId?: string;
    startDate?: string;
    endDate?: string;
    page?: number;
    limit?: number;
  }, force?: boolean) => Promise<void>;
  
  fetchSale: (id: string) => Promise<ProductSale>;
  createSale: (data: CreateProductSaleData) => Promise<ProductSale>;
  
  fetchStats: (params?: {
    startDate?: string;
    endDate?: string;
  }, force?: boolean) => Promise<void>;
  
  exportSales: (params?: {
    startDate?: string;
    endDate?: string;
  }) => Promise<void>;

  // Utility actions
  setPatientFilter: (patientId: string | null) => void;
  setDateFilters: (startDate: string | null, endDate: string | null) => void;
  setSelectedSale: (sale: ProductSale | null) => void;
  clearErrors: () => void;
  resetFilters: () => void;
  nextPage: () => void;
  previousPage: () => void;
  goToPage: (page: number) => void;
}

export const useProductSalesStore = create<ProductSalesState>((set, get) => ({
  // Initial state
  sales: [],
  selectedSale: null,
  salesLastFetchedAt: null,
  stats: null,
  statsLastFetchedAt: null,
  currentPage: 1,
  totalPages: 1,
  totalSales: 0,
  limit: 20,
  hasMore: false,
  patientFilter: null,
  startDateFilter: null,
  endDateFilter: null,
  isLoadingSales: false,
  isLoadingStats: false,
  isCreatingSale: false,
  isExportingSales: false,
  salesError: null,
  statsError: null,

  // Sales actions
  fetchSales: async (params = {}, force = false) => {
    const state = get();
    const now = Date.now();
    
    if (!force && state.salesLastFetchedAt && (now - state.salesLastFetchedAt) < CACHE_TTL) {
      return;
    }

    set({ isLoadingSales: true, salesError: null });
    
    try {
      const response: ProductSalesResponse = await productSalesService.getAll({
        patientId: state.patientFilter || params.patientId,
        startDate: state.startDateFilter || params.startDate,
        endDate: state.endDateFilter || params.endDate,
        page: params.page || state.currentPage,
        limit: params.limit || state.limit,
      });

      set({
        sales: response.sales,
        currentPage: response.pagination.page,
        totalPages: response.pagination.pages,
        totalSales: response.pagination.total,
        hasMore: response.pagination.page < response.pagination.pages,
        salesLastFetchedAt: now,
        isLoadingSales: false,
      });
    } catch (error) {
      set({
        salesError: error instanceof Error ? error.message : 'Error al cargar ventas',
        isLoadingSales: false,
      });
    }
  },

  fetchSale: async (id: string) => {
    try {
      const sale = await productSalesService.getById(id);
      set({ selectedSale: sale });
      return sale;
    } catch (error) {
      set({
        salesError: error instanceof Error ? error.message : 'Error al cargar venta',
      });
      throw error;
    }
  },

  createSale: async (data: CreateProductSaleData) => {
    set({ isCreatingSale: true, salesError: null });
    
    try {
      const sale = await productSalesService.create(data);
      const state = get();
      
      set({
        sales: [sale, ...state.sales],
        totalSales: state.totalSales + 1,
        isCreatingSale: false,
        // Invalidate cache to refresh data
        salesLastFetchedAt: null,
        statsLastFetchedAt: null,
      });
      
      return sale;
    } catch (error) {
      set({
        salesError: error instanceof Error ? error.message : 'Error al crear venta',
        isCreatingSale: false,
      });
      throw error;
    }
  },

  // Stats actions
  fetchStats: async (params = {}, force = false) => {
    const state = get();
    const now = Date.now();
    
    if (!force && state.statsLastFetchedAt && (now - state.statsLastFetchedAt) < CACHE_TTL) {
      return;
    }

    set({ isLoadingStats: true, statsError: null });
    
    try {
      const stats = await productSalesService.getStats({
        startDate: state.startDateFilter || params.startDate,
        endDate: state.endDateFilter || params.endDate,
      });

      set({
        stats,
        statsLastFetchedAt: now,
        isLoadingStats: false,
      });
    } catch (error) {
      set({
        statsError: error instanceof Error ? error.message : 'Error al cargar estadísticas',
        isLoadingStats: false,
      });
    }
  },

  exportSales: async (params = {}) => {
    set({ isExportingSales: true, salesError: null });
    
    try {
      const state = get();
      const blob = await productSalesService.exportSales({
        startDate: state.startDateFilter || params.startDate,
        endDate: state.endDateFilter || params.endDate,
      });

      // Generate filename with date range
      let filename = 'ventas-productos';
      if (state.startDateFilter || params.startDate) {
        filename += `_desde-${state.startDateFilter || params.startDate}`;
      }
      if (state.endDateFilter || params.endDate) {
        filename += `_hasta-${state.endDateFilter || params.endDate}`;
      }
      filename += '.csv';

      productSalesService.downloadExport(blob, filename);
      
      set({ isExportingSales: false });
    } catch (error) {
      set({
        salesError: error instanceof Error ? error.message : 'Error al exportar ventas',
        isExportingSales: false,
      });
      throw error;
    }
  },

  // Utility actions
  setPatientFilter: (patientId: string | null) => {
    set({ 
      patientFilter: patientId, 
      currentPage: 1,
      salesLastFetchedAt: null, // Invalidate cache
    });
  },

  setDateFilters: (startDate: string | null, endDate: string | null) => {
    set({ 
      startDateFilter: startDate,
      endDateFilter: endDate,
      currentPage: 1,
      salesLastFetchedAt: null, // Invalidate cache
      statsLastFetchedAt: null, // Invalidate stats cache
    });
  },

  setSelectedSale: (sale: ProductSale | null) => {
    set({ selectedSale: sale });
  },

  clearErrors: () => {
    set({
      salesError: null,
      statsError: null,
    });
  },

  resetFilters: () => {
    set({
      patientFilter: null,
      startDateFilter: null,
      endDateFilter: null,
      currentPage: 1,
      salesLastFetchedAt: null,
      statsLastFetchedAt: null,
    });
  },

  nextPage: () => {
    const state = get();
    if (state.hasMore) {
      set({ 
        currentPage: state.currentPage + 1,
        salesLastFetchedAt: null, // Invalidate cache
      });
    }
  },

  previousPage: () => {
    const state = get();
    if (state.currentPage > 1) {
      set({ 
        currentPage: state.currentPage - 1,
        salesLastFetchedAt: null, // Invalidate cache
      });
    }
  },

  goToPage: (page: number) => {
    const state = get();
    if (page >= 1 && page <= state.totalPages) {
      set({ 
        currentPage: page,
        salesLastFetchedAt: null, // Invalidate cache
      });
    }
  },
}));
