import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import * as Dialog from '@radix-ui/react-dialog';
import { usePaymentMethodsStore } from '../../stores/usePaymentMethodsStore';
import { PaymentMethodType, PAYMENT_METHOD_LABELS } from '../../types/payment-method.types';

const paymentMethodSchema = z.object({
  type: z.enum([
    'CASH',
    'CREDIT_CARD',
    'DEBIT_CARD',
    'BANK_TRANSFER',
    'MOBILE_PAYMENT',
    'BANK_DEPOSIT',
    'OTHER',
  ] as const),
  isActive: z.boolean(),
  otherName: z.string().optional(),
}).refine((data) => {
  if (data.type === 'OTHER' && !data.otherName) {
    return false;
  }
  return true;
}, {
  message: "El nombre es requerido para tipo 'Otro'",
  path: ['otherName'],
});

type PaymentMethodFormData = z.infer<typeof paymentMethodSchema>;

interface PaymentMethodFormDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  paymentMethodId?: string;
  onSuccess?: () => void;
}

const PaymentMethodFormDrawer = ({
  isOpen,
  onClose,
  paymentMethodId,
  onSuccess,
}: PaymentMethodFormDrawerProps) => {
  const { paymentMethods, isCreating, isUpdating, createPaymentMethod, updatePaymentMethod } =
    usePaymentMethodsStore();
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    watch,
  } = useForm<PaymentMethodFormData>({
    resolver: zodResolver(paymentMethodSchema),
    defaultValues: {
      type: 'CASH',
      isActive: true,
      otherName: '',
    },
  });

  const selectedType = watch('type');
  const isEditMode = !!paymentMethodId;

  useEffect(() => {
    if (isOpen && paymentMethodId) {
      setIsLoading(true);
      const paymentMethod = paymentMethods.find((pm) => pm.id === paymentMethodId);
      if (paymentMethod) {
        reset({
          type: paymentMethod.type,
          isActive: paymentMethod.isActive,
          otherName: paymentMethod.otherName || '',
        });
      }
      setIsLoading(false);
    } else if (isOpen && !paymentMethodId) {
      reset({
        type: 'CASH',
        isActive: true,
        otherName: '',
      });
    }
  }, [isOpen, paymentMethodId, paymentMethods, reset]);

  const onSubmit = async (data: PaymentMethodFormData) => {
    try {
      if (isEditMode && paymentMethodId) {
        await updatePaymentMethod(paymentMethodId, data);
      } else {
        await createPaymentMethod(data);
      }
      onSuccess?.();
      onClose();
    } catch (error) {
      console.error('Error saving payment method:', error);
    }
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <Dialog.Root open={isOpen} onOpenChange={handleClose}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 animate-fade-in" />
        <Dialog.Content className="fixed right-0 top-0 h-full w-full sm:w-[500px] bg-[rgb(var(--bg-primary))] shadow-2xl z-50 flex flex-col animate-slide-in-right">
          {/* Header */}
          <div className="flex items-center justify-between p-6 border-b border-[rgb(var(--border-primary))]">
            <Dialog.Title className="text-xl font-semibold text-[rgb(var(--text-primary))]">
              {isEditMode ? 'Editar Método de Pago' : 'Nuevo Método de Pago'}
            </Dialog.Title>
            <Dialog.Close asChild>
              <button
                className="text-[rgb(var(--text-tertiary))] hover:text-[rgb(var(--text-primary))] transition-colors"
                aria-label="Cerrar"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </button>
            </Dialog.Close>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="flex-1 flex flex-col overflow-hidden">
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {isLoading ? (
                <div className="flex items-center justify-center py-12">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </div>
              ) : (
                <>
                  {/* Payment Method Type */}
                  <div>
                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                      Tipo de Método de Pago *
                    </label>
                    <select
                      {...register('type')}
                      className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--border-focus))] bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))]"
                    >
                      {(Object.keys(PAYMENT_METHOD_LABELS) as PaymentMethodType[]).map((type) => (
                        <option key={type} value={type}>
                          {PAYMENT_METHOD_LABELS[type]}
                        </option>
                      ))}
                    </select>
                    {errors.type && (
                      <p className="mt-1 text-sm text-error">{errors.type.message}</p>
                    )}
                  </div>

                  {/* Other Name (conditional) */}
                  {selectedType === 'OTHER' && (
                    <div>
                      <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                        Nombre del Método de Pago *
                      </label>
                      <input
                        type="text"
                        {...register('otherName')}
                        placeholder="Ej: Transferencia Yape, Pago en cuotas, etc."
                        className="w-full px-4 py-2 border border-[rgb(var(--border-primary))] rounded-lg focus:outline-none focus:ring-2 focus:ring-[rgb(var(--border-focus))] bg-[rgb(var(--bg-primary))] text-[rgb(var(--text-primary))]"
                      />
                      {errors.otherName && (
                        <p className="mt-1 text-sm text-error">{errors.otherName.message}</p>
                      )}
                    </div>
                  )}

                  {/* Active Status */}
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      id="isActive"
                      {...register('isActive')}
                      className="w-4 h-4 text-primary border-[rgb(var(--border-primary))] rounded focus:ring-2 focus:ring-[rgb(var(--border-focus))]"
                    />
                    <label
                      htmlFor="isActive"
                      className="text-sm font-medium text-[rgb(var(--text-primary))]"
                    >
                      Método de pago activo
                    </label>
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 p-6 border-t border-[rgb(var(--border-primary))]">
              <button
                type="button"
                onClick={handleClose}
                className="px-4 py-2 text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))] transition-colors"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={isCreating || isUpdating}
                className="px-6 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {(isCreating || isUpdating) && (
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                )}
                {isEditMode ? 'Actualizar' : 'Crear'}
              </button>
            </div>
          </form>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default PaymentMethodFormDrawer;
