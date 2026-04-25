import { useEffect } from 'react';
import { useInventoryStore } from '@/stores/useInventoryStore';
import { useInventoryHandlers } from '@/hooks/useInventoryHandlers';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Plus, RefreshCw, AlertTriangle, Package } from 'lucide-react';
import { ProductFilters } from '@/components/inventory/ProductFilters';
import { ProductCard } from '@/components/inventory/ProductCard';
import { CategoryCard } from '@/components/inventory/CategoryCard';
import { ProductDrawer } from '@/components/inventory/ProductDrawer';
import { CategoryDrawer } from '@/components/inventory/CategoryDrawer';
import { StockAdjustmentDrawer } from '@/components/inventory/StockAdjustmentDrawer';

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
    isAdjustingStock,
    categoriesError,
    productsError,
    searchQuery,
    categoryFilter,
    lowStockFilter,
    fetchCategories,
    fetchProducts,
    setSearchQuery,
    setCategoryFilter,
    setLowStockFilter,
    clearErrors,
    resetFilters,
  } = useInventoryStore();

  const {
    showCategoryDialog,
    setShowCategoryDialog,
    showProductDialog,
    setShowProductDialog,
    showStockDialog,
    setShowStockDialog,
    editingProduct,
    categoryForm,
    productForm,
    stockForm,
    handleCreateCategory,
    handleSaveProduct,
    handleStockAdjustment,
    handleDeleteProduct,
    openEditDialog,
    openStockDialog,
  } = useInventoryHandlers();

  useEffect(() => {
    fetchCategories();
    fetchProducts({}, true);
  }, []);

  useEffect(() => {
    fetchProducts({}, true);
  }, [searchQuery, categoryFilter, lowStockFilter, fetchProducts]);

  const handleRefresh = () => {
    fetchCategories(true);
    fetchProducts({}, true);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-3xl font-bold text-[rgb(var(--text-primary))] mb-2">
            Inventario
          </h1>
          <p className="text-[rgb(var(--text-secondary))]">
            Gestiona productos, categorías y control de stock
          </p>
        </div>
        <div className="mt-4 sm:mt-0 flex items-center gap-3">
          <Button
            variant="outline"
            onClick={handleRefresh}
            disabled={isLoadingCategories || isLoadingProducts}
            className="gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error messages */}
      {(categoriesError || productsError) && (
        <Card className="border-destructive bg-destructive/5">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertTriangle className="h-5 w-5 text-destructive" />
              <div className="flex-1">
                <p className="text-sm font-medium text-destructive">
                  {categoriesError || productsError}
                </p>
              </div>
              <Button variant="ghost" size="sm" onClick={clearErrors}>
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="products" className="space-y-6">
        <TabsList className="grid w-full max-w-md grid-cols-2 h-12">
          <TabsTrigger value="products" className="text-base">
            Productos
          </TabsTrigger>
          <TabsTrigger value="categories" className="text-base">
            Categorías
          </TabsTrigger>
        </TabsList>

        {/* Products Tab */}
        <TabsContent value="products" className="space-y-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center justify-between gap-4">
                <ProductFilters
                  searchQuery={searchQuery}
                  categoryFilter={categoryFilter}
                  lowStockFilter={lowStockFilter}
                  categories={categories}
                  onSearchChange={setSearchQuery}
                  onCategoryChange={setCategoryFilter}
                  onLowStockChange={setLowStockFilter}
                  onReset={resetFilters}
                />
                <Button onClick={() => setShowProductDialog(true)} className="gap-2 shrink-0">
                  <Plus className="h-4 w-4" />
                  Nuevo Producto
                </Button>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          {isLoadingProducts ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                      <div className="h-3 bg-muted rounded w-full"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : products.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay productos</h3>
                  <p className="text-muted-foreground mb-4">
                    Comienza agregando tu primer producto al inventario
                  </p>
                  <Button onClick={() => setShowProductDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Producto
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {products.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onEdit={openEditDialog}
                  onDelete={handleDeleteProduct}
                  onAdjustStock={openStockDialog}
                />
              ))}
            </div>
          )}
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-end">
            <Button onClick={() => setShowCategoryDialog(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Nueva Categoría
            </Button>
          </div>

          {isLoadingCategories ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardContent className="p-6">
                    <div className="space-y-3">
                      <div className="h-4 bg-muted rounded w-3/4"></div>
                      <div className="h-3 bg-muted rounded w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : categories.length === 0 ? (
            <Card>
              <CardContent className="p-12">
                <div className="flex flex-col items-center justify-center text-center">
                  <Package className="h-12 w-12 text-muted-foreground mb-4" />
                  <h3 className="text-lg font-semibold mb-2">No hay categorías</h3>
                  <p className="text-muted-foreground mb-4">
                    Crea categorías para organizar mejor tus productos
                  </p>
                  <Button onClick={() => setShowCategoryDialog(true)} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Crear Categoría
                  </Button>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {categories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={() => {/* TODO: Implement category edit */}}
                  onDelete={() => {/* TODO: Implement category delete */}}
                />
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>

      {/* Drawers */}
      <CategoryDrawer
        open={showCategoryDialog}
        onOpenChange={setShowCategoryDialog}
        form={categoryForm}
        isLoading={isCreatingCategory}
        onSubmit={handleCreateCategory}
      />

      <ProductDrawer
        open={showProductDialog}
        onOpenChange={(open) => {
          setShowProductDialog(open);
          if (!open) productForm.reset();
        }}
        form={productForm}
        categories={categories}
        isLoading={isCreatingProduct || isUpdatingProduct}
        isEditing={!!editingProduct}
        onSubmit={handleSaveProduct}
      />

      <StockAdjustmentDrawer
        open={showStockDialog}
        onOpenChange={setShowStockDialog}
        form={stockForm}
        product={selectedProduct}
        isLoading={isAdjustingStock}
        onSubmit={(data) => selectedProduct && handleStockAdjustment(data, selectedProduct)}
      />
    </div>
  );
}
