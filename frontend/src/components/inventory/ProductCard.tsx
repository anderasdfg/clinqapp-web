import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/Button';
import { Edit, Trash2, TrendingUp, MoreHorizontal, Package, AlertTriangle } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Product } from '@/services/inventory.service';

interface ProductCardProps {
  product: Product;
  onEdit: (product: Product) => void;
  onDelete: (productId: string) => void;
  onAdjustStock: (product: Product) => void;
}

export function ProductCard({ product, onEdit, onDelete, onAdjustStock }: ProductCardProps) {
  const isLowStock = product.currentStock <= product.minStock;
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-PE', {
      style: 'currency',
      currency: 'PEN',
    }).format(amount);
  };

  return (
    <Card className={isLowStock ? 'border-orange-500' : ''}>
      <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
        <div className="flex-1">
          <CardTitle className="text-base font-semibold">{product.name}</CardTitle>
          {product.category && (
            <Badge variant="secondary" className="mt-1">
              {product.category.name}
            </Badge>
          )}
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onEdit(product)}>
              <Edit className="h-4 w-4 mr-2" />
              Editar
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => onAdjustStock(product)}>
              <TrendingUp className="h-4 w-4 mr-2" />
              Ajustar Stock
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => onDelete(product.id)}
              className="text-destructive"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Eliminar
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {product.description && (
            <p className="text-sm text-muted-foreground line-clamp-2">
              {product.description}
            </p>
          )}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Package className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-medium">
                Stock: {product.currentStock}
              </span>
              {isLowStock && (
                <Badge variant="destructive" className="gap-1">
                  <AlertTriangle className="h-3 w-3" />
                  Stock bajo
                </Badge>
              )}
            </div>
          </div>
          <div className="flex items-center justify-between pt-2 border-t">
            <div>
              <p className="text-xs text-muted-foreground">Precio Venta</p>
              <p className="text-lg font-bold text-primary">
                {formatCurrency(product.salePrice)}
              </p>
            </div>
            {product.sku && (
              <div className="text-right">
                <p className="text-xs text-muted-foreground">SKU</p>
                <p className="text-sm font-mono">{product.sku}</p>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
