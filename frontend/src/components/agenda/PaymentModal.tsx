import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { supabase } from '@/lib/supabase/client';
import { PaymentMethod, PAYMENT_METHOD_LABELS, PAYMENT_METHOD } from '@/types/appointment.types';
import type { Appointment } from '@/types/appointment.types';
import ProductSelector, { SelectedProduct } from './ProductSelector';
import { toast } from 'sonner';

interface PaymentModalProps {
    appointment: Appointment;
    isOpen: boolean;
    onClose: () => void;
    onPaymentRegistered: () => void;
}

interface PaymentFormData {
    amount: number;
    method: PaymentMethod;
    receiptNumber?: string;
    notes?: string;
}

const PaymentModal = ({ appointment, isOpen, onClose, onPaymentRegistered }: PaymentModalProps) => {
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [selectedProducts, setSelectedProducts] = useState<SelectedProduct[]>([]);
    
    const totalAmount = appointment.services?.reduce((sum, s) => sum + Number(s.price), 0) || 0;

    const {
        register,
        handleSubmit,
        formState: { errors },
        reset,
    } = useForm<PaymentFormData>({
        defaultValues: {
            amount: totalAmount,
            method: PAYMENT_METHOD.CASH,
        },
    });

    const onSubmit = async (data: PaymentFormData) => {
        setIsSubmitting(true);
        try {
            const { data: { session } } = await supabase.auth.getSession();

            if (!session?.access_token) {
                throw new Error('No autenticado');
            }

            // Prepare payment data with optional products
            const paymentData: any = {
                amount: Number(data.amount),
                method: data.method,
                receiptNumber: data.receiptNumber,
                notes: data.notes,
            };

            // Add products if any selected
            if (selectedProducts.length > 0) {
                paymentData.products = selectedProducts.map(p => ({
                    productId: p.productId,
                    quantity: p.quantity,
                    unitPrice: p.unitPrice,
                }));
            }

            // Register payment
            const response = await fetch(`${import.meta.env.VITE_API_URL}/appointments/${appointment.id}/payment`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`,
                },
                body: JSON.stringify(paymentData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Error al registrar pago');
            }

            const successMessage = selectedProducts.length > 0
                ? `Pago registrado exitosamente con ${selectedProducts.length} producto(s)`
                : 'Pago registrado exitosamente';
            toast.success(successMessage);

            reset();
            setSelectedProducts([]);
            onPaymentRegistered();
            onClose();
        } catch (error) {
            console.error('Error registering payment:', error);
            toast.error(error instanceof Error ? error.message : 'Error al registrar el pago');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto">
            <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
                <div className="fixed inset-0 transition-opacity bg-black/50" onClick={onClose}></div>

                <div className="inline-block align-bottom bg-[rgb(var(--bg-card))] rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-md sm:w-full">
                    <form onSubmit={handleSubmit(onSubmit)}>
                        <div className="px-6 pt-5 pb-4">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                                    Registrar Pago
                                </h3>
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="text-[rgb(var(--text-secondary))] hover:text-[rgb(var(--text-primary))]"
                                >
                                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                    </svg>
                                </button>
                            </div>

                            <div className="space-y-4">
                                <div className="p-3 bg-[rgb(var(--bg-secondary))] rounded-lg">
                                    <p className="text-sm text-[rgb(var(--text-secondary))]">Paciente</p>
                                    <p className="font-medium text-[rgb(var(--text-primary))]">
                                        {appointment.patient?.firstName} {appointment.patient?.lastName}
                                    </p>
                                    {appointment.services && appointment.services.length > 0 && (
                                        <div className="text-sm text-[rgb(var(--text-secondary))] mt-1">
                                            {appointment.services.map((s) => (
                                                <p key={s.id}>{s.service.name}</p>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Monto (S/) <span className="text-error">*</span>
                                    </label>
                                    <input
                                        type="number"
                                        step="0.01"
                                        min="0"
                                        {...register('amount', {
                                            required: 'El monto es requerido',
                                            min: { value: 0, message: 'El monto no puede ser negativo' },
                                        })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                        placeholder="0.00"
                                    />
                                    <p className="mt-1 text-xs text-[rgb(var(--text-secondary))]">
                                        Puedes ingresar 0 para sesiones ya pagadas o tratamientos gratis
                                    </p>
                                    {errors.amount && (
                                        <p className="mt-1 text-sm text-error">{errors.amount.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Método de Pago <span className="text-error">*</span>
                                    </label>
                                    <select
                                        {...register('method', { required: 'Selecciona un método de pago' })}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                    >
                                        {Object.entries(PAYMENT_METHOD_LABELS).map(([key, label]) => (
                                            <option key={key} value={key}>
                                                {label}
                                            </option>
                                        ))}
                                    </select>
                                    {errors.method && (
                                        <p className="mt-1 text-sm text-error">{errors.method.message}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Número de Recibo (Opcional)
                                    </label>
                                    <input
                                        type="text"
                                        {...register('receiptNumber')}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                        placeholder="Ej: REC-001"
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-[rgb(var(--text-primary))] mb-2">
                                        Notas (Opcional)
                                    </label>
                                    <textarea
                                        {...register('notes')}
                                        rows={3}
                                        className="w-full px-4 py-2.5 rounded-lg border border-[rgb(var(--border-primary))] bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] focus:outline-none focus:ring-2 focus:ring-primary transition-all duration-200"
                                        placeholder="Notas adicionales sobre el pago..."
                                    />
                                </div>

                                <div className="pt-4 border-t border-[rgb(var(--border-primary))]">
                                    <ProductSelector
                                        selectedProducts={selectedProducts}
                                        onProductsChange={setSelectedProducts}
                                    />
                                </div>

                                {selectedProducts.length > 0 && (
                                    <div className="p-4 bg-[rgb(var(--bg-secondary))] rounded-lg">
                                        <div className="space-y-2">
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[rgb(var(--text-secondary))]">Servicios:</span>
                                                <span className="font-medium text-[rgb(var(--text-primary))]">S/ {totalAmount.toFixed(2)}</span>
                                            </div>
                                            <div className="flex justify-between text-sm">
                                                <span className="text-[rgb(var(--text-secondary))]">Productos:</span>
                                                <span className="font-medium text-[rgb(var(--text-primary))]">S/ {selectedProducts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0).toFixed(2)}</span>
                                            </div>
                                            <div className="pt-2 border-t border-[rgb(var(--border-primary))] flex justify-between">
                                                <span className="font-semibold text-[rgb(var(--text-primary))]">Total General:</span>
                                                <span className="text-lg font-bold text-primary">
                                                    S/ {(totalAmount + selectedProducts.reduce((sum, p) => sum + p.quantity * p.unitPrice, 0)).toFixed(2)}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="px-6 py-3 bg-[rgb(var(--bg-secondary))] sm:px-6 sm:flex sm:flex-row-reverse gap-3">
                            <button
                                type="submit"
                                disabled={isSubmitting}
                                style={{
                                    background: 'linear-gradient(135deg, rgb(var(--color-primary)) 0%, rgb(var(--color-accent)) 100%)'
                                }}
                                className="w-full inline-flex justify-center items-center gap-2 rounded-lg shadow-sm px-4 py-2 text-white hover:opacity-90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:ml-3 sm:w-auto sm:text-sm font-medium transition-opacity duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {isSubmitting && (
                                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                )}
                                Registrar Pago
                            </button>
                            <button
                                type="button"
                                onClick={onClose}
                                disabled={isSubmitting}
                                className="mt-3 w-full inline-flex justify-center rounded-lg border border-[rgb(var(--border-primary))] shadow-sm px-4 py-2 bg-[rgb(var(--bg-card))] text-[rgb(var(--text-primary))] hover:bg-[rgb(var(--bg-secondary))] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary sm:mt-0 sm:w-auto sm:text-sm font-medium transition-colors duration-200"
                            >
                                Cancelar
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default PaymentModal;
