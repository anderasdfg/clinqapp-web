// Payment Method Types
export type PaymentMethodType =
  | "CASH"
  | "CREDIT_CARD"
  | "DEBIT_CARD"
  | "BANK_TRANSFER"
  | "MOBILE_PAYMENT"
  | "BANK_DEPOSIT"
  | "OTHER";

// Labels for payment method types
export const PAYMENT_METHOD_LABELS: Record<PaymentMethodType, string> = {
  CASH: "Efectivo",
  CREDIT_CARD: "Tarjeta de Crédito",
  DEBIT_CARD: "Tarjeta de Débito",
  BANK_TRANSFER: "Transferencia Bancaria",
  MOBILE_PAYMENT: "Pago Móvil (Yape/Plin)",
  BANK_DEPOSIT: "Depósito Bancario",
  OTHER: "Otro",
};

// Icons for payment method types
export const PAYMENT_METHOD_ICONS: Record<PaymentMethodType, string> = {
  CASH: "💵",
  CREDIT_CARD: "💳",
  DEBIT_CARD: "💳",
  BANK_TRANSFER: "🏦",
  MOBILE_PAYMENT: "📱",
  BANK_DEPOSIT: "🏦",
  OTHER: "💰",
};

// Payment Method Interface
export interface PaymentMethod {
  id: string;
  type: PaymentMethodType;
  isActive: boolean;
  otherName?: string | null;
  createdAt: string;
  organizationId: string;
}
