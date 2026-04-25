import api from "@/lib/api/axios-instance";
import {
  CreatePaymentMethodDTO,
  UpdatePaymentMethodDTO,
} from "../types/dto/payment-method.dto";
import { PaymentMethod } from "../types/payment-method.types";

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
