import { useEffect, useState } from 'react';
import { useProductSalesStore } from '@/stores/useProductSalesStore';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { usePatientsStore } from '@/stores/usePatientsStore';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { useForm, useFieldArray } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  //TrendingUp, 
  //Calendar,
  Download,
  Eye,
  Trash2,
  User,
  Package,
  DollarSign,
  BarChart3,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import { CreateProductSaleData } from '@/services/product-sales.service';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

// Validation schema
const saleSchema = z.object({
  patientId: z.string().optional(),
  items: z.array(z.object({
    productId: z.string().min(1, 'Selecciona un producto'),
    quantity: z.number().int().min(1, 'La cantidad debe ser mayor a 0'),
    unitPrice: z.number().min(0, 'El precio debe ser mayor o igual a 0'),
  })).min(1, 'Debe incluir al menos un producto'),
  discount: z.number().min(0, 'El descuento debe ser mayor o igual a 0').default(0),
  notes: z.string().optional(),
  paymentMethod: z.enum(['CASH', 'CARD', 'BANK_TRANSFER', 'YAPE', 'PLIN', 'OTHER']).optional(),
  createPayment: z.boolean().default(false),
});

export default function ProductSalesPage() {
  const {
    sales,
    selectedSale,
    stats,
    isLoadingSales,
    isLoadingStats,
    isCreatingSale,
    isExportingSales,
    salesError,
    statsError,
    patientFilter,
    startDateFilter,
    endDateFilter,
    currentPage,
    totalPages,
    hasMore,
    fetchSales,
    fetchSale,
    createSale,
    fetchStats,
    exportSales,
    //setPatientFilter,
    setDateFilters,
    //setSelectedSale,
    clearErrors,
    resetFilters,
    nextPage,
    previousPage,
  } = useProductSalesStore();

  const {
    products,
    fetchProducts,
  } = useInventoryStore();

  const {
    patients,
    fetchPatients,
  } = usePatientsStore();

  const [showSaleDialog, setShowSaleDialog] = useState(false);
  const [showSaleDetailDialog, setShowSaleDetailDialog] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  // Form
  const saleForm = useForm<CreateProductSaleData>({
    resolver: zodResolver(saleSchema),
    defaultValues: {
      patientId: '',
      items: [{ productId: '', quantity: 1, unitPrice: 0 }],
      discount: 0,
      notes: '',
      paymentMethod: 'CASH',
      createPayment: false,
    },
  });

  const { fields, append, remove } = useFieldArray({
    control: saleForm.control,
    name: 'items',
  });

  // Load data on mount
  useEffect(() => {
    fetchSales();
    fetchStats();
    fetchProducts();
    fetchPatients();
  }, []);

  // Reload sales when filters change
  useEffect(() => {
    fetchSales();
  }, [patientFilter, startDateFilter, endDateFilter, currentPage]);

  // Handle sale creation
  const handleCreateSale = async (data: CreateProductSaleData) => {
    try {
      await createSale(data);
      toast.success('Venta creada exitosamente');
      setShowSaleDialog(false);
      saleForm.reset();
      // Refresh stats
      fetchStats({}, true);
    } catch (error) {
      toast.error('Error al crear venta');
    }
  };

  // Handle product selection in form
  const handleProductSelect = (index: number, productId: string) => {
    const product = products.find(p => p.id === productId);
    if (product) {
      saleForm.setValue(`items.${index}.productId`, productId);
      saleForm.setValue(`items.${index}.unitPrice`, product.salePrice);
    }
  };

  // Calculate totals
  const watchedItems = saleForm.watch('items');
  const watchedDiscount = saleForm.watch('discount') || 0;
  const subtotal = watchedItems.reduce((sum, item) => sum + (item.quantity * item.unitPrice), 0);
  const total = Math.max(0, subtotal - watchedDiscount);

  // Handle date filter changes
  const handleDateFilterChange = () => {
    setDateFilters(startDate || null, endDate || null);
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

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Ventas de Productos</h1>
          <p className="text-muted-foreground">
            Gestiona las ventas de productos y consulta estadísticas
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchSales({}, true);
              fetchStats({}, true);
            }}
            disabled={isLoadingSales || isLoadingStats}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button onClick={() => setShowSaleDialog(true)}>
            <Plus className="h-4 w-4 mr-2" />
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
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar por cliente..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      placeholder="Fecha inicio"
                      value={startDate}
                      onChange={(e) => setStartDate(e.target.value)}
                    />
                    <Input
                      type="date"
                      placeholder="Fecha fin"
                      value={endDate}
                      onChange={(e) => setEndDate(e.target.value)}
                    />
                    <Button variant="outline" onClick={handleDateFilterChange}>
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetFilters}>
                    Limpiar filtros
                  </Button>
                  <Button variant="outline" onClick={handleExport} disabled={isExportingSales}>
                    <Download className="h-4 w-4 mr-2" />
                    {isExportingSales ? 'Exportando...' : 'Exportar'}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales List */}
          <div className="grid gap-4">
            {isLoadingSales ? (
              Array.from({ length: 5 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : sales.length === 0 ? (
              <Card>
                <CardContent className="pt-6 text-center">
                  <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay ventas</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza registrando tu primera venta de productos
                  </p>
                  <Button onClick={() => setShowSaleDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nueva Venta
                  </Button>
                </CardContent>
              </Card>
            ) : (
              sales.map((sale) => (
                <Card key={sale.id} className="hover:shadow-md transition-shadow">
                  <CardContent className="pt-6">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-medium">
                            Venta #{sale.id.slice(-8)}
                          </h3>
                          <Badge variant="outline">
                            {format(new Date(sale.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}
                          </Badge>
                        </div>
                        <div className="space-y-1 text-sm text-muted-foreground">
                          {sale.patient ? (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              {sale.patient.firstName} {sale.patient.lastName}
                            </div>
                          ) : (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Venta directa
                            </div>
                          )}
                          <div className="flex items-center gap-1">
                            <Package className="h-3 w-3" />
                            {sale.items.length} producto(s)
                          </div>
                          {sale.soldBy && (
                            <div className="flex items-center gap-1">
                              <User className="h-3 w-3" />
                              Vendido por: {sale.soldBy.firstName} {sale.soldBy.lastName}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold">
                          S/ {sale.total.toFixed(2)}
                        </div>
                        {sale.discount > 0 && (
                          <div className="text-sm text-muted-foreground">
                            Desc: S/ {sale.discount.toFixed(2)}
                          </div>
                        )}
                        <div className="flex gap-1 mt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => viewSaleDetails(sale.id)}
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          {sale.payment && (
                            <Badge variant="default" className="text-xs">
                              {sale.payment.method}
                            </Badge>
                          )}
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center gap-2">
              <Button
                variant="outline"
                onClick={previousPage}
                disabled={currentPage === 1 || isLoadingSales}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={nextPage}
                disabled={!hasMore || isLoadingSales}
              >
                Siguiente
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          {isLoadingStats ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-1/2"></div>
                      <div className="h-8 bg-muted rounded w-3/4"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : stats ? (
            <>
              {/* Stats Cards */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                    <ShoppingCart className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{stats.totalSales}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                    <DollarSign className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">S/ {stats.totalRevenue.toFixed(2)}</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      S/ {stats.totalSales > 0 ? (stats.totalRevenue / stats.totalSales).toFixed(2) : '0.00'}
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Top Products */}
              <Card>
                <CardHeader>
                  <CardTitle>Productos Más Vendidos</CardTitle>
                  <CardDescription>
                    Los productos con mayor cantidad vendida
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {stats.topProducts.length === 0 ? (
                    <p className="text-muted-foreground text-center py-4">
                      No hay datos de productos vendidos
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {stats.topProducts.map((item, index) => (
                        <div key={item.productId} className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
                              <span className="text-sm font-medium">{index + 1}</span>
                            </div>
                            <div>
                              <p className="font-medium">{item.product?.name || 'Producto eliminado'}</p>
                              {item.product?.category && (
                                <p className="text-sm text-muted-foreground">{item.product.category.name}</p>
                              )}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-medium">{item._sum.quantity} {item.product?.unit}</p>
                            <p className="text-sm text-muted-foreground">
                              S/ {item._sum.subtotal?.toFixed(2)}
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          ) : (
            <Card>
              <CardContent className="pt-6 text-center">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">No hay estadísticas</h3>
                <p className="text-muted-foreground">
                  Las estadísticas aparecerán cuando tengas ventas registradas
                </p>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Create Sale Dialog */}
      <Dialog open={showSaleDialog} onOpenChange={(open) => {
        setShowSaleDialog(open);
        if (!open) {
          saleForm.reset();
        }
      }}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Nueva Venta de Productos</DialogTitle>
            <DialogDescription>
              Registra una nueva venta de productos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={saleForm.handleSubmit(handleCreateSale)} className="space-y-6">
            {/* Customer Selection */}
            <div>
              <Label htmlFor="patient">Cliente (Opcional)</Label>
              <Select
                value={saleForm.watch('patientId') || ''}
                onValueChange={(value) => saleForm.setValue('patientId', value)}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Seleccionar cliente o venta directa" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Venta directa (sin cliente)</SelectItem>
                  {patients.map((patient) => (
                    <SelectItem key={patient.id} value={patient.id}>
                      {patient.firstName} {patient.lastName} - {patient.phone}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Products */}
            <div>
              <div className="flex justify-between items-center mb-4">
                <Label>Productos</Label>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => append({ productId: '', quantity: 1, unitPrice: 0 })}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Agregar Producto
                </Button>
              </div>
              <div className="space-y-4">
                {fields.map((field, index) => (
                  <Card key={field.id}>
                    <CardContent className="pt-4">
                      <div className="grid grid-cols-12 gap-4 items-end">
                        <div className="col-span-5">
                          <Label>Producto</Label>
                          <Select
                            value={saleForm.watch(`items.${index}.productId`) || ''}
                            onValueChange={(value) => handleProductSelect(index, value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Seleccionar producto" />
                            </SelectTrigger>
                            <SelectContent>
                              {products.filter(p => p.isActive && p.stockQuantity > 0).map((product) => (
                                <SelectItem key={product.id} value={product.id}>
                                  {product.name} - Stock: {product.stockQuantity} {product.unit}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="col-span-2">
                          <Label>Cantidad</Label>
                          <Input
                            type="number"
                            min="1"
                            {...saleForm.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Precio Unit.</Label>
                          <Input
                            type="number"
                            step="0.01"
                            {...saleForm.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                          />
                        </div>
                        <div className="col-span-2">
                          <Label>Subtotal</Label>
                          <div className="h-10 px-3 py-2 border rounded-md bg-muted">
                            S/ {((saleForm.watch(`items.${index}.quantity`) || 0) * (saleForm.watch(`items.${index}.unitPrice`) || 0)).toFixed(2)}
                          </div>
                        </div>
                        <div className="col-span-1">
                          {fields.length > 1 && (
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => remove(index)}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <Separator />

            {/* Totals and Payment */}
            <div className="grid grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <Label htmlFor="discount">Descuento</Label>
                  <Input
                    id="discount"
                    type="number"
                    step="0.01"
                    min="0"
                    {...saleForm.register('discount', { valueAsNumber: true })}
                    placeholder="0.00"
                  />
                </div>
                <div>
                  <Label htmlFor="notes">Notas</Label>
                  <Textarea
                    id="notes"
                    {...saleForm.register('notes')}
                    placeholder="Notas adicionales sobre la venta"
                  />
                </div>
              </div>
              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>S/ {subtotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Descuento:</span>
                    <span>- S/ {watchedDiscount.toFixed(2)}</span>
                  </div>
                  <Separator />
                  <div className="flex justify-between text-lg font-bold">
                    <span>Total:</span>
                    <span>S/ {total.toFixed(2)}</span>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="createPayment"
                      {...saleForm.register('createPayment')}
                    />
                    <Label htmlFor="createPayment">Registrar pago</Label>
                  </div>
                  {saleForm.watch('createPayment') && (
                    <div>
                      <Label>Método de pago</Label>
                      <Select
                        value={saleForm.watch('paymentMethod') || ''}
                        onValueChange={(value) => saleForm.setValue('paymentMethod', value as any)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="CASH">Efectivo</SelectItem>
                          <SelectItem value="CARD">Tarjeta</SelectItem>
                          <SelectItem value="BANK_TRANSFER">Transferencia</SelectItem>
                          <SelectItem value="YAPE">Yape</SelectItem>
                          <SelectItem value="PLIN">Plin</SelectItem>
                          <SelectItem value="OTHER">Otro</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowSaleDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingSale || total <= 0}>
                {isCreatingSale ? 'Creando...' : 'Crear Venta'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Sale Detail Dialog */}
      <Dialog open={showSaleDetailDialog} onOpenChange={setShowSaleDetailDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalles de la Venta</DialogTitle>
          </DialogHeader>
          {selectedSale && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>ID de Venta</Label>
                  <p className="font-mono text-sm">{selectedSale.id}</p>
                </div>
                <div>
                  <Label>Fecha</Label>
                  <p>{format(new Date(selectedSale.createdAt), 'dd/MM/yyyy HH:mm', { locale: es })}</p>
                </div>
                <div>
                  <Label>Cliente</Label>
                  <p>
                    {selectedSale.patient 
                      ? `${selectedSale.patient.firstName} ${selectedSale.patient.lastName}`
                      : 'Venta directa'
                    }
                  </p>
                </div>
                <div>
                  <Label>Vendedor</Label>
                  <p>
                    {selectedSale.soldBy 
                      ? `${selectedSale.soldBy.firstName} ${selectedSale.soldBy.lastName}`
                      : 'No especificado'
                    }
                  </p>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Productos</Label>
                <div className="space-y-2 mt-2">
                  {selectedSale.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center p-2 border rounded">
                      <div>
                        <p className="font-medium">{item.product.name}</p>
                        <p className="text-sm text-muted-foreground">
                          {item.quantity} {item.product.unit} × S/ {item.unitPrice.toFixed(2)}
                        </p>
                      </div>
                      <p className="font-medium">S/ {item.subtotal.toFixed(2)}</p>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Subtotal:</span>
                  <span>S/ {selectedSale.subtotal.toFixed(2)}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between">
                    <span>Descuento:</span>
                    <span>- S/ {selectedSale.discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="flex justify-between text-lg font-bold">
                  <span>Total:</span>
                  <span>S/ {selectedSale.total.toFixed(2)}</span>
                </div>
              </div>

              {selectedSale.payment && (
                <>
                  <Separator />
                  <div>
                    <Label>Pago</Label>
                    <div className="flex justify-between items-center mt-2">
                      <span>Método: {selectedSale.payment.method}</span>
                      <Badge variant="default">{selectedSale.payment.status}</Badge>
                    </div>
                  </div>
                </>
              )}

              {selectedSale.notes && (
                <>
                  <Separator />
                  <div>
                    <Label>Notas</Label>
                    <p className="mt-2">{selectedSale.notes}</p>
                  </div>
                </>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
