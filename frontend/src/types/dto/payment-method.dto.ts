import { PaymentMethodType } from "../payment-method.types";

export interface CreatePaymentMethodDTO {
  type: PaymentMethodType;
  isActive?: boolean;
  otherName?: string;
}

export interface UpdatePaymentMethodDTO {
  type?: PaymentMethodType;
  isActive?: boolean;
  otherName?: string;
}
