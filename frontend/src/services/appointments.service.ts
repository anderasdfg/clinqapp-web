import axios from "axios";
import type {
  Appointment,
  CreateAppointmentDTO,
  UpdateAppointmentDTO,
  UpdateAppointmentStatusDTO,
  AppointmentsListResponse,
  AppointmentResponse,
  DeleteAppointmentResponse,
  AvailabilityResponse,
  AppointmentsQueryParams,
  AvailabilityCheckParams,
} from "@/types/appointment.types";
import { createClient } from "@/lib/supabase/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
  withCredentials: true,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const supabase = createClient();
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const appointmentsService = {
  /**
   * Get list of appointments with optional filters
   */
  async getAppointments(
    params?: AppointmentsQueryParams
  ): Promise<AppointmentsListResponse> {
    const response = await api.get<AppointmentsListResponse>("/appointments", {
      params,
    });
    return response.data;
  },

  /**
   * Get appointment by ID
   */
  async getAppointmentById(id: string): Promise<Appointment> {
    const response = await api.get<AppointmentResponse>(`/appointments/${id}`);
    return response.data.data;
  },

  /**
   * Create new appointment
   */
  async createAppointment(data: CreateAppointmentDTO): Promise<Appointment> {
    const response = await api.post<AppointmentResponse>("/appointments", data);
    return response.data.data;
  },

  /**
   * Update existing appointment
   */
  async updateAppointment(
    id: string,
    data: UpdateAppointmentDTO
  ): Promise<Appointment> {
    const response = await api.put<AppointmentResponse>(
      `/appointments/${id}`,
      data
    );
    return response.data.data;
  },

  /**
   * Update appointment status
   */
  async updateAppointmentStatus(
    id: string,
    data: UpdateAppointmentStatusDTO
  ): Promise<Appointment> {
    const response = await api.patch<AppointmentResponse>(
      `/appointments/${id}/status`,
      data
    );
    return response.data.data;
  },

  /**
   * Delete appointment (soft delete)
   */
  async deleteAppointment(id: string): Promise<void> {
    await api.delete<DeleteAppointmentResponse>(`/appointments/${id}`);
  },

  /**
   * Check availability for a time slot
   */
  async checkAvailability(params: AvailabilityCheckParams): Promise<boolean> {
    const response = await api.get<AvailabilityResponse>(
      "/appointments/availability",
      { params }
    );
    return response.data.available;
  },
};
