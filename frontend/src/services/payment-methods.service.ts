import axios from "axios";
import {
  CreatePaymentMethodDTO,
  UpdatePaymentMethodDTO,
} from "../types/dto/payment-method.dto";
import { PaymentMethod } from "../types/payment-method.types";
import { supabase } from "../lib/supabase/client";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3001/api";

// Create axios instance with interceptors
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to requests
api.interceptors.request.use(async (config) => {
  const {
    data: { session },
  } = await supabase.auth.getSession();
  if (session?.access_token) {
    config.headers.Authorization = `Bearer ${session.access_token}`;
  }
  return config;
});

export const paymentMethodsService = {
  /**
   * Get all payment methods for the organization
   */
  getPaymentMethods: async (): Promise<PaymentMethod[]> => {
    const response = await api.get("/payment-methods");
    return response.data;
  },

  /**
   * Create a new payment method
   */
  createPaymentMethod: async (
    data: CreatePaymentMethodDTO,
  ): Promise<PaymentMethod> => {
    const response = await api.post("/payment-methods", data);
    return response.data;
  },

  /**
   * Update an existing payment method
   */
  updatePaymentMethod: async (
    id: string,
    data: UpdatePaymentMethodDTO,
  ): Promise<PaymentMethod> => {
    const response = await api.put(`/payment-methods/${id}`, data);
    return response.data;
  },

  /**
   * Delete a payment method
   */
  deletePaymentMethod: async (id: string): Promise<void> => {
    await api.delete(`/payment-methods/${id}`);
  },
};
