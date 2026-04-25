import api from "@/lib/api/axios-instance";
import { DashboardStatsResponse } from "@/types/dashboard.types";

export const dashboardService = {
  async getStats(): Promise<DashboardStatsResponse> {
    const response = await api.get<DashboardStatsResponse>("/dashboard/stats");
    return response.data;
  },
};
