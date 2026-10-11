import { useEffect, useState } from 'react';
import { useProductSalesStore } from '@/stores/useProductSalesStore';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { useProductSalesHandlers } from '@/hooks/useProductSalesHandlers';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatsCard } from '@/components/dashboard/StatsCard';
import { SaleFilters } from '@/components/product-sales/SaleFilters';
import { SaleCard } from '@/components/product-sales/SaleCard';
import { NewSaleDrawer } from '@/components/product-sales/NewSaleDrawer';
import { Plus, RefreshCw, Package, DollarSign, ShoppingCart, TrendingUp } from 'lucide-react';
import { toast } from 'sonner';

export default function ProductSalesPage() {
  const {
    sales,
    stats,
    isLoadingSales,
    isLoadingStats,
    isCreatingSale,
    isExportingSales,
    salesError,
    statsError,
    currentPage,
    totalPages,
    fetchSales,
    fetchSale,
    fetchStats,
    exportSales,
    setDateFilters,
    clearErrors,
    resetFilters,
    nextPage,
    previousPage,
  } = useProductSalesStore();

  const { products, fetchProducts } = useInventoryStore();
  const { patients, fetchPatients } = usePatientsStore();

  const {
    saleForm,
    fields,
    showSaleDrawer,
    setShowSaleDrawer,
    setShowSaleDetailDialog,
    handleCreateSale,
    handleProductSelect,
    addItem,
    removeItem,
    calculateTotals,
  } = useProductSalesHandlers();

  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Load data on mount
  useEffect(() => {
    fetchSales({}, true);
    fetchStats({}, true);
    fetchProducts({}, true);
    fetchPatients();
  }, []);

  // Handle date filter changes
  const handleApplyFilters = () => {
    setDateFilters(startDate || null, endDate || null);
    fetchSales({}, true);
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setStartDate('');
    setEndDate('');
    resetFilters();
    fetchSales({}, true);
  };

  // Handle export
  const handleExport = async () => {
    try {
      await exportSales();
      toast.success('Ventas exportadas exitosamente');
    } catch (error) {
      toast.error('Error al exportar ventas');
    }
  };

  // View sale details
  const viewSaleDetails = async (saleId: string) => {
    try {
      await fetchSale(saleId);
      setShowSaleDetailDialog(true);
    } catch (error) {
      toast.error('Error al cargar detalles de la venta');
    }
  };

  const handleRefresh = () => {
    fetchSales({}, true);
    fetchStats({}, true);
  };

  const { subtotal, total } = calculateTotals();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold mb-2">Venta de Productos</h1>
          <p className="text-muted-foreground">
            Registra y gestiona las ventas de productos
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingSales || isLoadingStats}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
          <Button onClick={() => setShowSaleDrawer(true)} className="gap-2">
            <Plus className="h-4 w-4" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Error messages */}
      {(salesError || statsError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <Package className="h-4 w-4" />
              <span>{salesError || statsError}</span>
              <Button variant="ghost" size="sm" onClick={clearErrors}>
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="sales" className="space-y-4">
        <TabsList>
          <TabsTrigger value="sales">Ventas</TabsTrigger>
          <TabsTrigger value="stats">Estadísticas</TabsTrigger>
        </TabsList>

        {/* Sales Tab */}
        <TabsContent value="sales" className="space-y-4">
          {/* Filters */}
          <Card>
            <CardContent className="p-6">
              <SaleFilters
                searchQuery={searchQuery}
                startDate={startDate}
                endDate={endDate}
                onSearchChange={setSearchQuery}
                onStartDateChange={setStartDate}
                onEndDateChange={setEndDate}
                onApplyFilters={handleApplyFilters}
                onReset={handleResetFilters}
                onExport={handleExport}
                isExporting={isExportingSales}
              />
            </CardContent>
          </Card>

          {/* Sales List */}
          {isLoadingSales ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ) : sales.length === 0 ? (
            <Card>
              <CardContent className="pt-6">
                <div className="text-center py-8">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay ventas registradas</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza creando tu primera venta
                  </p>
                  <Button onClick={() => setShowSaleDrawer(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Nueva Venta
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {sales.map((sale) => (
                  <SaleCard
                    key={sale.id}
                    sale={sale}
                    onViewDetails={viewSaleDetails}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">
                    Página {currentPage} de {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      onClick={previousPage}
                      disabled={currentPage === 1}
                    >
                      Anterior
                    </Button>
                    <Button
                      variant="outline"
                      onClick={nextPage}
                      disabled={currentPage === totalPages}
                    >
                      Siguiente
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          {isLoadingStats ? (
            <Card>
              <CardContent className="pt-6">
                <div className="flex items-center justify-center py-8">
                  <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              {/* Summary Cards — match dashboard StatsCard layout on tablet */}
              <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                <StatsCard
                  title="Total Ventas"
                  value={stats?.totalSales || 0}
                  icon={ShoppingCart}
                  iconColor="text-blue-600"
                  iconBgColor="bg-blue-50 dark:bg-blue-950/30"
                  isLoading={isLoadingStats}
                />
                <StatsCard
                  title="Ingresos Totales"
                  value={formatCurrency(stats?.totalRevenue || 0)}
                  icon={DollarSign}
                  iconColor="text-emerald-600"
                  iconBgColor="bg-emerald-50 dark:bg-emerald-950/30"
                  valueColor="text-emerald-600 dark:text-emerald-500"
                  isLoading={isLoadingStats}
                />
                <StatsCard
                  title="Productos Vendidos"
                  value={stats?.topProducts?.length || 0}
                  icon={TrendingUp}
                  iconColor="text-orange-600"
                  iconBgColor="bg-orange-50 dark:bg-orange-950/30"
                  isLoading={isLoadingStats}
                />
              </div>

              {/* Top Products */}
              {stats?.topProducts && stats.topProducts.length > 0 && (
                <Card>
                  <CardContent className="p-6">
                    <h3 className="text-lg font-semibold mb-4">Productos Más Vendidos</h3>
                    <div className="space-y-3">
                      {stats.topProducts.map((item: any, index: number) => (
                        <div
                          key={item.productId}
                          className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
                        >
                          <div className="flex items-center gap-3">
                            <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary font-semibold">
                              {index + 1}
                            </div>
                            <div>
                              <p className="font-medium">{item.product?.name || 'Producto'}</p>
                              <p className="text-sm text-muted-foreground">
                                {item._sum.quantity} unidades vendidas
                              </p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold text-primary">
                              {formatCurrency(item._sum.subtotal || 0)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}
            </>
          )}
        </TabsContent>
      </Tabs>

      {/* Drawers */}
      <NewSaleDrawer
        open={showSaleDrawer}
        onOpenChange={setShowSaleDrawer}
        form={saleForm}
        fields={fields}
        products={products}
        patients={patients}
        isLoading={isCreatingSale}
        onSubmit={handleCreateSale}
        onProductSelect={handleProductSelect}
        onAddItem={addItem}
        onRemoveItem={removeItem}
        subtotal={subtotal}
        total={total}
      />
    </div>
  );
}
