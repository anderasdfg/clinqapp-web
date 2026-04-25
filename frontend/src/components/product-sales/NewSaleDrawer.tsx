import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { UseFormReturn } from 'react-hook-form';
import { CreateProductSaleData } from '@/services/product-sales.service';
import { Product } from '@/services/inventory.service';
import { Patient } from '@/services/patients.service';
import { Plus, Trash2, ShoppingCart } from 'lucide-react';

interface NewSaleDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateProductSaleData>;
  fields: any[];
  products: Product[];
  patients: Patient[];
  isLoading: boolean;
  onSubmit: (data: CreateProductSaleData) => void;
  onProductSelect: (index: number, productId: string, products: Product[]) => void;
  onAddItem: () => void;
  onRemoveItem: (index: number) => void;
  subtotal: number;
  total: number;
}

export function NewSaleDrawer({
  open,
  onOpenChange,
  form,
  fields,
  products,
  patients,
  isLoading,
  onSubmit,
  onProductSelect,
  onAddItem,
  onRemoveItem,
  subtotal,
  total,
}: NewSaleDrawerProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-3xl lg:max-w-4xl overflow-hidden p-0">
        <SheetHeader className="px-6 pt-6 pb-4 border-b">
          <SheetTitle>Nueva Venta de Producto</SheetTitle>
          <SheetDescription>
            Registra una nueva venta de productos
          </SheetDescription>
        </SheetHeader>

        <ScrollArea className="h-[calc(100vh-140px)]">
          <form onSubmit={form.handleSubmit(onSubmit)} className="px-6 py-4 space-y-6">
            {/* Cliente */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Cliente (Opcional)
              </h3>
              
              <div>
                <Label htmlFor="patientId">Paciente</Label>
                <Select
                  value={form.watch('patientId') || 'none'}
                  onValueChange={(value) => form.setValue('patientId', value === 'none' ? undefined : value)}
                >
                  <SelectTrigger className="mt-1.5">
                    <SelectValue placeholder="Seleccionar paciente" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Sin paciente</SelectItem>
                    {patients.map((patient) => (
                      <SelectItem key={patient.id} value={patient.id}>
                        {patient.firstName} {patient.lastName}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Productos */}
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                  Productos
                </h3>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={onAddItem}
                  className="gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Agregar
                </Button>
              </div>

              <div className="space-y-3">
                {fields.map((field, index) => (
                  <div key={field.id} className="p-4 border rounded-lg space-y-3 bg-muted/30">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Producto {index + 1}</span>
                      {fields.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => onRemoveItem(index)}
                          className="h-8 w-8 p-0 text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                      <div className="md:col-span-7">
                        <Label>Producto *</Label>
                        <Select
                          value={form.watch(`items.${index}.productId`) || ''}
                          onValueChange={(value) => onProductSelect(index, value, products)}
                        >
                          <SelectTrigger className="mt-1.5">
                            <SelectValue placeholder="Seleccionar producto" />
                          </SelectTrigger>
                          <SelectContent>
                            {products.filter(p => p.isActive && p.currentStock > 0).map((product) => (
                              <SelectItem key={product.id} value={product.id}>
                                {product.name} - Stock: {product.currentStock}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        {form.formState.errors.items?.[index]?.productId && (
                          <p className="text-sm text-destructive mt-1">
                            {form.formState.errors.items[index]?.productId?.message}
                          </p>
                        )}
                      </div>

                      <div className="md:col-span-2">
                        <Label>Cantidad *</Label>
                        <Input
                          type="number"
                          min="1"
                          {...form.register(`items.${index}.quantity`, { valueAsNumber: true })}
                          className="mt-1.5"
                        />
                      </div>

                      <div className="md:col-span-3">
                        <Label>Precio Unit.</Label>
                        <div className="relative mt-1.5">
                          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                            S/
                          </span>
                          <Input
                            type="number"
                            step="0.01"
                            {...form.register(`items.${index}.unitPrice`, { valueAsNumber: true })}
                            className="pl-10"
                            readOnly
                          />
                        </div>
                      </div>
                    </div>

                    <div className="text-right text-sm">
                      <span className="text-muted-foreground">Subtotal: </span>
                      <span className="font-semibold">
                        {formatCurrency(
                          (form.watch(`items.${index}.quantity`) || 0) * 
                          (form.watch(`items.${index}.unitPrice`) || 0)
                        )}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <Separator />

            {/* Descuento y Totales */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Totales
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <Label htmlFor="discount">Descuento</Label>
                  <div className="relative mt-1.5">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      S/
                    </span>
                    <Input
                      id="discount"
                      type="number"
                      step="0.01"
                      min="0"
                      {...form.register('discount', { valueAsNumber: true })}
                      className="pl-10"
                    />
                  </div>
                </div>
              </div>

              <div className="p-4 rounded-lg bg-primary/5 border border-primary/20 space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Subtotal:</span>
                  <span className="font-medium">{formatCurrency(subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Descuento:</span>
                  <span className="font-medium text-destructive">
                    -{formatCurrency(form.watch('discount') || 0)}
                  </span>
                </div>
                <Separator />
                <div className="flex justify-between">
                  <span className="font-semibold">Total:</span>
                  <span className="text-xl font-bold text-primary">{formatCurrency(total)}</span>
                </div>
              </div>
            </div>

            {/* Pago */}
            <div className="space-y-4">
              <h3 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">
                Información de Pago
              </h3>

              <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
                <div>
                  <Label htmlFor="createPayment" className="text-base font-medium">
                    Registrar Pago
                  </Label>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    Crear registro de pago automáticamente
                  </p>
                </div>
                <Switch
                  id="createPayment"
                  checked={form.watch('createPayment')}
                  onCheckedChange={(checked) => form.setValue('createPayment', checked)}
                />
              </div>

              {form.watch('createPayment') && (
                <div>
                  <Label htmlFor="paymentMethod">Método de Pago</Label>
                  <Select
                    value={form.watch('paymentMethod') || 'CASH'}
                    onValueChange={(value: any) => form.setValue('paymentMethod', value)}
                  >
                    <SelectTrigger className="mt-1.5">
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

              <div>
                <Label htmlFor="notes">Notas (Opcional)</Label>
                <Textarea
                  id="notes"
                  {...form.register('notes')}
                  placeholder="Observaciones adicionales..."
                  rows={3}
                  className="mt-1.5"
                />
              </div>
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
              <Button 
                type="submit" 
                disabled={isLoading || fields.length === 0} 
                className="flex-1 gap-2"
              >
                <ShoppingCart className="h-4 w-4" />
                {isLoading ? 'Creando...' : 'Crear Venta'}
              </Button>
            </div>
          </form>
        </ScrollArea>
      </SheetContent>
    </Sheet>
  );
}
