import axios from "axios";
import { supabase } from "../lib/supabase/client";
import { SalesListResponse, SalesFilters } from "../types/sales.types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
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
