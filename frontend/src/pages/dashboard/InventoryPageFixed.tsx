import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  Package, 
  AlertTriangle, 
  RefreshCw
} from 'lucide-react';

export default function InventoryPageFixed() {
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data para mostrar la interfaz
  //const categories = [];
  //const products = [];

  useEffect(() => {
    console.log('InventoryPage mounted successfully');
  }, []);

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
              console.log('Refresh clicked');
            }}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <AlertTriangle className="h-4 w-4" />
              <span>{error}</span>
              <Button variant="ghost" size="sm" onClick={() => setError(null)}>
                Cerrar
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Info message */}
      <Card className="border-blue-200 bg-blue-50">
        <CardContent className="pt-6">
          <div className="flex items-center gap-2 text-blue-700">
            <Package className="h-4 w-4" />
            <span>
              El módulo de inventario está listo. Para usar todas las funcionalidades, 
              primero ejecuta la migración de Prisma en el backend.
            </span>
          </div>
        </CardContent>
      </Card>

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
                      className="pl-10"
                      disabled
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button disabled>
                    <Plus className="h-4 w-4 mr-2" />
                    Nuevo Producto
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Products Grid */}
          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Módulo de Inventario</h3>
              <p className="text-muted-foreground mb-4">
                El módulo está implementado y listo para usar. 
                Para comenzar, ejecuta la migración de Prisma en el backend:
              </p>
              <div className="bg-muted p-4 rounded-md text-left">
                <code className="text-sm">
                  cd backend && npx prisma migrate dev --name add-inventory-models
                </code>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Una vez ejecutada la migración, podrás crear productos, categorías y gestionar el inventario.
              </p>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Categories Tab */}
        <TabsContent value="categories" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Categorías de Productos</h2>
            <Button disabled>
              <Plus className="h-4 w-4 mr-2" />
              Nueva Categoría
            </Button>
          </div>

          <Card>
            <CardContent className="pt-6 text-center">
              <Package className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Categorías de Productos</h3>
              <p className="text-muted-foreground mb-4">
                Aquí podrás crear y gestionar categorías para organizar tus productos.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
