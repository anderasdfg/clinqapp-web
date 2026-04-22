import { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';

export default function InventoryPageSimple() {
  useEffect(() => {
    console.log('InventoryPage mounted');
  }, []);

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Inventario</h1>
          <p className="text-muted-foreground">
            Gestiona productos, categorías y control de stock
          </p>
        </div>
        <Button>
          Nuevo Producto
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Productos</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Página de inventario funcionando correctamente</p>
        </CardContent>
      </Card>
    </div>
  );
}
