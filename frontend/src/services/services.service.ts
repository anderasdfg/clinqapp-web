import axios from "axios";
import { supabase } from "@/lib/supabase/client";
import type {
  ServiceListResponse,
  ServiceResponse,
  ServiceFormData,
} from "@/types/service.types";

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

export const servicesService = {
  // Get all services
  async getServices(params?: {
    page?: number;
    limit?: number;
    search?: string;
    isActive?: boolean;
  }): Promise<ServiceListResponse> {
    const response = await api.get("/services", { params });
    return response.data;
  },

  // Get service by ID
  async getServiceById(id: string): Promise<ServiceResponse> {
    const response = await api.get(`/services/${id}`);
    return response.data;
  },

  // Create service
  async createService(data: ServiceFormData): Promise<ServiceResponse> {
    const response = await api.post("/services", data);
    return response.data;
  },

  // Update service
  async updateService(
    id: string,
    data: Partial<ServiceFormData>,
  ): Promise<ServiceResponse> {
    const response = await api.put(`/services/${id}`, data);
    return response.data;
  },

  // Delete service (soft delete)
  async deleteService(
    id: string,
  ): Promise<{ success: boolean; message: string }> {
    const response = await api.delete(`/services/${id}`);
    return response.data;
  },
};
