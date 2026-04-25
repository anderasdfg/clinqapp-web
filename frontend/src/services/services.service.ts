import api from "@/lib/api/axios-instance";
import type {
  ServiceListResponse,
  ServiceResponse,
  CreateServiceDTO,
  UpdateServiceDTO,
} from "@/types/service.types";

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
  async createService(data: CreateServiceDTO): Promise<ServiceResponse> {
    const response = await api.post("/services", data);
    return response.data;
  },

  // Update service
  async updateService(
    id: string,
    data: UpdateServiceDTO,
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
