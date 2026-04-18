import axios from "axios";
import { supabase } from "../lib/supabase/client";
import { SalesListResponse, SalesFilters } from "../types/sales.types";
import { AppConfig } from "../lib/config/app.config";


// Create axios instance
const api = axios.create({
  baseURL: AppConfig.apiUrl,
});

// Add auth interceptor
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const salesService = {
  /**
   * Get sales list with filters
   */
  async getSales(filters?: SalesFilters): Promise<SalesListResponse> {
    const response = await api.get("/sales", { params: filters });
    return response.data;
  },

  /**
   * Export sales to CSV
   */
  async exportSales(
    filters?: Omit<SalesFilters, "page" | "limit" | "search">,
  ): Promise<Blob> {
    const response = await api.get("/sales/export", {
      params: filters,
      responseType: "blob",
    });
    return response.data;
  },
};
