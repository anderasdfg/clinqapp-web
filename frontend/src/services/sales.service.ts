import api from "@/lib/api/axios-instance";
import { SalesListResponse, SalesFilters } from "../types/sales.types";

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
