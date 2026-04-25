import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { CreateProductData, ProductCategory } from '@/services/inventory.service';
import { ScrollArea } from '@/components/ui/scroll-area';

interface ProductDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateProductData>;
  categories: ProductCategory[];
  isLoading: boolean;
  isEditing: boolean;
  onSubmit: (data: CreateProductData) => void;
}

export function ProductDrawer({
  open,
  onOpenChange,
  form,
  categories,
  isLoading,
  isEditing,
  onSubmit,
}: ProductDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-lg overflow-hidden p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>{isEditing ? 'Editar Producto' : 'Nuevo Producto'}</SheetTitle>
          <SheetDescription>
            {isEditing ? 'Actualiza la información del producto' : 'Agrega un nuevo producto al inventario'}
          </SheetDescription>
        </SheetHeader>
        
        <ScrollArea className="h-[calc(100vh-140px)]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-6">
            {/* Información Básica */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Información Básica
              </h3>
              
              <div>
                <Label htmlFor="name">Nombre del Producto *</Label>
                <Input
                  id="name"
                  {...form.register('name')}
                  placeholder="ej: Solución"
                  className="mt-1.5"
                />
                {form.formState.errors.name && (
                  <p className="text-sm text-destructive mt-1">
                    {form.formState.errors.name.message}
                  </p>
                )}
              </div>

              <div>
                <Label htmlFor="description">Descripción</Label>
                <Textarea
                  id="description"
                  {...form.register('description')}
                  placeholder="Descripción del producto"
                  rows={3}
                  className="mt-1.5"
                />
              </div>

              <div>
                <Label htmlFor="category">Categoría</Label>
                <Select
                  value={form.watch('categoryId') || 'none'}
                  onValueChange={(value) => form.setValue('categoryId', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin categoría</SelectItem>
                    {categories.filter(c => c.isActive).map((category) => (
                      <SelectItem key={category.id} value={category.id}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Códigos */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Códigos de Identificación
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="sku">SKU</Label>
                  <Input
                    id="sku"
                    {...form.register('sku')}
                    placeholder="Código SKU"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="barcode">Código de Barras</Label>
                  <Input
                    id="barcode"
                    {...form.register('barcode')}
                    placeholder="Código de barras"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Precios */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Precios
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="costPrice">Precio de Compra *</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      S/
                    </span>
                    <Input
                      id="costPrice"
                      type="number"
                      step="0.01"
                      {...form.register('costPrice', { valueAsNumber: true })}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                  {form.formState.errors.costPrice && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.costPrice.message}
                    </p>
                  )}
                </div>

                <div>
                  <Label htmlFor="salePrice">Precio de Venta *</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      S/
                    </span>
                    <Input
                      id="salePrice"
                      type="number"
                      step="0.01"
                      {...form.register('salePrice', { valueAsNumber: true })}
                      placeholder="0.00"
                      className="pl-10"
                    />
                  </div>
                  {form.formState.errors.salePrice && (
                    <p className="text-sm text-destructive mt-1">
                      {form.formState.errors.salePrice.message}
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Inventario */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Control de Inventario
              </h3>
              
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <Label htmlFor="currentStock">Stock Inicial</Label>
                  <Input
                    id="currentStock"
                    type="number"
                    {...form.register('currentStock', { valueAsNumber: true })}
                    placeholder="0"
                    className="mt-1.5"
                  />
                </div>

                <div>
                  <Label htmlFor="minStock">Alerta Stock Mínimo</Label>
                  <Input
                    id="minStock"
                    type="number"
                    {...form.register('minStock', { valueAsNumber: true })}
                    placeholder="5"
                    className="mt-1.5"
                  />
                </div>
              </div>
            </div>

            {/* Estado */}
            <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
              <div>
                <Label htmlFor="isActive" className="text-base font-medium">
                  Producto Activo
                </Label>
                <p className="text-sm text-muted-foreground mt-0.5">
                  El producto estará disponible para ventas
                </p>
              </div>
              <Switch
                id="isActive"
                checked={form.watch('isActive')}
                onCheckedChange={(checked) => form.setValue('isActive', checked)}
              />
            </div>

            {/* Footer con botones */}
            <div className="flex gap-3 pt-4 pb-6 sticky bottom-0 bg-background border-t -mx-6 px-6 mt-6">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
                className="flex-1"
                disabled={isLoading}
              >
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading ? 'Guardando...' : isEditing ? 'Actualizar' : 'Crear Producto'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
