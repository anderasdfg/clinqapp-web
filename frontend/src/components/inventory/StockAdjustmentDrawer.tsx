import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { UseFormReturn } from 'react-hook-form';
import { StockAdjustmentData, Product } from '@/services/inventory.service';
import { Badge } from '@/components/ui/badge';
import { Package, TrendingUp, TrendingDown } from 'lucide-react';

interface StockAdjustmentDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<StockAdjustmentData>;
  product: Product | null;
  isLoading: boolean;
  onSubmit: (data: StockAdjustmentData) => void;
}

export function StockAdjustmentDrawer({
  open,
  onOpenChange,
  form,
  product,
  isLoading,
  onSubmit,
}: StockAdjustmentDrawerProps) {
  if (!product) return null;

  const quantity = form.watch('quantity') || 0;
  const newStock = product.currentStock + quantity;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-6">
          <SheetTitle>Ajustar Stock</SheetTitle>
          <SheetDescription>
            {product.name}
          </SheetDescription>
        </SheetHeader>
        
        {/* Stock Actual */}
        <div className="mb-6 p-4 rounded-lg border bg-muted/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-5 w-5 text-muted-foreground" />
              <span className="text-sm font-medium">Stock Actual</span>
            </div>
            <Badge variant="secondary" className="text-base">
              {product.currentStock}
            </Badge>
          </div>
          
          {quantity !== 0 && (
            <div className="mt-3 pt-3 border-t flex items-center justify-between">
              <div className="flex items-center gap-2">
                {quantity > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-600" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-600" />
                )}
                <span className="text-sm font-medium">Nuevo Stock</span>
              </div>
              <Badge 
                variant={newStock < product.minStock ? 'destructive' : 'default'}
                className="text-base"
              >
                {newStock}
              </Badge>
            </div>
          )}
        </div>

        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="type">Tipo de Ajuste *</Label>
            <Select
              value={form.watch('type')}
              onValueChange={(value: any) => form.setValue('type', value)}
            >
              <SelectTrigger className="mt-1.5">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PURCHASE">📦 Compra</SelectItem>
                <SelectItem value="ADJUSTMENT">⚙️ Ajuste Manual</SelectItem>
                <SelectItem value="RETURN">↩️ Devolución</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div>
            <Label htmlFor="quantity">Cantidad a Ajustar *</Label>
            <Input
              id="quantity"
              type="number"
              {...form.register('quantity', { valueAsNumber: true })}
              placeholder="Ej: +10 para agregar, -5 para restar"
              className="mt-1.5"
            />
            <p className="text-xs text-muted-foreground mt-1.5">
              Usa números positivos para aumentar y negativos para disminuir
            </p>
            {form.formState.errors.quantity && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.quantity.message}
              </p>
            )}
          </div>

          <div>
            <Label htmlFor="reason">Motivo del Ajuste *</Label>
            <Textarea
              id="reason"
              {...form.register('reason')}
              placeholder="Ej: Compra de mercadería, inventario físico, producto dañado..."
              rows={4}
              className="mt-1.5"
            />
            {form.formState.errors.reason && (
              <p className="text-sm text-destructive mt-1">
                {form.formState.errors.reason.message}
              </p>
            )}
          </div>

          <div className="flex gap-3 pt-4">
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
              {isLoading ? 'Ajustando...' : 'Confirmar Ajuste'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
