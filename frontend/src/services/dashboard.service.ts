import axios from "axios";
import { DashboardStatsResponse } from "@/types/dashboard.types";
import { supabase } from "@/lib/supabase/client";
import { AppConfig } from "@/lib/config/app.config";


const api = axios.create({
  baseURL: AppConfig.apiUrl,
});

api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const dashboardService = {
  async getStats(): Promise<DashboardStatsResponse> {
    const response = await api.get<DashboardStatsResponse>("/dashboard/stats");
    return response.data;
  },
};
