import { useEffect, useState, useCallback, useMemo } from 'react';
import { useSalesStore } from '@/stores/useSalesStore';
import { Search, DollarSign, Receipt, AlertCircle, Filter, X, Package, Stethoscope, Eye } from 'lucide-react';
import SaleDetailModal from '@/components/sales/SaleDetailModal';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DateRangePicker } from '@/components/ui/date-range-picker';
import { DateRange } from 'react-day-picker';
import { format } from 'date-fns';

const SalesPage = () => {
    const {
        sales,
        isLoading,
        pagination,
        summary,
        filters,
        error,
        fetchSales,
        setFilters,
        clearFilters,
        clearError,
    } = useSalesStore();

    const [dateRange, setDateRange] = useState<DateRange | undefined>();
    const [localFilters, setLocalFilters] = useState<{
        paymentMethod: string;
        search: string;
        type: 'SERVICE' | 'PRODUCT' | 'ALL';
    }>({
        paymentMethod: '',
        search: '',
        type: 'ALL',
    });
    const [selectedSale, setSelectedSale] = useState<any>(null);
    const [showDetailModal, setShowDetailModal] = useState(false);

    useEffect(() => {
        fetchSales();
    }, []);

    const handleFilterChange = useCallback((key: string, value: string) => {
        const updatedFilters = { ...localFilters, [key]: value };
        setLocalFilters(updatedFilters);
        
        // Apply filters automatically
        const newFilters = {
            ...filters,
            ...updatedFilters,
            startDate: dateRange?.from ? format(dateRange.from, 'yyyy-MM-dd') : undefined,
            endDate: dateRange?.to ? format(dateRange.to, 'yyyy-MM-dd') : undefined,
            page: 1,
        };
        setFilters(newFilters);
        fetchSales(newFilters);
    }, [localFilters, dateRange, filters, setFilters, fetchSales]);

    const handleDateRangeChange = useCallback((newDateRange: DateRange | undefined) => {
        setDateRange(newDateRange);
        
        // Apply filters automatically
        const newFilters = {
            ...filters,
            ...localFilters,
            startDate: newDateRange?.from ? format(newDateRange.from, 'yyyy-MM-dd') : undefined,
            endDate: newDateRange?.to ? format(newDateRange.to, 'yyyy-MM-dd') : undefined,
            page: 1,
        };
        setFilters(newFilters);
        fetchSales(newFilters);
    }, [filters, localFilters, setFilters, fetchSales]);

    const handleClearFilters = useCallback(() => {
        setDateRange(undefined);
        setLocalFilters({
            paymentMethod: '',
            search: '',
            type: 'ALL',
        });
        clearFilters();
        fetchSales();
    }, [clearFilters, fetchSales]);

    const handlePageChange = useCallback((newPage: number) => {
        const newFilters = { ...filters, page: newPage };
        setFilters(newFilters);
        fetchSales(newFilters);
    }, [filters, setFilters, fetchSales]);

    const formatCurrency = useCallback((amount: number) => {
        return new Intl.NumberFormat('es-PE', {
            style: 'currency',
            currency: 'PEN',
        }).format(amount);
    }, []);

    const formatDate = useCallback((dateString: string) => {
        const date = new Date(dateString);
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}-${month}-${year}`;
    }, []);

    const formatTime = useCallback((dateString: string) => {
        return new Date(dateString).toLocaleTimeString('es-PE', {
            hour: '2-digit',
            minute: '2-digit',
        });
    }, []);

    const paymentMethodLabels: Record<string, string> = useMemo(() => ({
        CASH: 'Efectivo',
        CREDIT_CARD: 'Tarjeta de Crédito',
        DEBIT_CARD: 'Tarjeta de Débito',
        BANK_TRANSFER: 'Transferencia',
        MOBILE_PAYMENT: 'Yape/Plin',
        BANK_DEPOSIT: 'Depósito',
    }), []);

    const getPaymentMethodLabel = useCallback((method: string) => {
        return paymentMethodLabels[method] || method;
    }, [paymentMethodLabels]);

    const hasActiveFilters = useMemo(() => {
        return !!(dateRange?.from || dateRange?.to || localFilters.paymentMethod || localFilters.search || localFilters.type !== 'ALL');
    }, [dateRange, localFilters]);

    const handleViewDetails = useCallback((sale: any) => {
        setSelectedSale(sale);
        setShowDetailModal(true);
    }, []);

    const getSaleTypeIcon = (type: string) => {
        return type === 'SERVICE' ? <Stethoscope className="w-4 h-4" /> : <Package className="w-4 h-4" />;
    };

    const getSaleTypeBadge = (type: string) => {
        return type === 'SERVICE' ? 'Servicio' : 'Producto';
    };

    return (
        <div className="space-y-6 animate-fade-in">
            {/* Header */}
            <div className="flex flex-col gap-2">
                <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                    Ventas
                </h1>
                <p className="text-[rgb(var(--text-secondary))]">
                    Historial completo de transacciones
                </p>
            </div>

            {/* Error Alert */}
            {error && (
                <Card className="border-destructive bg-destructive/5">
                    <CardContent className="flex items-start gap-3 p-4">
                        <AlertCircle className="h-5 w-5 text-destructive mt-0.5" />
                        <div className="flex-1">
                            <p className="text-sm font-medium text-destructive">Error al cargar ventas</p>
                            <p className="text-sm text-[rgb(var(--text-secondary))] mt-1">{error}</p>
                        </div>
                        <Button
                            variant="ghost"
                            size="sm"
                            onClick={clearError}
                            className="h-8 w-8 p-0"
                        >
                            <X className="h-4 w-4" />
                        </Button>
                    </CardContent>
                </Card>
            )}

            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                                    Total de Ventas
                                </p>
                                <p className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                                    {formatCurrency(summary.totalAmount)}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-emerald-500 to-emerald-600 flex items-center justify-center shadow-lg">
                                <DollarSign className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                                    Transacciones
                                </p>
                                <p className="text-3xl font-bold text-[rgb(var(--text-primary))]">
                                    {summary.count}
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
                                <Receipt className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                                    Servicios
                                </p>
                                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                                    {formatCurrency(summary.serviceAmount || 0)}
                                </p>
                                <p className="text-xs text-[rgb(var(--text-secondary))]">
                                    {summary.serviceCount || 0} ventas
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-purple-600 flex items-center justify-center shadow-lg">
                                <Stethoscope className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                            <div className="space-y-1">
                                <p className="text-sm font-medium text-[rgb(var(--text-secondary))]">
                                    Productos
                                </p>
                                <p className="text-2xl font-bold text-[rgb(var(--text-primary))]">
                                    {formatCurrency(summary.productAmount || 0)}
                                </p>
                                <p className="text-xs text-[rgb(var(--text-secondary))]">
                                    {summary.productCount || 0} ventas
                                </p>
                            </div>
                            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-orange-600 flex items-center justify-center shadow-lg">
                                <Package className="w-6 h-6 text-white" />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Filters */}
            <Card>
                <CardHeader>
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <Filter className="w-5 h-5 text-[rgb(var(--text-secondary))]" />
                            <CardTitle className="text-lg">Filtros</CardTitle>
                        </div>
                        {hasActiveFilters && (
                            <Badge variant="secondary" className="gap-1">
                                {[
                                    dateRange?.from || dateRange?.to,
                                    ...Object.values(localFilters)
                                ].filter(Boolean).length} activos
                            </Badge>
                        )}
                    </div>
                </CardHeader>
                <CardContent className="space-y-4">
                    <div className="space-y-4">
                        <div className="flex items-center justify-end">
                            {hasActiveFilters && (
                                <Button
                                    onClick={handleClearFilters}
                                    variant="outline"
                                    size="sm"
                                    className="gap-2"
                                >
                                    <X className="w-4 h-4" />
                                    Limpiar Filtros
                                </Button>
                            )}
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {/* Date Range */}
                            <div className="space-y-2 md:col-span-2 lg:col-span-1">
                                <label className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                    Rango de Fechas
                                </label>
                                <DateRangePicker
                                    date={dateRange}
                                    onDateChange={handleDateRangeChange}
                                    placeholder="Seleccionar fechas"
                                />
                            </div>

                        {/* Sale Type */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                Tipo de Venta
                            </label>
                            <Select
                                value={localFilters.type}
                                onValueChange={(value) => handleFilterChange('type', value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todas" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todas</SelectItem>
                                    <SelectItem value="SERVICE">Servicios</SelectItem>
                                    <SelectItem value="PRODUCT">Productos</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Payment Method */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-primary))]">
                                Método de Pago
                            </label>
                            <Select
                                value={localFilters.paymentMethod || undefined}
                                onValueChange={(value) => handleFilterChange('paymentMethod', value === 'ALL' ? '' : value)}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder="Todos" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="ALL">Todos</SelectItem>
                                    <SelectItem value="CASH">Efectivo</SelectItem>
                                    <SelectItem value="CARD">Tarjeta</SelectItem>
                                    <SelectItem value="BANK_TRANSFER">Transferencia</SelectItem>
                                    <SelectItem value="YAPE">Yape</SelectItem>
                                    <SelectItem value="PLIN">Plin</SelectItem>
                                    <SelectItem value="OTHER">Otro</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>

                        {/* Search */}
                        <div className="space-y-2">
                            <label className="text-sm font-medium text-[rgb(var(--text-primary))] flex items-center gap-1.5">
                                <Search className="w-4 h-4" />
                                Buscar Paciente
                            </label>
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <input
                                    type="text"
                                    value={localFilters.search}
                                    onChange={(e) => handleFilterChange('search', e.target.value)}
                                    placeholder="Nombre del paciente"
                                    className="flex h-10 w-full rounded-md border border-input bg-background pl-9 pr-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                                />
                            </div>
                        </div>
                    </div>
                    </div>
                </CardContent>
            </Card>

            {/* Table */}
            {isLoading ? (
                <Card>
                    <CardContent className="flex items-center justify-center py-12">
                        <div className="flex flex-col items-center gap-3">
                            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                            <p className="text-sm text-[rgb(var(--text-secondary))]">Cargando ventas...</p>
                        </div>
                    </CardContent>
                </Card>
            ) : sales.length === 0 ? (
                <Card>
                    <CardContent className="p-12">
                        <div className="text-center space-y-4">
                            <div className="mx-auto w-20 h-20 rounded-full bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-800 dark:to-gray-700 flex items-center justify-center">
                                <Receipt className="w-10 h-10 text-[rgb(var(--text-secondary))]" />
                            </div>
                            <div className="space-y-2">
                                <h3 className="text-xl font-semibold text-[rgb(var(--text-primary))]">
                                    No hay ventas registradas
                                </h3>
                                <p className="text-sm text-[rgb(var(--text-secondary))] max-w-sm mx-auto">
                                    Las transacciones aparecerán aquí una vez que se registren pagos
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            ) : (
                <>
                    <Card>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Tipo</TableHead>
                                    <TableHead>Fecha</TableHead>
                                    <TableHead>Paciente</TableHead>
                                    <TableHead>Descripción</TableHead>
                                    <TableHead className="text-right">Monto</TableHead>
                                    <TableHead>Método de Pago</TableHead>
                                    <TableHead className="text-center">Acciones</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {sales.map((sale) => (
                                    <TableRow key={sale.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewDetails(sale)}>
                                        <TableCell>
                                            <Badge variant={sale.type === 'SERVICE' ? 'default' : 'secondary'} className="gap-1">
                                                {getSaleTypeIcon(sale.type)}
                                                {getSaleTypeBadge(sale.type)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <div className="flex flex-col">
                                                <span className="font-medium text-[rgb(var(--text-primary))]">
                                                    {formatDate(sale.date)}
                                                </span>
                                                <span className="text-xs text-[rgb(var(--text-secondary))]">
                                                    {formatTime(sale.date)}
                                                </span>
                                            </div>
                                        </TableCell>
                                        <TableCell className="font-medium">
                                            {sale.patientName}
                                        </TableCell>
                                        <TableCell className="text-[rgb(var(--text-secondary))] max-w-xs truncate">
                                            {sale.description}
                                        </TableCell>
                                        <TableCell className="text-right font-semibold text-emerald-600 dark:text-emerald-400">
                                            {formatCurrency(sale.amount)}
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline" className="font-normal">
                                                {getPaymentMethodLabel(sale.paymentMethod)}
                                            </Badge>
                                        </TableCell>
                                        <TableCell className="text-center">
                                            <Button
                                                variant="ghost"
                                                size="sm"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    handleViewDetails(sale);
                                                }}
                                                className="gap-1"
                                            >
                                                <Eye className="w-4 h-4" />
                                                Ver
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </Card>

                    {/* Pagination */}
                    {pagination.totalPages > 1 && (
                        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                            <p className="text-sm text-[rgb(var(--text-secondary))]">
                                Mostrando <span className="font-medium">{((pagination.page - 1) * pagination.limit) + 1}</span> a{' '}
                                <span className="font-medium">{Math.min(pagination.page * pagination.limit, pagination.total)}</span> de{' '}
                                <span className="font-medium">{pagination.total}</span> resultados
                            </p>
                            <div className="flex items-center gap-2">
                                <Button
                                    onClick={() => handlePageChange(pagination.page - 1)}
                                    disabled={pagination.page === 1}
                                    variant="outline"
                                    size="sm"
                                >
                                    Anterior
                                </Button>
                                <span className="text-sm text-[rgb(var(--text-primary))] px-3">
                                    Página <span className="font-medium">{pagination.page}</span> de <span className="font-medium">{pagination.totalPages}</span>
                                </span>
                                <Button
                                    onClick={() => handlePageChange(pagination.page + 1)}
                                    disabled={pagination.page === pagination.totalPages}
                                    variant="outline"
                                    size="sm"
                                >
                                    Siguiente
                                </Button>
                            </div>
                        </div>
                    )}
                </>
            )}
            {/* Detail Modal */}
            <SaleDetailModal
                sale={selectedSale}
                isOpen={showDetailModal}
                onClose={() => setShowDetailModal(false)}
            />
        </div>
    );
};

export default SalesPage;
