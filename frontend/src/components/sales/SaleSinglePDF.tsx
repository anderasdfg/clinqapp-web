import { useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Download, X } from 'lucide-react';
import { pdfGeneratorService } from '@/services/pdf-generator.service';
import { toast } from 'sonner';

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

interface SaleSinglePDFProps {
    sale: Sale;
    organizationName: string;
    organizationPhone?: string;
    organizationEmail?: string;
    onClose: () => void;
}

const paymentMethodLabels: Record<string, string> = {
    CASH: 'Efectivo',
    CARD: 'Tarjeta',
    CREDIT_CARD: 'Tarjeta de Crédito',
    DEBIT_CARD: 'Tarjeta de Débito',
    BANK_TRANSFER: 'Transferencia Bancaria',
    MOBILE_PAYMENT: 'Yape/Plin',
    BANK_DEPOSIT: 'Depósito Bancario',
    YAPE: 'Yape',
    PLIN: 'Plin',
    OTHER: 'Otro',
};

// ─── Receipt content as a pure render function ───────────────────────────────
// Same JSX used for both the visible preview and the hidden capture target.
// Keeping it as a function avoids duplication.
function ReceiptContent({
    sale,
    organizationName,
    organizationPhone,
    organizationEmail,
    formatCurrency,
    formatDate,
    formatTime,
}: {
    sale: Sale;
    organizationName: string;
    organizationPhone?: string;
    organizationEmail?: string;
    formatCurrency: (n: number) => string;
    formatDate: (s: string) => string;
    formatTime: (s: string) => string;
}) {
    const receiptNumber = sale.receiptNumber || sale.id.slice(0, 8).toUpperCase();
    const isService = sale.type === 'SERVICE';

    return (
        <>
            {/* ── HEADER ──────────────────────────────────────────── */}
            <div style={{ borderBottom: '2px solid #e5e7eb', paddingBottom: '10px', marginBottom: '10px', textAlign: 'center' }}>
                <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '6px' }}>
                    <div style={{ width: '36px', height: '36px', background: '#d1fae5', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="20 6 9 17 4 12" />
                        </svg>
                    </div>
                </div>
                <p style={{ fontSize: '16px', fontWeight: '700', color: '#111827', margin: '0 0 2px', fontFamily: 'Arial, sans-serif' }}>{organizationName}</p>
                {organizationPhone && <p style={{ fontSize: '11px', color: '#6b7280', margin: '0', fontFamily: 'Arial, sans-serif' }}>Tel: {organizationPhone}</p>}
                {organizationEmail && <p style={{ fontSize: '11px', color: '#6b7280', margin: '0', fontFamily: 'Arial, sans-serif' }}>{organizationEmail}</p>}
                <div style={{ marginTop: '6px' }}>
                    <span style={{ background: '#f3f4f6', color: '#374151', fontSize: '10px', fontWeight: '600', padding: '2px 8px', borderRadius: '9999px', fontFamily: 'Arial, sans-serif' }}>
                        COMPROBANTE N° {receiptNumber}
                    </span>
                </div>
            </div>

            {/* ── TYPE BADGE ──────────────────────────────────────── */}
            <div style={{ textAlign: 'center', marginBottom: '10px' }}>
                <span style={{ display: 'inline-block', padding: '3px 14px', borderRadius: '9999px', fontSize: '11px', fontWeight: '600', fontFamily: 'Arial, sans-serif', background: isService ? '#f3e8ff' : '#cffafe', color: isService ? '#7e22ce' : '#0e7490' }}>
                    {isService ? 'Servicio' : 'Producto'}
                </span>
            </div>

            {/* ── INFO GRID ───────────────────────────────────────── */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '6px', marginBottom: '10px' }}>
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px 10px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', fontFamily: 'Arial, sans-serif' }}>Paciente</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0', fontFamily: 'Arial, sans-serif' }}>{sale.patientName}</p>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px 10px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', fontFamily: 'Arial, sans-serif' }}>Fecha</p>
                    <p style={{ fontSize: '12px', fontWeight: '600', color: '#111827', margin: '0', fontFamily: 'Arial, sans-serif' }}>{formatDate(sale.date)}</p>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0', fontFamily: 'Arial, sans-serif' }}>{formatTime(sale.date)}</p>
                </div>
                <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px 10px' }}>
                    <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', fontFamily: 'Arial, sans-serif' }}>Método de Pago</p>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0', fontFamily: 'Arial, sans-serif' }}>
                        {paymentMethodLabels[sale.paymentMethod] || sale.paymentMethod}
                    </p>
                </div>
                {sale.professionalName && (
                    <div style={{ background: '#f9fafb', borderRadius: '8px', padding: '8px 10px' }}>
                        <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0 0 2px', fontFamily: 'Arial, sans-serif' }}>Profesional</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: '0', fontFamily: 'Arial, sans-serif' }}>{sale.professionalName}</p>
                    </div>
                )}
            </div>

            {/* ── ITEMS TABLE ─────────────────────────────────────── */}
            <div style={{ marginBottom: '10px' }}>
                <p style={{ fontSize: '11px', fontWeight: '700', color: '#374151', marginBottom: '4px', fontFamily: 'Arial, sans-serif' }}>
                    {isService ? 'Servicios' : 'Productos'}
                </p>
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '11px' }}>
                    <thead>
                        <tr style={{ background: '#f3f4f6', borderBottom: '1px solid #e5e7eb' }}>
                            <th style={{ textAlign: 'left', padding: '5px 8px', color: '#374151', fontWeight: '600', fontFamily: 'Arial, sans-serif' }}>Descripción</th>
                            <th style={{ textAlign: 'center', padding: '5px 6px', color: '#374151', fontWeight: '600', whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>Cant.</th>
                            <th style={{ textAlign: 'right', padding: '5px 6px', color: '#374151', fontWeight: '600', whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>P. Unit.</th>
                            <th style={{ textAlign: 'right', padding: '5px 8px', color: '#374151', fontWeight: '600', whiteSpace: 'nowrap', fontFamily: 'Arial, sans-serif' }}>Subtotal</th>
                        </tr>
                    </thead>
                    <tbody>
                        {sale.items && sale.items.length > 0 ? (
                            sale.items.map((item, i) => (
                                <tr key={i} style={{ borderBottom: '1px solid #f3f4f6', background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                                    <td style={{ padding: '5px 8px', color: '#111827', fontWeight: '500', fontFamily: 'Arial, sans-serif' }}>{item.name}</td>
                                    <td style={{ padding: '5px 6px', color: '#6b7280', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>{item.quantity} {item.unit || 'und'}</td>
                                    <td style={{ padding: '5px 6px', color: '#6b7280', textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>{formatCurrency(item.unitPrice)}</td>
                                    <td style={{ padding: '5px 8px', color: '#111827', fontWeight: '600', textAlign: 'right', fontFamily: 'Arial, sans-serif' }}>{formatCurrency(item.subtotal)}</td>
                                </tr>
                            ))
                        ) : (
                            <tr>
                                <td colSpan={4} style={{ padding: '8px', color: '#6b7280', textAlign: 'center', fontFamily: 'Arial, sans-serif' }}>{sale.description}</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ── TOTALS ──────────────────────────────────────────── */}
            <div style={{ borderTop: '2px solid #e5e7eb', paddingTop: '8px', marginBottom: '10px' }}>
                {sale.subtotal !== undefined && sale.subtotal !== sale.amount && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                        <span style={{ color: '#6b7280', fontFamily: 'Arial, sans-serif' }}>Subtotal:</span>
                        <span style={{ fontWeight: '500', color: '#374151', fontFamily: 'Arial, sans-serif' }}>{formatCurrency(sale.subtotal)}</span>
                    </div>
                )}
                {sale.discount !== undefined && sale.discount > 0 && (
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', marginBottom: '3px' }}>
                        <span style={{ color: '#6b7280', fontFamily: 'Arial, sans-serif' }}>Descuento:</span>
                        <span style={{ fontWeight: '500', color: '#ef4444', fontFamily: 'Arial, sans-serif' }}>-{formatCurrency(sale.discount)}</span>
                    </div>
                )}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#ecfdf5', border: '1px solid #a7f3d0', borderRadius: '8px', padding: '8px 12px', marginTop: '4px' }}>
                    <span style={{ fontSize: '13px', fontWeight: '700', color: '#111827', fontFamily: 'Arial, sans-serif' }}>TOTAL</span>
                    <span style={{ fontSize: '18px', fontWeight: '800', color: '#059669', fontFamily: 'Arial, sans-serif' }}>{formatCurrency(sale.amount)}</span>
                </div>
            </div>

            {/* ── NOTES ───────────────────────────────────────────── */}
            {sale.notes && (
                <div style={{ background: '#fffbeb', border: '1px solid #fde68a', borderRadius: '8px', padding: '8px 10px', marginBottom: '10px' }}>
                    <p style={{ fontSize: '10px', fontWeight: '700', color: '#92400e', margin: '0 0 2px', fontFamily: 'Arial, sans-serif' }}>Notas</p>
                    <p style={{ fontSize: '11px', color: '#92400e', margin: '0', fontFamily: 'Arial, sans-serif' }}>{sale.notes}</p>
                </div>
            )}

            {/* ── FOOTER ──────────────────────────────────────────── */}
            <div style={{ borderTop: '1px solid #e5e7eb', paddingTop: '8px', textAlign: 'center' }}>
                <p style={{ fontSize: '10px', color: '#9ca3af', margin: '0', fontFamily: 'Arial, sans-serif' }}>
                    Generado el {format(new Date(), "dd/MM/yyyy 'a las' HH:mm", { locale: es })} · ClinqApp
                </p>
            </div>
        </>
    );
}

// ─────────────────────────────────────────────────────────────────────────────

const SaleSinglePDF = ({
    sale,
    organizationName,
    organizationPhone,
    organizationEmail,
    onClose,
}: SaleSinglePDFProps) => {
    // This ref points to the HIDDEN full-size element used for PDF capture.
    // It is rendered off-screen (left: -9999px) so it has no CSS transforms
    // and html2canvas captures it clean at 520px.
    const captureRef = useRef<HTMLDivElement>(null);

    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('es-PE', { style: 'currency', currency: 'PEN' }).format(amount);
    }, []);

    const formatDate = useCallback((dateString: string) => {
        return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: es });
    }, []);

    const formatTime = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit' });
    }, []);

    const handleDownloadPDF = async () => {
        if (!captureRef.current) return;
        try {
            const receiptNum = sale.receiptNumber || sale.id.slice(0, 8).toUpperCase();
            const filename = `comprobante-${receiptNum}-${format(new Date(sale.date), 'dd-MM-yyyy')}.pdf`;
            await pdfGeneratorService.generateSinglePagePDF(captureRef.current, filename);
            toast.success('Comprobante descargado correctamente');
            onClose();
        } catch (error) {
            toast.error('Error al descargar el comprobante');
            console.error(error);
        }
    };

    const sharedProps = { sale, organizationName, organizationPhone, organizationEmail, formatCurrency, formatDate, formatTime };

    return createPortal(
        <>
            {/* ── HIDDEN CAPTURE TARGET (off-screen, no transforms) ── */}
            {/* html2canvas reads this element at full 520px width, untouched by any CSS transform */}
            <div
                aria-hidden="true"
                style={{
                    position: 'fixed',
                    left: '-9999px',
                    top: 0,
                    zIndex: -1,
                    pointerEvents: 'none',
                }}
            >
                <div
                    ref={captureRef}
                    style={{
                        width: '520px',
                        background: '#ffffff',
                        padding: '20px',
                        fontFamily: 'Arial, sans-serif',
                        boxSizing: 'border-box',
                    }}
                >
                    <ReceiptContent {...sharedProps} />
                </div>
            </div>

            {/* ── VISIBLE MODAL ─────────────────────────────────── */}
            <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-[60] p-3 md:p-6">
                <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[95vh] flex flex-col">

                    {/* Header */}
                    <div className="flex items-center justify-between px-5 py-3.5 border-b border-gray-200 shrink-0">
                        <h2 className="text-base font-bold text-gray-900">Vista Previa del Comprobante</h2>
                        <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg transition">
                            <X className="w-4 h-4 text-gray-500" />
                        </button>
                    </div>

                    {/* Scrollable preview — scaled to fit mobile screen */}
                    <div className="flex-1 overflow-y-auto p-3">
                        <div
                            className="overflow-hidden"
                            ref={(el) => {
                                if (!el) return;
                                const parentW = el.clientWidth || 480;
                                const scale = Math.min(1, parentW / 520);
                                el.style.height = `${480 * scale}px`; // approximate, updated below
                                const inner = el.firstElementChild as HTMLDivElement | null;
                                if (inner) {
                                    inner.style.transform = `scale(${scale})`;
                                    // After rendering, adjust container height to match scaled content
                                    requestAnimationFrame(() => {
                                        el.style.height = `${inner.offsetHeight * scale}px`;
                                    });
                                }
                            }}
                        >
                            {/* This div is ONLY for display. No ref, free to be scaled. */}
                            <div
                                className="origin-top-left"
                                style={{
                                    width: '520px',
                                    background: '#ffffff',
                                    padding: '20px',
                                    fontFamily: 'Arial, sans-serif',
                                    boxSizing: 'border-box',
                                }}
                            >
                                <ReceiptContent {...sharedProps} />
                            </div>
                        </div>
                    </div>

                    {/* Footer actions */}
                    <div className="flex items-center gap-3 px-4 py-3 border-t border-gray-200 bg-gray-50 rounded-b-2xl shrink-0">
                        <Button variant="outline" onClick={onClose} className="flex-1">
                            Cancelar
                        </Button>
                        <Button
                            onClick={handleDownloadPDF}
                            className="flex-1 gap-2 bg-emerald-600 hover:bg-emerald-700"
                        >
                            <Download className="w-4 h-4" />
                            Descargar PDF
                        </Button>
                    </div>
                </div>
            </div>
        </>,
        document.body
    );
};

export default SaleSinglePDF;
