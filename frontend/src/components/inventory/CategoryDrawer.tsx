import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { UseFormReturn } from 'react-hook-form';
import { CreateCategoryData } from '@/services/inventory.service';

interface CategoryDrawerProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  form: UseFormReturn<CreateCategoryData>;
  isLoading: boolean;
  onSubmit: (data: CreateCategoryData) => void;
}

export function CategoryDrawer({
  open,
  onOpenChange,
  form,
  isLoading,
  onSubmit,
}: CategoryDrawerProps) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent className="w-full sm:max-w-md">
        <SheetHeader className="pb-6">
          <SheetTitle>Nueva Categoría</SheetTitle>
          <SheetDescription>
            Crea una nueva categoría para organizar tus productos
          </SheetDescription>
        </SheetHeader>
        
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div>
            <Label htmlFor="name">Nombre de la Categoría *</Label>
            <Input
              id="name"
              {...form.register('name')}
              placeholder="ej: Tratamientos Capilares"
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
              placeholder="Descripción de la categoría"
              rows={4}
              className="mt-1.5"
            />
          </div>

          <div className="flex items-center justify-between p-4 rounded-lg border bg-muted/50">
            <div>
              <Label htmlFor="isActive" className="text-base font-medium">
                Categoría Activa
              </Label>
              <p className="text-sm text-muted-foreground mt-0.5">
                La categoría estará disponible para asignar a productos
              </p>
            </div>
            <Switch
              id="isActive"
              checked={form.watch('isActive')}
              onCheckedChange={(checked) => form.setValue('isActive', checked)}
            />
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
              {isLoading ? 'Creando...' : 'Crear Categoría'}
            </Button>
          </div>
        </form>
      </SheetContent>
    </Sheet>
  );
}
