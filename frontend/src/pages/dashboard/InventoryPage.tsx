import { useEffect, useState } from 'react';
import { useInventoryStore } from '@/stores/useInventoryStore';
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
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  Edit, 
  Trash2, 
  TrendingUp, 
  MoreHorizontal,
  Filter,
  RefreshCw
} from 'lucide-react';
import { toast } from 'sonner';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { CreateCategoryData, CreateProductData, UpdateProductData, StockAdjustmentData } from '@/services/inventory.service';

// Validation schemas
const categorySchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  isActive: z.boolean().default(true),
});

const productSchema = z.object({
  name: z.string().min(1, 'El nombre es requerido'),
  description: z.string().optional(),
  categoryId: z.string().optional(),
  sku: z.string().optional(),
  barcode: z.string().optional(),
  purchasePrice: z.number().min(0, 'El precio de compra debe ser mayor o igual a 0'),
  salePrice: z.number().min(0, 'El precio de venta debe ser mayor o igual a 0'),
  stockQuantity: z.number().int().min(0, 'La cantidad debe ser mayor o igual a 0').default(0),
  minStockAlert: z.number().int().min(0, 'La alerta de stock mínimo debe ser mayor o igual a 0').default(5),
  unit: z.string().default('unidad'),
  isActive: z.boolean().default(true),
});

const stockAdjustmentSchema = z.object({
  quantity: z.number().int(),
  reason: z.string().min(1, 'La razón es requerida'),
  type: z.enum(['PURCHASE', 'ADJUSTMENT', 'RETURN']),
});

export default function InventoryPage() {
  const {
    categories,
    products,
    selectedProduct,
    isLoadingCategories,
    isLoadingProducts,
    isCreatingCategory,
    isCreatingProduct,
    isUpdatingProduct,
    //isDeletingProduct,
    isAdjustingStock,
    categoriesError,
    productsError,
    searchQuery,
    categoryFilter,
    lowStockFilter,
    currentPage,
    totalPages,
    hasMore,
    fetchCategories,
    fetchProducts,
    createCategory,
    createProduct,
    updateProduct,
    deleteProduct,
    adjustStock,
    setSearchQuery,
    setCategoryFilter,
    setLowStockFilter,
    setSelectedProduct,
    clearErrors,
    resetFilters,
  } = useInventoryStore();

  const [showCategoryDialog, setShowCategoryDialog] = useState(false);
  const [showProductDialog, setShowProductDialog] = useState(false);
  const [showStockDialog, setShowStockDialog] = useState(false);
  const [editingProduct, setEditingProduct] = useState<any>(null);

  // Forms
  const categoryForm = useForm<CreateCategoryData>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: '',
      description: '',
      isActive: true,
    },
  });

  const productForm = useForm<CreateProductData>({
    resolver: zodResolver(productSchema),
    defaultValues: {
      name: '',
      description: '',
      categoryId: '',
      sku: '',
      barcode: '',
      purchasePrice: 0,
      salePrice: 0,
      stockQuantity: 0,
      minStockAlert: 5,
      unit: 'unidad',
      isActive: true,
    },
  });

  const stockForm = useForm<StockAdjustmentData>({
    resolver: zodResolver(stockAdjustmentSchema),
    defaultValues: {
      quantity: 0,
      reason: '',
      type: 'ADJUSTMENT',
    },
  });

  // Load data on mount
  useEffect(() => {
    fetchCategories();
    fetchProducts();
  }, []);

  // Reload products when filters change
  useEffect(() => {
    fetchProducts();
  }, [searchQuery, categoryFilter, lowStockFilter, currentPage]);

  // Handle category creation
  const handleCreateCategory = async (data: CreateCategoryData) => {
    try {
      await createCategory(data);
      toast.success('Categoría creada exitosamente');
      setShowCategoryDialog(false);
      categoryForm.reset();
    } catch (error) {
      toast.error('Error al crear categoría');
    }
  };

  // Handle product creation/update
  const handleSaveProduct = async (data: CreateProductData | UpdateProductData) => {
    try {
      if (editingProduct) {
        await updateProduct(editingProduct.id, data);
        toast.success('Producto actualizado exitosamente');
      } else {
        await createProduct(data as CreateProductData);
        toast.success('Producto creado exitosamente');
      }
      setShowProductDialog(false);
      setEditingProduct(null);
      productForm.reset();
    } catch (error) {
      toast.error(editingProduct ? 'Error al actualizar producto' : 'Error al crear producto');
    }
  };

  // Handle stock adjustment
  const handleStockAdjustment = async (data: StockAdjustmentData) => {
    if (!selectedProduct) return;
    
    try {
      await adjustStock(selectedProduct.id, data);
      toast.success('Stock ajustado exitosamente');
      setShowStockDialog(false);
      setSelectedProduct(null);
      stockForm.reset();
    } catch (error) {
      toast.error('Error al ajustar stock');
    }
  };

  // Handle product deletion
  const handleDeleteProduct = async (productId: string) => {
    if (!confirm('¿Estás seguro de que deseas eliminar este producto?')) return;
    
    try {
      await deleteProduct(productId);
      toast.success('Producto eliminado exitosamente');
    } catch (error) {
      toast.error('Error al eliminar producto');
    }
  };

  // Open edit dialog
  const openEditDialog = (product: any) => {
    setEditingProduct(product);
    productForm.reset({
      name: product.name,
      description: product.description || '',
      categoryId: product.categoryId || '',
      sku: product.sku || '',
      barcode: product.barcode || '',
      purchasePrice: product.purchasePrice,
      salePrice: product.salePrice,
      stockQuantity: product.stockQuantity,
      minStockAlert: product.minStockAlert,
      unit: product.unit,
      isActive: product.isActive,
    });
    setShowProductDialog(true);
  };

  // Open stock adjustment dialog
  const openStockDialog = (product: any) => {
    setSelectedProduct(product);
    stockForm.reset({
      quantity: 0,
      reason: '',
      type: 'ADJUSTMENT',
    });
    setShowStockDialog(true);
  };

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona productos, categorías y control de stock
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              fetchCategories(true);
              fetchProducts({}, true);
            }}
            disabled={isLoadingCategories || isLoadingProducts}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error messages */}
      {(categoriesError || productsError) && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{categoriesError || productsError}</span>
              <Button variant="ghost" size="sm" onClick={clearErrors}>
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <Tabs defaultValue="products" className="space-y-4">
        <TabsList>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="categories">Categorías</TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          {/* Filters and Actions */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div className="flex flex-col sm:flex-row gap-4 flex-1">
                  <div className="relative flex-1 max-w-sm">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
                    <Input
                      placeholder="Buscar productos..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Select value={categoryFilter || ''} onValueChange={(value) => setCategoryFilter(value || null)}>
                    <SelectTrigger className="w-[200px]">
                      <SelectValue placeholder="Todas las categorías" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="">Todas las categorías</SelectItem>
                      {categories.map((category) => (
                        <SelectItem key={category.id} value={category.id}>
                          {category.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="low-stock"
                      checked={lowStockFilter}
                      onCheckedChange={setLowStockFilter}
                    />
                    <Label htmlFor="low-stock">Solo stock bajo</Label>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" onClick={resetFilters}>
                    <Filter className="h-4 w-4 mr-2" />
                    Limpiar filtros
                  </Button>
                  <Button onClick={() => setShowProductDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingProducts ? (
              Array.from({ length: 6 }).map((_, i) => (
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
            ) : products.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay productos</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza agregando tu primer producto al inventario
                  </p>
                  <Button onClick={() => setShowProductDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Producto
                  </Button>
                </CardContent>
              </Card>
            ) : (
              products.map((product) => (
                <Card key={product.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <CardTitle className="text-lg">{product.name}</CardTitle>
                        {product.category && (
                          <CardDescription>{product.category.name}</CardDescription>
                        )}
                      </div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" size="sm">
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuItem onClick={() => openEditDialog(product)}>
                            <Edit className="h-4 w-4 mr-2" />
                            Editar
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => openStockDialog(product)}>
                            <TrendingUp className="h-4 w-4 mr-2" />
                            Ajustar Stock
                          </DropdownMenuItem>
                          <DropdownMenuItem 
                            onClick={() => handleDeleteProduct(product.id)}
                            className="text-destructive"
                          >
                            <Trash2 className="h-4 w-4 mr-2" />
                            Eliminar
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Stock:</span>
                        <div className="flex items-center gap-2">
                          <Badge 
                            variant={product.stockQuantity <= product.minStockAlert ? "destructive" : "secondary"}
                          >
                            {product.stockQuantity} {product.unit}
                          </Badge>
                          {product.stockQuantity <= product.minStockAlert && (
                            <AlertTriangle className="h-4 w-4 text-destructive" />
                          )}
                        </div>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-sm text-muted-foreground">Precio de venta:</span>
                        <span className="font-medium">S/ {product.salePrice.toFixed(2)}</span>
                      </div>
                      {product.sku && (
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-muted-foreground">SKU:</span>
                          <span className="text-sm font-mono">{product.sku}</span>
                        </div>
                      )}
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
                onClick={() => fetchProducts({ page: currentPage - 1 })}
                disabled={currentPage === 1 || isLoadingProducts}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {currentPage} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => fetchProducts({ page: currentPage + 1 })}
                disabled={!hasMore || isLoadingProducts}
              >
                Siguiente
              </Button>
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categorías de Productos</h2>
            <Button onClick={() => setShowCategoryDialog(true)}>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoadingCategories ? (
              Array.from({ length: 3 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="pt-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))
            ) : categories.length === 0 ? (
              <Card className="col-span-full">
                <CardContent className="pt-6 text-center">
                  <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                  <h3 className="text-lg font-medium mb-2">No hay categorías</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea categorías para organizar mejor tus productos
                  </p>
                  <Button onClick={() => setShowCategoryDialog(true)}>
                    <Plus className="h-4 w-4 mr-2" />
                    Crear Categoría
                  </Button>
                </CardContent>
              </Card>
            ) : (
              categories.map((category) => (
                <Card key={category.id}>
                  <CardHeader>
                    <CardTitle className="flex justify-between items-center">
                      {category.name}
                      <Badge variant={category.isActive ? "default" : "secondary"}>
                        {category.isActive ? "Activa" : "Inactiva"}
                      </Badge>
                    </CardTitle>
                    {category.description && (
                      <CardDescription>{category.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-muted-foreground">Productos:</span>
                      <span className="font-medium">{category._count?.products || 0}</span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Create Category Dialog */}
      <Dialog open={showCategoryDialog} onOpenChange={setShowCategoryDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Nueva Categoría</DialogTitle>
            <DialogDescription>
              Crea una nueva categoría para organizar tus productos
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={categoryForm.handleSubmit(handleCreateCategory)} className="space-y-4">
            <div>
              <Label htmlFor="name">Nombre *</Label>
              <Input
                id="name"
                {...categoryForm.register('name')}
                placeholder="Ej: Medicamentos, Equipos médicos"
              />
              {categoryForm.formState.errors.name && (
                <p className="text-sm text-destructive mt-1">
                  {categoryForm.formState.errors.name.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...categoryForm.register('description')}
                placeholder="Descripción opcional de la categoría"
              />
            </div>
            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                {...categoryForm.register('isActive')}
              />
              <Label htmlFor="isActive">Categoría activa</Label>
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowCategoryDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isCreatingCategory}>
                {isCreatingCategory ? 'Creando...' : 'Crear Categoría'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Create/Edit Product Dialog */}
      <Dialog open={showProductDialog} onOpenChange={(open) => {
        setShowProductDialog(open);
        if (!open) {
          setEditingProduct(null);
          productForm.reset();
        }
      }}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar Producto' : 'Nuevo Producto'}
            </DialogTitle>
            <DialogDescription>
              {editingProduct 
                ? 'Modifica los datos del producto' 
                : 'Agrega un nuevo producto al inventario'
              }
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={productForm.handleSubmit(handleSaveProduct)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="product-name">Nombre *</Label>
                <Input
                  id="product-name"
                  {...productForm.register('name')}
                  placeholder="Nombre del producto"
                />
                {productForm.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {productForm.formState.errors.name.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={productForm.watch('categoryId') || ''}
                  onValueChange={(value) => productForm.setValue('categoryId', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccionar categoría" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">Sin categoría</SelectItem>
                    {categories.filter(c => c.isActive).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">Descripción</Label>
              <Textarea
                id="description"
                {...productForm.register('description')}
                placeholder="Descripción del producto"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="sku">SKU</Label>
                <Input
                  id="sku"
                  {...productForm.register('sku')}
                  placeholder="Código SKU"
                />
              </div>
              <div>
                <Label htmlFor="barcode">Código de barras</Label>
                <Input
                  id="barcode"
                  {...productForm.register('barcode')}
                  placeholder="Código de barras"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="purchasePrice">Precio de compra *</Label>
                <Input
                  id="purchasePrice"
                  type="number"
                  step="0.01"
                  {...productForm.register('purchasePrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {productForm.formState.errors.purchasePrice && (
                  <p className="text-sm text-destructive mt-1">
                    {productForm.formState.errors.purchasePrice.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="salePrice">Precio de venta *</Label>
                <Input
                  id="salePrice"
                  type="number"
                  step="0.01"
                  {...productForm.register('salePrice', { valueAsNumber: true })}
                  placeholder="0.00"
                />
                {productForm.formState.errors.salePrice && (
                  <p className="text-sm text-destructive mt-1">
                    {productForm.formState.errors.salePrice.message}
                  </p>
                )}
              </div>
              <div>
                <Label htmlFor="unit">Unidad</Label>
                <Input
                  id="unit"
                  {...productForm.register('unit')}
                  placeholder="unidad, caja, ml, etc."
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stockQuantity">Stock inicial</Label>
                <Input
                  id="stockQuantity"
                  type="number"
                  {...productForm.register('stockQuantity', { valueAsNumber: true })}
                  placeholder="0"
                />
              </div>
              <div>
                <Label htmlFor="minStockAlert">Alerta de stock mínimo</Label>
                <Input
                  id="minStockAlert"
                  type="number"
                  {...productForm.register('minStockAlert', { valueAsNumber: true })}
                  placeholder="5"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="product-active"
                {...productForm.register('isActive')}
              />
              <Label htmlFor="product-active">Producto activo</Label>
            </div>

            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowProductDialog(false)}
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                disabled={isCreatingProduct || isUpdatingProduct}
              >
                {isCreatingProduct || isUpdatingProduct 
                  ? (editingProduct ? 'Actualizando...' : 'Creando...') 
                  : (editingProduct ? 'Actualizar' : 'Crear Producto')
                }
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Stock Adjustment Dialog */}
      <Dialog open={showStockDialog} onOpenChange={(open) => {
        setShowStockDialog(open);
        if (!open) {
          setSelectedProduct(null);
          stockForm.reset();
        }
      }}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Ajustar Stock</DialogTitle>
            <DialogDescription>
              {selectedProduct && (
                <>Producto: <strong>{selectedProduct.name}</strong> (Stock actual: {selectedProduct.stockQuantity} {selectedProduct.unit})</>
              )}
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={stockForm.handleSubmit(handleStockAdjustment)} className="space-y-4">
            <div>
              <Label htmlFor="type">Tipo de movimiento</Label>
              <Select
                value={stockForm.watch('type')}
                onValueChange={(value) => stockForm.setValue('type', value as any)}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="PURCHASE">Compra</SelectItem>
                  <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                  <SelectItem value="RETURN">Devolución</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="quantity">Cantidad</Label>
              <Input
                id="quantity"
                type="number"
                {...stockForm.register('quantity', { valueAsNumber: true })}
                placeholder="Cantidad (positiva para aumentar, negativa para disminuir)"
              />
              {stockForm.formState.errors.quantity && (
                <p className="text-sm text-destructive mt-1">
                  {stockForm.formState.errors.quantity.message}
                </p>
              )}
            </div>
            <div>
              <Label htmlFor="reason">Razón *</Label>
              <Textarea
                id="reason"
                {...stockForm.register('reason')}
                placeholder="Motivo del ajuste de stock"
              />
              {stockForm.formState.errors.reason && (
                <p className="text-sm text-destructive mt-1">
                  {stockForm.formState.errors.reason.message}
                </p>
              )}
            </div>
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setShowStockDialog(false)}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isAdjustingStock}>
                {isAdjustingStock ? 'Ajustando...' : 'Ajustar Stock'}
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
