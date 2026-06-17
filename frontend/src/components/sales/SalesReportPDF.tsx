import { useRef, useCallback } from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { Button } from '@/components/ui/Button';
import { Download, X } from 'lucide-react';
import { pdfGeneratorService } from '@/services/pdf-generator.service';
import { toast } from 'sonner';

interface SalesReportPDFProps {
  organizationName: string;
  organizationPhone?: string;
  organizationEmail?: string;
  sales: any[];
  summary: {
    totalAmount: number;
    count: number;
    serviceAmount?: number;
    serviceCount?: number;
    productAmount?: number;
    productCount?: number;
  };
  filters: {
    startDate?: string;
    endDate?: string;
    paymentMethod?: string;
    type?: string;
  };
  onClose: () => void;
}

const SalesReportPDF = ({
  organizationName,
  organizationPhone,
  organizationEmail,
  sales,
  summary,
  filters,
  onClose,
}: SalesReportPDFProps) => {
  const reportRef = useRef<HTMLDivElement>(null);

  const formatCurrency = useCallback((amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  }, []);

  const formatDate = useCallback((dateString: string) => {
    return format(new Date(dateString), 'dd/MM/yyyy', { locale: es });
  }, []);

  const formatTime = useCallback((dateString: string) => {
    return new Date(dateString).toLocaleTimeString('es-PE', {
      hour: '2-digit',
      minute: '2-digit',
    });
  }, []);

  const paymentMethodLabels: Record<string, string> = {
    CASH: 'Efectivo',
    CREDIT_CARD: 'Tarjeta de Crédito',
    DEBIT_CARD: 'Tarjeta de Débito',
    BANK_TRANSFER: 'Transferencia',
    MOBILE_PAYMENT: 'Yape/Plin',
    BANK_DEPOSIT: 'Depósito',
  };

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;

    try {
      const filename = `reporte-ventas-${format(new Date(), 'dd-MM-yyyy')}.pdf`;
      await pdfGeneratorService.generateSalesReportPDF(reportRef.current, filename);
      toast.success('PDF descargado correctamente');
      onClose();
    } catch (error) {
      toast.error('Error al descargar el PDF');
      console.error(error);
    }
  };

  const getFilterDescription = () => {
    const parts = [];
    if (filters.startDate && filters.endDate) {
      parts.push(`${formatDate(filters.startDate)} - ${formatDate(filters.endDate)}`);
    }
    if (filters.paymentMethod) {
      parts.push(`Método: ${paymentMethodLabels[filters.paymentMethod] || filters.paymentMethod}`);
    }
    if (filters.type && filters.type !== 'ALL') {
      parts.push(`Tipo: ${filters.type === 'SERVICE' ? 'Servicios' : 'Productos'}`);
    }
    return parts.length > 0 ? parts.join(' | ') : 'Sin filtros aplicados';
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-2xl max-w-4xl w-full max-h-[90vh] flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b">
          <h2 className="text-2xl font-bold text-gray-900">Vista Previa - Reporte de Ventas</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto">
          <div ref={reportRef} className="bg-white p-8">
            {/* Organization Header */}
            <div className="text-center mb-4 pb-3 border-b-2 border-gray-300">
              <h1 className="text-2xl font-bold text-gray-900 mb-1">{organizationName}</h1>
              <div className="text-xs text-gray-600 space-y-0.5">
                {organizationPhone && <p>Teléfono: {organizationPhone}</p>}
                {organizationEmail && <p>Email: {organizationEmail}</p>}
              </div>
            </div>

            {/* Report Title and Date */}
            <div className="mb-4">
              <h2 className="text-lg font-bold text-gray-900 mb-1">Reporte de Ventas</h2>
              <p className="text-xs text-gray-600 mb-1">
                Generado: {format(new Date(), 'dd/MM/yyyy HH:mm', { locale: es })}
              </p>
              <p className="text-xs text-gray-600 font-medium">
                Filtros: {getFilterDescription()}
              </p>
            </div>

            {/* Summary Section */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-2">Resumen</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <div className="bg-emerald-50 p-3 rounded-lg border border-emerald-200">
                  <p className="text-xs text-gray-600 mb-1">Total de Ventas</p>
                  <p className="text-lg font-bold text-emerald-600">{formatCurrency(summary.totalAmount)}</p>
                </div>
                <div className="bg-blue-50 p-3 rounded-lg border border-blue-200">
                  <p className="text-xs text-gray-600 mb-1">Transacciones</p>
                  <p className="text-lg font-bold text-blue-600">{summary.count}</p>
                </div>
                {summary.serviceAmount !== undefined && (
                  <div className="bg-purple-50 p-3 rounded-lg border border-purple-200">
                    <p className="text-xs text-gray-600 mb-1">Servicios</p>
                    <p className="text-base font-bold text-purple-600">{formatCurrency(summary.serviceAmount)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{summary.serviceCount || 0} ventas</p>
                  </div>
                )}
                {summary.productAmount !== undefined && (
                  <div className="bg-orange-50 p-3 rounded-lg border border-orange-200">
                    <p className="text-xs text-gray-600 mb-1">Productos</p>
                    <p className="text-base font-bold text-orange-600">{formatCurrency(summary.productAmount)}</p>
                    <p className="text-xs text-gray-500 mt-0.5">{summary.productCount || 0} ventas</p>
                  </div>
                )}
              </div>
            </div>

            {/* Sales Table */}
            <div className="mb-4">
              <h3 className="text-base font-bold text-gray-900 mb-2">Desglose de Ventas</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-100 border-b border-gray-300">
                      <th className="px-1.5 py-1.5 text-left font-bold text-gray-900 text-xs min-w-[70px]">Fecha</th>
                      <th className="px-1.5 py-1.5 text-left font-bold text-gray-900 text-xs min-w-[80px]">Paciente</th>
                      <th className="px-1.5 py-1.5 text-left font-bold text-gray-900 text-xs min-w-[45px]">Tipo</th>
                      <th className="px-1.5 py-1.5 text-left font-bold text-gray-900 text-xs flex-1">Descripción</th>
                      <th className="px-1.5 py-1.5 text-left font-bold text-gray-900 text-xs min-w-[60px]">Pago</th>
                      <th className="px-1.5 py-1.5 text-right font-bold text-gray-900 text-xs min-w-[70px]">Monto</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sales.map((sale, index) => (
                      <tr key={sale.id} className={index % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                        <td className="px-1.5 py-1 text-gray-700 whitespace-nowrap min-w-[70px]">
                          <div>
                            <p className="font-medium text-xs">{formatDate(sale.date)}</p>
                            <p className="text-xs text-gray-500">{formatTime(sale.date)}</p>
                          </div>
                        </td>
                        <td className="px-1.5 py-1 text-gray-700 font-medium text-xs min-w-[80px]">{sale.patientName}</td>
                        <td className="px-1.5 py-1 text-gray-700 min-w-[45px]">
                          <span className={`px-1 py-0.5 rounded text-xs font-medium whitespace-nowrap ${
                            sale.type === 'SERVICE'
                              ? 'bg-purple-100 text-purple-700'
                              : 'bg-orange-100 text-orange-700'
                          }`}>
                            {sale.type === 'SERVICE' ? 'Srv' : 'Prod'}
                          </span>
                        </td>
                        <td className="px-1.5 py-1 text-gray-700 text-xs truncate">{sale.description}</td>
                        <td className="px-1.5 py-1 text-gray-700 text-xs whitespace-nowrap min-w-[60px]">
                          {paymentMethodLabels[sale.paymentMethod]?.substring(0, 8) || sale.paymentMethod}
                        </td>
                        <td className="px-1.5 py-1 text-right font-semibold text-emerald-600 whitespace-nowrap min-w-[70px]">
                          {formatCurrency(sale.amount)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Footer */}
            <div className="text-center pt-2 border-t border-gray-300 text-xs text-gray-500">
              <p>Documento generado automáticamente por ClinqApp</p>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-end gap-3 p-6 border-t bg-gray-50">
          <Button
            variant="outline"
            onClick={onClose}
          >
            Cerrar
          </Button>
          <Button
            onClick={handleDownloadPDF}
            className="gap-2 bg-emerald-600 hover:bg-emerald-700"
          >
            <Download className="w-4 h-4" />
            Descargar PDF
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SalesReportPDF;
