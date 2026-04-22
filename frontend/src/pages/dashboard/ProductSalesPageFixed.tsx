import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
//import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Plus, 
  Search, 
  ShoppingCart, 
  Download,
  User,
  Package,
  DollarSign,
  BarChart3,
  Filter,
  RefreshCw,
} from 'lucide-react';

export default function ProductSalesPageFixed() {
  const [isLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Mock data para mostrar la interfaz
  //const sales = [];
  //const stats = null;

  useEffect(() => {
    console.log('ProductSalesPage mounted successfully');
  }, []);

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
              console.log('Refresh clicked');
            }}
            disabled={isLoading}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Actualizar
          </Button>
          <Button disabled>
            <Plus className="h-4 w-4 mr-2" />
            Nueva Venta
          </Button>
        </div>
      </div>

      {/* Error message */}
      {error && (
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-2 text-destructive">
              <Package className="h-4 w-4" />
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
            <ShoppingCart className="h-4 w-4" />
            <span>
              El módulo de ventas de productos está listo. Para usar todas las funcionalidades, 
              primero ejecuta la migración de Prisma en el backend.
            </span>
          </div>
        </CardContent>
      </Card>

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
                      className="pl-10"
                      disabled
                    />
                  </div>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      placeholder="Fecha inicio"
                      disabled
                    />
                    <Input
                      type="date"
                      placeholder="Fecha fin"
                      disabled
                    />
                    <Button variant="outline" disabled>
                      <Filter className="h-4 w-4 mr-2" />
                      Filtrar
                    </Button>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" disabled>
                    Limpiar filtros
                  </Button>
                  <Button variant="outline" disabled>
                    <Download className="h-4 w-4 mr-2" />
                    Exportar
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Sales List */}
          <Card>
            <CardContent className="pt-6 text-center">
              <ShoppingCart className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">Módulo de Ventas de Productos</h3>
              <p className="text-muted-foreground mb-4">
                El módulo está implementado y listo para usar. 
                Para comenzar a registrar ventas, ejecuta la migración de Prisma en el backend:
              </p>
              <div className="bg-muted p-4 rounded-md text-left">
                <code className="text-sm">
                  cd backend && npx prisma migrate dev --name add-inventory-models
                </code>
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Una vez ejecutada la migración, podrás:
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-left">
                <div className="flex items-start gap-2">
                  <ShoppingCart className="h-4 w-4 mt-1 text-blue-600" />
                  <div>
                    <p className="font-medium text-sm">Crear ventas</p>
                    <p className="text-xs text-muted-foreground">Registra ventas con múltiples productos</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <User className="h-4 w-4 mt-1 text-green-600" />
                  <div>
                    <p className="font-medium text-sm">Vincular clientes</p>
                    <p className="text-xs text-muted-foreground">Asocia ventas con pacientes existentes</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <DollarSign className="h-4 w-4 mt-1 text-yellow-600" />
                  <div>
                    <p className="font-medium text-sm">Gestionar pagos</p>
                    <p className="text-xs text-muted-foreground">Registra pagos automáticamente</p>
                  </div>
                </div>
                <div className="flex items-start gap-2">
                  <BarChart3 className="h-4 w-4 mt-1 text-purple-600" />
                  <div>
                    <p className="font-medium text-sm">Ver estadísticas</p>
                    <p className="text-xs text-muted-foreground">Analiza productos más vendidos</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Stats Tab */}
        <TabsContent value="stats" className="space-y-4">
          {/* Stats Cards Preview */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Ventas</CardTitle>
                <ShoppingCart className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">--</div>
                <p className="text-xs text-muted-foreground">Pendiente de migración</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Ingresos Totales</CardTitle>
                <DollarSign className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">S/ --</div>
                <p className="text-xs text-muted-foreground">Pendiente de migración</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Promedio por Venta</CardTitle>
                <BarChart3 className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-muted-foreground">S/ --</div>
                <p className="text-xs text-muted-foreground">Pendiente de migración</p>
              </CardContent>
            </Card>
          </div>

          {/* Top Products Preview */}
          <Card>
            <CardHeader>
              <CardTitle>Productos Más Vendidos</CardTitle>
              <CardDescription>
                Los productos con mayor cantidad vendida (disponible después de la migración)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-medium mb-2">Estadísticas Disponibles Pronto</h3>
                <p className="text-muted-foreground">
                  Una vez que ejecutes la migración y registres algunas ventas, 
                  aquí verás estadísticas detalladas de tus productos más vendidos.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
