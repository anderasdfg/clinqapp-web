import { useEffect, useState } from 'react';
import { usePaymentMethodsStore } from '../../stores/usePaymentMethodsStore';
import { PAYMENT_METHOD_LABELS, PAYMENT_METHOD_ICONS } from '../../types/payment-method.types';
import PaymentMethodFormDrawer from '../../components/payment-methods/PaymentMethodFormDrawer';

const PaymentMethodsPage = () => {
    const {
        paymentMethods,
        isLoading,
        isDeleting,
        fetchPaymentMethods,
        deletePaymentMethod,
    } = usePaymentMethodsStore();

    const [editingPaymentMethodId, setEditingPaymentMethodId] = useState<string | null>(null);
    const [isCreating, setIsCreating] = useState(false);

    useEffect(() => {
        fetchPaymentMethods();
    }, [fetchPaymentMethods]);

    const handleDelete = async (id: string, name: string) => {
        if (window.confirm(`¿Estás seguro de eliminar el método de pago "${name}"?`)) {
            try {
                await deletePaymentMethod(id);
            } catch (error) {
                console.error('Error deleting payment method:', error);
            }
        }
    };

    const handleCloseDrawer = () => {
        setEditingPaymentMethodId(null);
        setIsCreating(false);
    };

    return (
        <div className="animate-fade-in">
            {/* Header */}
            <div className="mb-6 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
                        Métodos de Pago
                    </h1>
                    <p className="text-[rgb(var(--text-secondary))]">
                        Gestiona los métodos de pago aceptados en tu clínica
                    </p>
                </div>
                <button
                    onClick={() => setIsCreating(true)}
                    className="px-4 py-2 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity flex items-center gap-2"
                >
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                    </svg>
                    Nuevo Método de Pago
                </button>
            </div>

            {/* Loading State */}
            {isLoading ? (
                <div className="flex items-center justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                </div>
            ) : paymentMethods.length === 0 ? (
                /* Empty State */
                <div className="card p-12">
                    <div className="text-center">
                        <div className="mx-auto w-24 h-24 mb-6 rounded-full bg-gradient-primary flex items-center justify-center">
                            <svg 
                                className="w-12 h-12 text-white" 
                                fill="none" 
                                viewBox="0 0 24 24" 
                                stroke="currentColor"
                            >
                                <path 
                                    strokeLinecap="round" 
                                    strokeLinejoin="round" 
                                    strokeWidth={2} 
                                    d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" 
                                />
                            </svg>
                        </div>
                        <h2 className="text-2xl font-bold text-[rgb(var(--text-primary))] mb-3">
                            No hay métodos de pago registrados
                        </h2>
                        <p className="text-[rgb(var(--text-secondary))] max-w-md mx-auto mb-6">
                            Comienza agregando los métodos de pago que acepta tu clínica
                        </p>
                        <button
                            onClick={() => setIsCreating(true)}
                            className="px-6 py-3 bg-gradient-primary text-white rounded-lg hover:opacity-90 transition-opacity"
                        >
                            Agregar Primer Método de Pago
                        </button>
                    </div>
                </div>
            ) : (
                /* Payment Methods Table */
                <div className="card overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-[rgb(var(--bg-secondary))]">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Método de Pago
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Estado
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-[rgb(var(--text-secondary))] uppercase tracking-wider">
                                        Acciones
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-[rgb(var(--border-primary))]">
                                {paymentMethods.map((paymentMethod) => (
                                    <tr
                                        key={paymentMethod.id}
                                        className="hover:bg-[rgb(var(--bg-secondary))] transition-colors"
                                    >
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center gap-3">
                                                <span className="text-2xl">
                                                    {PAYMENT_METHOD_ICONS[paymentMethod.type]}
                                                </span>
                                                <div>
                                                    <div className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                                        {paymentMethod.type === 'OTHER' && paymentMethod.otherName
                                                            ? paymentMethod.otherName
                                                            : PAYMENT_METHOD_LABELS[paymentMethod.type]}
                                                    </div>
                                                    {paymentMethod.type === 'OTHER' && paymentMethod.otherName && (
                                                        <div className="text-xs text-[rgb(var(--text-tertiary))]">
                                                            {PAYMENT_METHOD_LABELS[paymentMethod.type]}
                                                        </div>
                                                    )}
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span
                                                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                                    paymentMethod.isActive
                                                        ? 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400'
                                                        : 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400'
                                                }`}
                                            >
                                                {paymentMethod.isActive ? 'Activo' : 'Inactivo'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end gap-2">
                                                <button
                                                    onClick={() => setEditingPaymentMethodId(paymentMethod.id)}
                                                    className="text-primary hover:text-primary-hover"
                                                    title="Editar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                    </svg>
                                                </button>
                                                <button
                                                    onClick={() =>
                                                        handleDelete(
                                                            paymentMethod.id,
                                                            paymentMethod.type === 'OTHER' && paymentMethod.otherName
                                                                ? paymentMethod.otherName
                                                                : PAYMENT_METHOD_LABELS[paymentMethod.type]
                                                        )
                                                    }
                                                    disabled={isDeleting}
                                                    className="text-error hover:text-red-700 disabled:opacity-50"
                                                    title="Eliminar"
                                                >
                                                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* Form Drawer */}
            <PaymentMethodFormDrawer
                isOpen={isCreating || editingPaymentMethodId !== null}
                onClose={handleCloseDrawer}
                paymentMethodId={editingPaymentMethodId || undefined}
                onSuccess={() => fetchPaymentMethods()}
            />
        </div>
    );
};

export default PaymentMethodsPage;
