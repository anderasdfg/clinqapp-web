import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Package, Receipt, User, Calendar, CreditCard, FileText } from 'lucide-react';

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
}

const SaleDetailModal = ({ sale, isOpen, onClose }: SaleDetailModalProps) => {
    if (!sale) return null;

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
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const paymentMethodLabels: Record<string, string> = {
        CASH: 'Efectivo',
        CARD: 'Tarjeta',
        BANK_TRANSFER: 'Transferencia',
        YAPE: 'Yape',
        PLIN: 'Plin',
        OTHER: 'Otro',
    };

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-center justify-between">
                        <DialogTitle className="text-2xl">Detalle de Venta</DialogTitle>
                        <Badge variant={sale.type === 'SERVICE' ? 'default' : 'secondary'}>
                            {sale.type === 'SERVICE' ? 'Servicio' : 'Producto'}
                        </Badge>
                    </div>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Header Info */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <User className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Paciente</p>
                                <p className="font-medium">{sale.patientName}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <Calendar className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Fecha</p>
                                <p className="font-medium">{formatDate(sale.date)}</p>
                            </div>
                        </div>

                        <div className="flex items-start gap-3">
                            <div className="p-2 rounded-lg bg-primary/10">
                                <CreditCard className="w-5 h-5 text-primary" />
                            </div>
                            <div>
                                <p className="text-sm text-muted-foreground">Método de Pago</p>
                                <p className="font-medium">{paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}</p>
                            </div>
                        </div>

                        {sale.receiptNumber && (
                            <div className="flex items-start gap-3">
                                <div className="p-2 rounded-lg bg-primary/10">
                                    <Receipt className="w-5 h-5 text-primary" />
                                </div>
                                <div>
                                    <p className="text-sm text-muted-foreground">N° Recibo</p>
                                    <p className="font-medium">{sale.receiptNumber}</p>
                                </div>
                            </div>
                        )}
                    </div>

                    <Separator />

                    {/* Items */}
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <Package className="w-5 h-5 text-muted-foreground" />
                            <h3 className="font-semibold">
                                {sale.type === 'SERVICE' ? 'Servicios' : 'Productos'}
                            </h3>
                        </div>

                        <div className="space-y-3">
                            {sale.items.map((item, index) => (
                                <div
                                    key={index}
                                    className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                                >
                                    <div className="flex-1">
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-sm text-muted-foreground">
                                            {item.quantity} {item.unit || 'unidad(es)'} × {formatCurrency(item.unitPrice)}
                                        </p>
                                    </div>
                                    <p className="font-semibold text-primary">
                                        {formatCurrency(item.subtotal)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <Separator />

                    {/* Totals */}
                    <div className="space-y-2">
                        {sale.subtotal !== undefined && sale.subtotal !== sale.amount && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Subtotal:</span>
                                <span className="font-medium">{formatCurrency(sale.subtotal)}</span>
                            </div>
                        )}
                        
                        {sale.discount !== undefined && sale.discount > 0 && (
                            <div className="flex justify-between text-sm">
                                <span className="text-muted-foreground">Descuento:</span>
                                <span className="font-medium text-destructive">
                                    -{formatCurrency(sale.discount)}
                                </span>
                            </div>
                        )}

                        <Separator />

                        <div className="flex justify-between items-center pt-2">
                            <span className="text-lg font-semibold">Total:</span>
                            <span className="text-2xl font-bold text-primary">
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
                                    <FileText className="w-4 h-4 text-muted-foreground" />
                                    <h4 className="font-medium text-sm">Notas</h4>
                                </div>
                                <p className="text-sm text-muted-foreground bg-muted/50 p-3 rounded-lg">
                                    {sale.notes}
                                </p>
                            </div>
                        </>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SaleDetailModal;
