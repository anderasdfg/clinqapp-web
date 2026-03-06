import { create } from "zustand";
import { paymentMethodsService } from "../services/payment-methods.service";
import { PaymentMethod } from "../types/payment-method.types";
import {
  CreatePaymentMethodDTO,
  UpdatePaymentMethodDTO,
} from "../types/dto/payment-method.dto";

interface PaymentMethodsState {
  paymentMethods: PaymentMethod[];
  isLoading: boolean;
  isCreating: boolean;
  isUpdating: boolean;
  isDeleting: boolean;
  error: string | null;

  // Actions
  fetchPaymentMethods: () => Promise<void>;
  createPaymentMethod: (data: CreatePaymentMethodDTO) => Promise<void>;
  updatePaymentMethod: (
    id: string,
    data: UpdatePaymentMethodDTO,
  ) => Promise<void>;
  deletePaymentMethod: (id: string) => Promise<void>;
  clearError: () => void;
}

export const usePaymentMethodsStore = create<PaymentMethodsState>(
  (set, get) => ({
    paymentMethods: [],
    isLoading: false,
    isCreating: false,
    isUpdating: false,
    isDeleting: false,
    error: null,

    fetchPaymentMethods: async () => {
      set({ isLoading: true, error: null });
      try {
        const paymentMethods = await paymentMethodsService.getPaymentMethods();
        set({ paymentMethods, isLoading: false });
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Error al cargar métodos de pago",
          isLoading: false,
        });
      }
    },

    createPaymentMethod: async (data: CreatePaymentMethodDTO) => {
      set({ isCreating: true, error: null });
      try {
        await paymentMethodsService.createPaymentMethod(data);
        set({ isCreating: false });
        // Refresh the list
        await get().fetchPaymentMethods();
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Error al crear método de pago",
          isCreating: false,
        });
        throw error;
      }
    },

    updatePaymentMethod: async (id: string, data: UpdatePaymentMethodDTO) => {
      set({ isUpdating: true, error: null });
      try {
        await paymentMethodsService.updatePaymentMethod(id, data);
        set({ isUpdating: false });
        // Refresh the list
        await get().fetchPaymentMethods();
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Error al actualizar método de pago",
          isUpdating: false,
        });
        throw error;
      }
    },

    deletePaymentMethod: async (id: string) => {
      set({ isDeleting: true, error: null });
      try {
        await paymentMethodsService.deletePaymentMethod(id);
        set({ isDeleting: false });
        // Refresh the list
        await get().fetchPaymentMethods();
      } catch (error) {
        set({
          error:
            error instanceof Error
              ? error.message
              : "Error al eliminar método de pago",
          isDeleting: false,
        });
        throw error;
      }
    },

    clearError: () => set({ error: null }),
  }),
);
