import { useState } from 'react';
import { createPortal } from 'react-dom';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/Button';
import {
    Package,
    Receipt,
    User,
    Calendar,
    CreditCard,
    FileText,
    X,
    Stethoscope,
    Download,
    ChevronDown,
    UserCircle,
} from 'lucide-react';
import SaleSinglePDF from './SaleSinglePDF';

interface SaleItem {
    name: string;
    quantity: number;
    unitPrice: number;
    subtotal: number;
    unit?: string;
}

interface Sale {
    id: string;
    type: 'SERVICE' | 'PRODUCT';
    date: string;
    patientName: string;
    professionalName?: string;
    description: string;
    items: SaleItem[];
    amount: number;
    subtotal?: number;
    discount?: number;
    paymentMethod: string;
    status: string;
    notes?: string;
    receiptNumber?: string;
}

interface SaleDetailModalProps {
    sale: Sale | null;
    isOpen: boolean;
    onClose: () => void;
    organizationName?: string;
    organizationPhone?: string;
    organizationEmail?: string;
}

const paymentMethodLabels: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    CREDIT_CARD: 'Tarjeta de Crédito',
    DEBIT_CARD: 'Tarjeta de Débito',
    BANK_TRANSFER: 'Transferencia',
    MOBILE_PAYMENT: 'Yape/Plin',
    BANK_DEPOSIT: 'Depósito',
    YAPE: 'Yape',
    PLIN: 'Plin',
    OTHER: 'Otro',
};

const SaleDetailModal = ({
    sale,
    isOpen,
    onClose,
    organizationName = 'Mi Clínica',
    organizationPhone,
    organizationEmail,
}: SaleDetailModalProps) => {
    const [showPDF, setShowPDF] = useState(false);

    if (!sale) return null;
    if (!isOpen) return null;

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('es-PE', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
        });
    };

    const formatTime = (dateString: string) => {
        return new Date(dateString).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const isService = sale.type === 'SERVICE';

    return createPortal(
        <>
            {/* Backdrop */}
            <div
                className="fixed inset-0 bg-black/50 z-40"
                onClick={onClose}
            />

            {/* Panel — bottom sheet on mobile, right side-panel on md+ */}
            <div className="fixed z-50
                bottom-0 left-0 right-0 max-h-[92dvh] rounded-t-2xl
                md:inset-y-0 md:right-0 md:left-auto md:w-[620px] md:max-h-full md:rounded-none md:rounded-l-2xl
                shadow-2xl flex flex-col overflow-hidden
                animate-drawer-up md:animate-drawer-right"
                style={{ backgroundColor: 'var(--drawer-bg, white)' }}
            >
                {/* Solid white bg via inline style for dark mode compat */}
                <div className="flex flex-col h-full bg-white dark:bg-zinc-900">

                    {/* Handle bar (mobile only) */}
                    <div className="flex justify-center pt-3 pb-1 md:hidden">
                        <div className="w-10 h-1 rounded-full bg-gray-300 dark:bg-zinc-600" />
                    </div>

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 dark:border-zinc-800">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl ${isService ? 'bg-purple-100 dark:bg-purple-900/40' : 'bg-cyan-100 dark:bg-cyan-900/40'}`}>
                                {isService
                                    ? <Stethoscope className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                                    : <Package className="w-5 h-5 text-cyan-600 dark:text-cyan-400" />
                                }
                            </div>
                            <div>
                                <h2 className="text-lg font-bold text-gray-900 dark:text-gray-100">Detalle de Venta</h2>
                                <Badge
                                    variant={isService ? 'default' : 'secondary'}
                                    className="text-xs mt-0.5"
                                >
                                    {isService ? 'Servicio' : 'Producto'}
                                </Badge>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-zinc-800 transition-colors"
                        >
                            <X className="w-5 h-5 text-gray-500 dark:text-gray-400 hidden md:block" />
                            <ChevronDown className="w-5 h-5 text-gray-500 dark:text-gray-400 md:hidden" />
                        </button>
                    </div>

                    {/* Scrollable content */}
                    <div className="flex-1 overflow-y-auto">
                        <div className="p-5 space-y-5">

                            {/* Info Cards */}
                            <div className="grid grid-cols-2 gap-3">
                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
                                    <div className="p-1.5 rounded-lg bg-purple-100 dark:bg-purple-900/40 shrink-0">
                                        <User className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Paciente</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                                            {sale.patientName}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
                                    <div className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/40 shrink-0">
                                        <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Fecha</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                            {formatDate(sale.date)}
                                        </p>
                                        <p className="text-xs text-gray-500 dark:text-gray-400">
                                            {formatTime(sale.date)}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
                                    <div className="p-1.5 rounded-lg bg-emerald-100 dark:bg-emerald-900/40 shrink-0">
                                        <CreditCard className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div className="min-w-0">
                                        <p className="text-xs text-gray-500 dark:text-gray-400">Método de Pago</p>
                                        <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                                            {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                                        </p>
                                    </div>
                                </div>

                                {sale.professionalName && (
                                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
                                        <div className="p-1.5 rounded-lg bg-orange-100 dark:bg-orange-900/40 shrink-0">
                                            <UserCircle className="w-4 h-4 text-orange-600 dark:text-orange-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">Profesional</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100 break-words">
                                                {sale.professionalName}
                                            </p>
                                        </div>
                                    </div>
                                )}

                                {sale.receiptNumber && (
                                    <div className="flex items-start gap-2.5 p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
                                        <div className="p-1.5 rounded-lg bg-gray-200 dark:bg-zinc-700 shrink-0">
                                            <Receipt className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                                        </div>
                                        <div className="min-w-0">
                                            <p className="text-xs text-gray-500 dark:text-gray-400">N° Recibo</p>
                                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                                                {sale.receiptNumber}
                                            </p>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <Separator />

                            {/* Items */}
                            <div>
                                <div className="flex items-center gap-2 mb-3">
                                    {isService
                                        ? <Stethoscope className="w-4 h-4 text-gray-400" />
                                        : <Package className="w-4 h-4 text-gray-400" />
                                    }
                                    <h3 className="font-semibold text-gray-900 dark:text-gray-100">
                                        {isService ? 'Servicios' : 'Productos'}
                                    </h3>
                                </div>

                                <div className="space-y-2">
                                    {sale.items && sale.items.length > 0 ? (
                                        sale.items.map((item, index) => (
                                            <div
                                                key={index}
                                                className="flex items-center justify-between p-3 rounded-xl bg-gray-50 dark:bg-zinc-800"
                                            >
                                                <div className="flex-1 min-w-0 mr-3">
                                                    <p className="font-medium text-sm text-gray-900 dark:text-gray-100 truncate">
                                                        {item.name}
                                                    </p>
                                                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">
                                                        {item.quantity} {item.unit || 'unidad(es)'} × {formatCurrency(item.unitPrice)}
                                                    </p>
                                                </div>
                                                <p className="font-bold text-sm text-emerald-600 dark:text-emerald-400 shrink-0">
                                                    {formatCurrency(item.subtotal)}
                                                </p>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="p-3 rounded-xl bg-gray-50 dark:bg-zinc-800">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">{sale.description}</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <Separator />

                            {/* Totals */}
                            <div className="space-y-2">
                                {sale.subtotal !== undefined && sale.subtotal !== sale.amount && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Subtotal:</span>
                                        <span className="font-medium text-gray-900 dark:text-gray-100">
                                            {formatCurrency(sale.subtotal)}
                                        </span>
                                    </div>
                                )}
                                {sale.discount !== undefined && sale.discount > 0 && (
                                    <div className="flex justify-between text-sm">
                                        <span className="text-gray-500 dark:text-gray-400">Descuento:</span>
                                        <span className="font-medium text-red-500">
                                            -{formatCurrency(sale.discount)}
                                        </span>
                                    </div>
                                )}
                                <div className="flex justify-between items-center p-4 rounded-xl bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800">
                                    <span className="text-base font-bold text-gray-900 dark:text-gray-100">Total</span>
                                    <span className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                                        {formatCurrency(sale.amount)}
                                    </span>
                                </div>
                            </div>

                            {/* Notes */}
                            {sale.notes && (
                                <>
                                    <Separator />
                                    <div>
                                        <div className="flex items-center gap-2 mb-2">
                                            <FileText className="w-4 h-4 text-gray-400" />
                                            <h4 className="font-medium text-sm text-gray-900 dark:text-gray-100">Notas</h4>
                                        </div>
                                        <p className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-zinc-800 p-3 rounded-xl">
                                            {sale.notes}
                                        </p>
                                    </div>
                                </>
                            )}

                            {/* Safe area bottom padding */}
                            <div className="h-2" />
                        </div>
                    </div>

                    {/* Footer CTA */}
                    <div className="px-5 py-4 border-t border-gray-200 dark:border-zinc-800 bg-white dark:bg-zinc-900"
                        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
                    >
                        <Button
                            onClick={() => setShowPDF(true)}
                            className="w-full gap-2 bg-emerald-600 hover:bg-emerald-700 h-12 text-base"
                        >
                            <Download className="w-5 h-5" />
                            Imprimir / Descargar Comprobante
                        </Button>
                    </div>
                </div>
            </div>

            {/* PDF Preview Modal */}
            {showPDF && (
                <SaleSinglePDF
                    sale={sale}
                    organizationName={organizationName}
                    organizationPhone={organizationPhone}
                    organizationEmail={organizationEmail}
                    onClose={() => setShowPDF(false)}
                />
            )}
        </>,
        document.body
    );
};

export default SaleDetailModal;
